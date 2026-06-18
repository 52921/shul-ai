# 🚀 Shul AI - Deployment Guide

## Local Development

```bash
# Setup
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run
python app.py

# Visit: http://localhost:5000
```

## Deployment Options

### 1. Heroku (Recommended for beginners)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create shul-ai-yourname

# Add Procfile
echo "web: python app.py" > Procfile

# Push to Heroku
git push heroku main

# Open app
heroku open
```

### 2. AWS EC2

```bash
# Launch EC2 instance
# Connect to instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Python
sudo yum install python3 python3-pip

# Clone repo
git clone https://github.com/52921/shul-ai.git
cd shul-ai

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with gunicorn
pip install gunicorn
gunicorn app:app --bind 0.0.0.0:5000
```

### 3. Google Cloud

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Initialize
gcloud init

# Deploy
gcloud app deploy
```

### 4. Docker (Advanced)

```dockerfile
# Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
# Build & Run
docker build -t shul-ai .
docker run -p 5000:5000 shul-ai
```

## Environment Variables

Create `.env` file:

```
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-secure-secret-key
```

## Database Setup

```bash
# Initialize database
python
>>> from app import app, db
>>> with app.app_context():
>>>     db.create_all()
```

## SSL/HTTPS

### Using Let's Encrypt

```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

## Monitoring

- Heroku: Built-in monitoring
- AWS: CloudWatch
- Google Cloud: Cloud Monitoring

## Troubleshooting

**Port already in use:**
```bash
lsof -i :5000
kill -9 PID
```

**Module not found:**
```bash
pip install -r requirements.txt
```

**Permission denied:**
```bash
chmod +x app.py
```

---

**Happy Deploying! 🚀**