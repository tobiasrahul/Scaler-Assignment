# Online Learning Platform

A modern, interactive online learning platform built with **React** and **Convex**. Features include course creation, interactive quizzes, file uploads, progress tracking, and real-time synchronization.

![Login/Signup Page](<images/Screenshot 2025-08-23 233720.png>)

![Student Dashboard](<images/Screenshot 2025-08-23 123852.png>)
![](<images/Screenshot 2025-08-23 123938.png>)

![Instructor Dashboard](<images/Screenshot 2025-08-23 124018.png>)
![](<images/Screenshot 2025-08-23 124037.png>)


## ✨ Features

### For Students
- 🔍 **Smart Course Discovery** - Search and filter courses by category
- 📊 **Progress Tracking** - Real-time progress monitoring with visual indicators  
- 📝 **Interactive Quizzes** - Multiple choice quizzes with instant feedback
- 📚 **Rich Content** - Text, links, and file attachments support
- 🎯 **Achievement System** - Course completion certificates

### For Instructors  
- 📋 **Course Management** - Create and organize courses with lectures
- 📎 **File Uploads** - Support for images, PDFs, videos, and documents
- 📈 **Analytics Dashboard** - Track student enrollment and progress
- 🎨 **Beautiful UI** - Modern, responsive interface for content creation

### Technical Features
- ⚡ **Real-time Sync** - Live updates across all users using Convex
- 🔐 **Secure Authentication** - Built-in auth with role-based access
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS
- 💾 **Type-safe Backend** - Full TypeScript backend with Convex

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **GitHub Account** (for Convex authentication)

### Installation

1. **Clone the repository**
```git clone https://github.com/tobiasrahul/Scaler-Assignment.git```
```cd Scaler-Assignment```

2. **Install Dependecies**
```npm install```

3. **Start development server**
```npm run dev```


This single command will:
- Set up your Convex backend (first-time setup)
- Start the React development server
- Open your browser to `http://localhost:5173`

### First-Time Setup

When you run `npm run dev` for the first time, Convex will:

1. **Prompt you to login** with GitHub
2. **Create a new project** in your Convex dashboard
3. **Generate environment variables** in `.env.local`
4. **Sync your backend functions** to the cloud
5. **Start both frontend and backend** servers

**Keep the terminal running** - it handles both frontend and backend!

## 🎯 Getting Started Guide

### 1. First Visit
- Open `http://localhost:5173`
- You'll see the beautiful landing page with sign-in options

### 2. Create Your Account
- Click sign-up and choose your role:
- **Student**: Browse and take courses
- **Instructor**: Create and manage courses

### 3. As a Student
- Browse available courses on the dashboard
- Use the search bar to find specific topics
- Click "Start Course" to begin learning
- Complete lectures and quizzes to track progress

### 4. As an Instructor
- Go to "Create Course" tab
- Add course title, description, category, and image
- Create lectures with text, links, or file uploads
- Build interactive quizzes with multiple choice questions
- Monitor student enrollment and progress

## 📁 Project Structure

## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.


## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend development servers |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npx convex dev` | Run only the backend (Convex) server |
| `npx convex deploy` | Deploy backend to production |

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development  
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Sonner** - Beautiful toast notifications

### Backend  
- **Convex** - Reactive backend-as-a-service
- **TypeScript** - End-to-end type safety
- **Real-time Database** - Live data synchronization
- **Built-in Authentication** - Secure user management
- **Cloud Functions** - Serverless backend logic

## 🎨 Key Features Walkthrough

### Beautiful Course Discovery
- Modern grid layout with course cards
- Advanced search with real-time filtering
- Category-based browsing with visual indicators
- Enrollment statistics and progress tracking

### Interactive Quiz System  
- Multiple choice questions with instant feedback
- Score calculation and pass/fail determination
- Retry functionality for failed attempts
- Visual progress indicators

### File Upload Support
- Support for images, PDFs, videos, documents
- Drag-and-drop interface for easy uploads
- File preview and download functionality
- Organized file management

### Real-time Progress Tracking
- Live progress bars and completion status
- Course-level and lecture-level tracking
- Visual indicators for completed content
- Achievement system for course completion

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## 🔐 Authentication & Roles

The app supports two user roles:

### Student Role
- Browse and search courses
- Enroll in courses automatically  
- Complete lectures and quizzes
- Track personal progress
- Retake failed quizzes

### Instructor Role  
- Create and manage courses
- Upload various file types
- Create interactive quizzes
- Monitor student enrollment
- View course analytics

## 🌐 Deployment

### Deploy to Production

1. **Deploy Backend**
```npx convex deploy```

2. **Build Frontend**
```npm run build```

### Environment Variables

Your `.env.local` file will contain:
CONVEX_DEPLOYMENT=prod:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Convex authentication issues**
```npx convex auth```


**Missing environment variables**
```npx convex dev --configure```


**TypeScript errors in _generated**
```npx convex dev --until-success```


Happy coding! 💻✨
