# Virtual Learning Platform (VLP)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

A comprehensive self-paced virtual learning platform similar to Udemy/Coursera, enhanced with cutting-edge AI-powered features for an immersive educational experience. Built with modern web technologies and integrated with advanced AI services for automated content generation, smart translations, and intelligent learning analytics.

## 👥 Team

This project was developed by a talented team of developers:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/shayankazi">
        <img src="https://github.com/shayankazi.png" width="100px;" alt="Shayan Kazi"/>
        <br />
        <sub><b>Shayan Kazi</b></sub>
      </a>
      <br />
      <a href="https://github.com/shayankazi" title="GitHub Profile">🔗 GitHub</a>
    </td>
    <td align="center">
      <a href="https://github.com/vanshtalyani">
        <img src="https://github.com/vanshtalyani.png" width="100px;" alt="Vansh Talyani"/>
        <br />
        <sub><b>Vansh Talyani</b></sub>
      </a>
      <br />
      <a href="https://github.com/vanshtalyani" title="GitHub Profile">🔗 GitHub</a>
    </td>
    <td align="center">
      <a href="https://github.com/tanishqchoudhary">
        <img src="https://github.com/tanishqchoudhary.png" width="100px;" alt="Tanishq Choudhary"/>
        <br />
        <sub><b>Tanishq Choudhary</b></sub>
      </a>
      <br />
      <a href="https://github.com/tanishqchoudhary" title="GitHub Profile">🔗 GitHub</a>
    </td>
  </tr>
</table>

## 📋 Table of Contents

- [👥 Team](#-team)
- [🚀 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🔧 Setup Instructions](#-setup-instructions)
- [🔑 Environment Variables](#-environment-variables)
- [📊 API Endpoints](#-api-endpoints)
- [🤖 AI Integration](#-ai-integration)
- [🚀 Deployment](#-deployment)
- [📈 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

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

## 🤝 Contributing

We welcome contributions to the Virtual Learning Platform! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Issues and Bug Reports
If you find a bug or have a feature request, please open an issue on GitHub with:
- Clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or code examples if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by the VLP Team</p>
  <p>
    <a href="https://github.com/shayankazi">Shayan Kazi</a> • 
    <a href="https://github.com/vanshtalyani">Vansh Talyani</a> • 
    <a href="https://github.com/tanishqchoudhary">Tanishq Choudhary</a>
  </p>
</div>
