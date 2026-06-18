from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'shul-ai-secret-key-2024'

# Store for messages and generated content
generated_content = []

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint - handles user messages"""
    try:
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Get response from Shul AI
        response = get_shul_response(message)
        
        return jsonify({
            'success': True,
            'message': message,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """Generate image from text prompt"""
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({'error': 'Empty prompt'}), 400
        
        # In production, use Stable Diffusion or OpenAI API
        # For now, return mock response
        image_url = f"https://via.placeholder.com/512x512?text={prompt[:20]}"
        
        generated_content.append({
            'type': 'image',
            'prompt': prompt,
            'url': image_url,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'prompt': prompt
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-video', methods=['POST'])
def generate_video():
    """Generate video from text prompt"""
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        duration = data.get('duration', 5)
        
        if not prompt:
            return jsonify({'error': 'Empty prompt'}), 400
        
        # In production, use video generation model
        # For now, return mock response
        video_url = f"https://via.placeholder.com/512x512?text=Video:{prompt[:15]}"
        
        generated_content.append({
            'type': 'video',
            'prompt': prompt,
            'duration': duration,
            'url': video_url,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'video_url': video_url,
            'prompt': prompt,
            'duration': duration
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/edit-video', methods=['POST'])
def edit_video():
    """Edit video"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        edit_option = request.form.get('option', 'trim')
        
        if video_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # In production, process video with FFmpeg
        # For now, return mock response
        edited_video_url = f"https://via.placeholder.com/512x512?text=Edited:{edit_option}"
        
        return jsonify({
            'success': True,
            'edited_video_url': edited_video_url,
            'option': edit_option,
            'original_file': video_file.filename
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/content-history', methods=['GET'])
def content_history():
    """Get history of generated content"""
    return jsonify({
        'success': True,
        'content': generated_content[-10:]  # Last 10 items
    })

def get_shul_response(message):
    """Generate Shul AI response to user message"""
    lower_msg = message.lower()
    
    responses = {
        'hello': 'Namaste! 👋 Main Shul hoon, tera cute AI assistant!',
        'hi': 'Hi there! 😊 Kaise ho?',
        'thanks': 'Welcome! 🙏 Mujhe help karna bilkul pasand hai!',
        'who are you': 'Main Shul hoon! 🤖 Ek cute AI assistant jo images, videos banata hoon aur sawalon ke jawab deta hoon!',
        'image': 'Image generator ke liye "Image" tab par click karo! 🖼️',
        'video': 'Video generator ke liye "Video" tab par click karo! 🎥',
        'edit': 'Video editor ke liye "Editor" tab par click karo! ✂️',
        'help': 'Main kya kar sakta hoon:\n📸 Images generate karna\n🎬 Videos banaa sakte ho\n✏️ Videos edit kar sakta hoon\n💬 Tere sawalon ke jawab de sakta hoon!',
        'what': 'Interesting question! 🤔 Aur bataao!',
        'how': 'Bilkul! Main tere sawaal ke jawab de sakta hoon!'
    }
    
    for key, response in responses.items():
        if key in lower_msg:
            return response
    
    return 'Interesting! 🤔 Aap kya puchna chahte ho? Mujhe batao - main help kar sakta hoon! 😊'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)