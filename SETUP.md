# Virtual Learning Platform - Setup Guide

This guide will help you set up the Virtual Learning Platform (VLP) on your local development environment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **FFmpeg** (for video processing) - [Download here](https://ffmpeg.org/download.html)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/virtual-learning-platform.git
cd virtual-learning-platform
```

### 2. Install Dependencies

Install all dependencies for both backend and frontend:

```bash
npm run install-all
```

Or install them separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment

1. Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/virtual_learning_platform

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=500MB
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment

1. Create a `.env` file in the frontend directory:
```bash
cd frontend
touch .env
```

2. Add the following configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Virtual Learning Platform
```

### 4. Database Setup

1. **Start MongoDB:**
   - **Windows:** Start MongoDB service from Services or run `mongod`
   - **macOS:** `brew services start mongodb/brew/mongodb-community`
   - **Linux:** `sudo systemctl start mongod`

2. **Verify MongoDB is running:**
```bash
mongo --eval "db.adminCommand('ismaster')"
```

### 5. API Keys Setup

#### Required API Keys

1. **Google Gemini API Key** (for AI features):
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file as `GEMINI_API_KEY`

2. **OpenAI API Key** (for Whisper transcription):
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file as `OPENAI_API_KEY`

3. **Google OAuth** (optional, for Google login):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Add client ID and secret to your `.env` file

### 6. Start the Application

#### Option 1: Start Both Services Together
```bash
npm run dev
```

#### Option 2: Start Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Health Check:** http://localhost:5000/api/health

## 🔧 Development Tools

### Useful Commands

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm start

# Run backend tests
cd backend && npm test

# Build frontend for production
cd frontend && npm run build
```

### Database Management

```bash
# Connect to MongoDB shell
mongo

# Use the VLP database
use virtual_learning_platform

# View collections
show collections

# View users
db.users.find().pretty()

# View courses
db.courses.find().pretty()
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running:
- Windows: Start MongoDB service
- macOS: `brew services start mongodb/brew/mongodb-community`
- Linux: `sudo systemctl start mongod`

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

#### 3. FFmpeg Not Found
```
Error: ffmpeg not found
```
**Solution:** Install FFmpeg:
- **Windows:** Download from [FFmpeg website](https://ffmpeg.org/download.html) and add to PATH
- **macOS:** `brew install ffmpeg`
- **Linux:** `sudo apt-get install ffmpeg`

#### 4. API Key Issues
```
Error: API key not found or invalid
```
**Solution:** 
- Verify API keys are correctly set in `.env` file
- Ensure no extra spaces or quotes around keys
- Check API key permissions and quotas

#### 5. CORS Issues
```
Access to fetch at 'http://localhost:5000/api' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:** This should be handled automatically, but if issues persist:
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/server.js`

### Performance Tips

1. **Database Indexing:** MongoDB indexes are automatically created by the models
2. **File Upload:** Large files are handled with streaming
3. **Caching:** API responses are cached using React Query
4. **Image Optimization:** Use WebP format for course thumbnails

## 📱 Testing

### Create Test Data

1. **Register a test user:**
   - Go to http://localhost:3000/register
   - Create an account with role "instructor"

2. **Create a test course:**
   - Login and go to instructor dashboard
   - Create a new course with sample content

3. **Test AI features:**
   - Upload a short video to test transcription
   - Generate summaries and quizzes

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'

# Get courses
curl http://localhost:5000/api/courses
```

## 🚀 Next Steps

1. **Customize the platform:** Modify colors, branding, and features
2. **Add more AI features:** Implement additional AI-powered learning tools
3. **Deploy to production:** Follow the deployment guide
4. **Set up monitoring:** Add logging and analytics
5. **Scale the application:** Implement load balancing and caching

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Create a new issue with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

---

Happy coding! 🎉
