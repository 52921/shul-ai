// Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabName = button.getAttribute('data-tab');
        document.getElementById(tabName).classList.add('active');
    });
});

// Chat Functionality
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const messageText = chatInput.value.trim();

    if (messageText === '') return;

    // Add user message to chat
    addMessageToChat(messageText, 'user');
    chatInput.value = '';

    // Simulate bot response (in real app, this would call backend)
    setTimeout(() => {
        const response = getShulResponse(messageText);
        addMessageToChat(response, 'bot');
    }, 800);
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = sender === 'bot' ? '🤖' : '👤';
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getShulResponse(message) {
    const lowerMessage = message.toLowerCase();

    const responses = {
        'hello': 'Namaste! 👋 Main Shul hoon, tera cute AI assistant!',
        'hi': 'Hi there! 😊 Kaise ho?',
        'thanks': 'Welcome! 🙏 Mujhe help karna bilkul pasand hai!',
        'who are you': 'Main Shul hoon! 🤖 Ek cute AI assistant jo images, videos banata hoon aur sawalon ke jawab deta hoon!',
        'image': 'Image generator ke liye "Image" tab par click karo! 🖼️',
        'video': 'Video generator ke liye "Video" tab par click karo! 🎥',
        'edit': 'Video editor ke liye "Editor" tab par click karo! ✂️',
        'help': 'Main kya kar sakta hoon:\n📸 Images generate karna\n🎬 Videos banaa sakte ho\n✏️ Videos edit kar sakta hoon\n💬 Tere sawalon ke jawab de sakta hoon!'
    };

    for (let key in responses) {
        if (lowerMessage.includes(key)) {
            return responses[key];
        }
    }

    return `Interesting! 🤔 Aap kya puchna chahte ho? Mujhe batao - main help kar sakta hoon! 😊`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Image Generator
function generateImage() {
    const prompt = document.getElementById('imagePrompt').value.trim();
    if (!prompt) {
        alert('Please describe your image! 📝');
        return;
    }

    const resultArea = document.getElementById('imageResult');
    resultArea.innerHTML = '<div class="loading"></div><p>Generating your beautiful image... ✨</p>';

    // Simulate image generation
    setTimeout(() => {
        resultArea.innerHTML = `
            <div>
                <div style="width: 300px; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5em;">
                    Generated: ${prompt}
                </div>
                <p style="margin-top: 15px; color: #666;">Download your image 📥</p>
            </div>
        `;
    }, 2000);
}

// Video Generator
function generateVideo() {
    const prompt = document.getElementById('videoPrompt').value.trim();
    const duration = document.getElementById('videoDuration').value;

    if (!prompt) {
        alert('Please describe your video! 📹');
        return;
    }

    const resultArea = document.getElementById('videoResult');
    resultArea.innerHTML = '<div class="loading"></div><p>Creating your amazing video... 🎬</p>';

    // Simulate video generation
    setTimeout(() => {
        resultArea.innerHTML = `
            <div>
                <div style="width: 100%; max-width: 500px; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em;">
                    🎥 ${prompt} (${duration}s)
                </div>
                <p style="margin-top: 15px; color: #666;">Download your video 📥</p>
            </div>
        `;
    }, 3000);
}

// Video Editor
function editVideo() {
    const videoFile = document.getElementById('videoFile').files[0];
    const editorOption = document.getElementById('editorOption').value;

    if (!videoFile) {
        alert('Please select a video file! 📹');
        return;
    }

    const resultArea = document.getElementById('editorResult');
    resultArea.innerHTML = '<div class="loading"></div><p>Editing your video with "' + editorOption + '"... ✂️</p>';

    // Simulate video editing
    setTimeout(() => {
        resultArea.innerHTML = `
            <div>
                <p style="margin-bottom: 15px; color: #666;">✅ Video edited successfully!</p>
                <div style="width: 100%; max-width: 500px; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em;">
                    ✂️ Edited: ${editorOption}
                </div>
                <p style="margin-top: 15px; color: #666;">Download edited video 📥</p>
            </div>
        `;
    }, 2500);
}

// Allow Enter key to send messages
document.getElementById('chatInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});