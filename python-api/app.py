from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import base64
from werkzeug.utils import secure_filename
import traceback

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024  # 30MB max file size

def text_to_bits(text):
    bits = bin(int.from_bytes(text.encode('utf-8'), 'big'))[2:]
    return bits.zfill(8 * ((len(bits) + 7) // 8))

def bits_to_text(bits):
    n = int(bits, 2)
    return n.to_bytes((n.bit_length() + 7) // 8, 'big').decode('utf-8', errors='ignore')

def encode_message(image_path, message, password):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image")
    
    full_message = f"{password}###DELIMITER###<MSG>{message}</MSG>###END###"
    message_bits = text_to_bits(full_message)
    message_length = len(message_bits)
    total_pixels = img.shape[0] * img.shape[1] * 3
    required_bits = 32 + message_length  # 32 bits for length
    
    if required_bits > total_pixels:
        raise ValueError(f"Message too long! Image can hold {(total_pixels - 32) // 8} characters max.")
    
    length_bits = format(message_length, '032b')
    all_bits = length_bits + message_bits
    
    flat_img = img.flatten()
    for i in range(len(all_bits)):
        flat_img[i] = (flat_img[i] & 0xFE) | int(all_bits[i])
    encoded_img = flat_img.reshape(img.shape)
    
    output_path = os.path.join(app.config['OUTPUT_FOLDER'], 'encrypted_image.png')
    
    # Save without compression flags (default OpenCV saving)
    cv2.imwrite(output_path, encoded_img)
    
    return output_path

def decode_message(image_path, password):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image")
    
    flat_img = img.flatten()
    length_bits = ''.join([str(flat_img[i] & 1) for i in range(32)])
    message_length = int(length_bits, 2)
    
    if message_length <= 0 or message_length > len(flat_img) - 32:
        raise ValueError("Invalid encoded data or corrupted image")
    
    message_bits = ''.join([str(flat_img[i] & 1) for i in range(32, 32 + message_length)])
    full_message = bits_to_text(message_bits)
    
    if '###DELIMITER###' not in full_message:
        raise ValueError("Invalid encoded data - delimiter not found")
    
    parts = full_message.split('###DELIMITER###')
    if len(parts) < 2:
        raise ValueError("Invalid message structure")
    
    stored_password = parts[0]
    remaining = parts[1]
    
    if stored_password != password:
        raise ValueError("Incorrect password")
    
    if '<MSG>' in remaining and '</MSG>' in remaining:
        start = remaining.index('<MSG>') + 5
        end = remaining.index('</MSG>')
        actual_message = remaining[start:end]
    else:
        raise ValueError("Message tags not found")
    
    return actual_message

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "Flask API is running"})

@app.route('/encode', methods=['POST'])
def encode():
    filepath = None
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        if 'message' not in request.form:
            return jsonify({"error": "No message provided"}), 400
        
        if 'password' not in request.form:
            return jsonify({"error": "No password provided"}), 400
        
        file = request.files['image']
        message = request.form['message']
        password = request.form['password']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        output_path = encode_message(filepath, message, password)
        
        with open(output_path, 'rb') as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            "success": True,
            "message": "Message encoded successfully",
            "image": img_base64,
            "filename": os.path.basename(output_path)
        })
    
    except Exception as e:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500

@app.route('/decode', methods=['POST'])
def decode():
    filepath = None
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        if 'password' not in request.form:
            return jsonify({"error": "No password provided"}), 400
        
        file = request.files['image']
        password = request.form['password']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        message = decode_message(filepath, password)
        
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            "success": True,
            "message": "Message decoded successfully",
            "decoded_message": message
        })
    
    except Exception as e:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
