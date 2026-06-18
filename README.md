# 🤖 Shul AI - Your Cute Multi-Purpose AI Assistant

**Shul** ek powerful aur cute AI assistant hai jo:
- 🖼️ **Image Generator** - AI se beautiful images create karta hai
- 🎥 **Video Generator** - AI-powered videos banata hai
- ✂️ **Video Editor** - Professional video editing tools
- 💬 **Smart Q&A** - Hindi-English (Hinglish) support ke saath instant answers
- 🎨 **Cute Interface** - Beautiful, user-friendly HTML interface

## ✨ Features

✅ **Image Generation** - Text se stunning images banao
✅ **Video Creation** - AI-powered video generation
✅ **Video Editing** - Trim, crop, speed, filters
✅ **Smart Chat** - Hinglish mein instant jawab
✅ **Mobile Responsive** - Sab devices par perfect
✅ **Real-time Processing** - Super fast results
✅ **Beautiful UI** - Cute aur modern design
✅ **No Signup Needed** - Direct use karo!

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3 (Modern animations & gradients)
- JavaScript (Vanilla JS)

**Backend:**
- Python Flask
- RESTful API
- CORS enabled

**AI Models Integration:**
- Stable Diffusion (Image Generation)
- FFmpeg (Video Processing)
- GPT/LLaMA (Q&A System)

**Database:**
- SQLite (Local)
- MongoDB (Production)

## 📋 Requirements

```bash
Python 3.8+
Flask 2.3+
Python-dotenv
Pillow
requests
```

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/52921/shul-ai.git
cd shul-ai
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Application
```bash
python app.py
```

### 5. Open in Browser
```
http://localhost:5000
```

## 💡 Usage Guide

### 💬 Chat with Shul
1. "Chat" tab pe click karo
2. Kuch bhi poocho (e.g., "Namaste!", "How are you?")
3. Shul instantly jawab dega!

### 🖼️ Generate Images
1. "Image" tab click karo
2. Image ka description likho (e.g., "A cute cat wearing sunglasses")
3. "Generate Image" button press karo
4. Beautiful image generate hoga!

### 🎥 Generate Videos
1. "Video" tab click karo
2. Video ka description likho
3. Duration select karo (5, 10, ya 15 seconds)
4. "Generate Video" press karo
5. AI aapke liye video banayega!

### ✂️ Edit Videos
1. "Editor" tab click karo
2. Video file upload karo
3. Edit option select karo (Trim, Speed, Crop, Filter)
4. "Edit Video" button press karo
5. Edited video download karo!

## 🔌 API Endpoints

```
POST /api/chat
Body: { "message": "Your message" }
Response: { "response": "Shul's answer" }

POST /api/generate-image
Body: { "prompt": "Image description" }
Response: { "image_url": "URL" }

POST /api/generate-video
Body: { "prompt": "Video description", "duration": 5 }
Response: { "video_url": "URL" }

POST /api/edit-video
Body: FormData with video file and option
Response: { "edited_video_url": "URL" }

GET /api/content-history
Response: { "content": [...] }
```

## 📁 Project Structure

```
shul-ai/
├── index.html           # Main HTML file
├── style.css           # Styling
├── script.js           # Frontend logic
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── .gitignore          # Git ignore rules
└── README.md           # Documentation
```

## 🎨 Customization

### Change Colors
Edit `style.css` - search for `#667eea` (purple) aur `#764ba2` (dark purple)

### Change Bot Name
Edit `script.js` - search for "Shul" and replace with your AI ka naam

### Add More Responses
Edit `script.js` `getShulResponse()` function

## 🚀 Deployment

### Heroku
```bash
heroku create shul-ai
git push heroku main
```

### AWS
```bash
aws elasticbeanstalk create-environment
```

### Google Cloud
```bash
gcloud app deploy
```

## 📸 Screenshots

```
🤖 Shul AI Home Screen
├── Chat Interface
├── Image Generator
├── Video Generator
└── Video Editor
```

## 🤝 Contributing

Contributions welcome! 🎉

1. Fork repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Created By

**Adhyan Sarthak** 🚀

## 💬 Support

Kisi bhi sawaal ke liye contact karo:
- GitHub Issues: Create issue on repo
- Email: adhyan@example.com

---

**Made with ❤️ and lots of ☕ by Adhyan Sarthak**

**⭐ Don't forget to star this repo! ⭐**