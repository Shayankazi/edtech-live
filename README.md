# Virtual Learning Platform (VLP)

A self-paced virtual learning platform similar to Udemy/Coursera with AI-powered features.

## 🚀 Features

### Core Features
- **User Authentication**: Google OAuth, Email/Password login
- **Course Discovery**: Browse, search, filter courses by category
- **Video Learning**: Stream videos with AI-generated captions
- **Progress Tracking**: Track completion, certificates, performance
- **Assessments**: Quizzes, assignments, automated grading

### AI-Powered Features
- **Speech-to-Text**: Auto-generate captions using Whisper API
- **Smart Translation**: Multi-language caption support
- **AI Note Summarization**: Auto-generate lecture summaries using Gemini API
- **Performance Analytics**: AI-driven learning insights
- **Automated Quizzes**: Generate practice questions from content

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: React.js + Tailwind CSS
- **Video Processing**: FFmpeg + Whisper API
- **AI Services**: Google Gemini API, OpenAI Whisper
- **Authentication**: Passport.js + Google OAuth
- **File Storage**: Local storage (can be extended to AWS S3)

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Services   │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Gemini/      │
│                 │    │                 │    │    Whisper)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (MongoDB)     │
                       └─────────────────┘
```

## 📁 Project Structure
```
virtual-learning-platform/
├── backend/                 # Node.js API server
│   ├── config/             # Database & API configurations
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # AI & external services
│   └── uploads/           # Video & file storage
├── frontend/              # React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── utils/         # Helper functions
└── docs/                  # Documentation
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB
- FFmpeg (for video processing)

### Installation
1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up environment variables (see .env.example)
5. Start MongoDB service
6. Run backend: `npm run dev`
7. Run frontend: `npm start`

## 🔑 Environment Variables
```
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/vlp
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (instructor)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course

### AI Features
- `POST /api/ai/transcribe` - Generate video captions
- `POST /api/ai/summarize` - Generate lecture summary
- `POST /api/ai/translate` - Translate captions

## 🤖 AI Integration

### Free APIs Used
1. **OpenAI Whisper**: Speech-to-text transcription
2. **Google Gemini**: Text summarization and insights
3. **LibreTranslate**: Multi-language translation
4. **Google Translate API**: Backup translation service

### AI Workflow
1. Video Upload → FFmpeg processing → Audio extraction
2. Audio → Whisper API → Transcription/Captions
3. Captions → Translation API → Multi-language support
4. Transcript → Gemini API → Summary & Key Points
5. Content Analysis → Auto-generated Quizzes

## 🚀 Deployment
- Backend: Deploy to Heroku/Railway/DigitalOcean
- Frontend: Deploy to Vercel/Netlify
- Database: MongoDB Atlas
- File Storage: AWS S3 or Cloudinary

## 📈 Future Enhancements
- Live streaming capabilities
- Mobile app (React Native)
- Advanced analytics dashboard
- Peer-to-peer learning features
- Blockchain certificates
- AR/VR learning modules
