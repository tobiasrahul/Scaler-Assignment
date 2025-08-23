import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b shadow-lg px-4 h-16 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-600">Scaler Academy</h2>
        <Authenticated>
        <SignOutButton />
        </Authenticated>
      </header>

      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Unauthenticated>
        <div className="min-h-screen flex">
          {/* Left side - Content area with video (60%) */}
          <div className="w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden flex flex-col items-center justify-center p-8">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full animate-float-slow"></div>
              <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-400/20 rounded-full animate-float-medium"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full animate-float-fast"></div>
              <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-blue-300/20 rounded-full animate-float-slow"></div>
              <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-white/5 rounded-full animate-float-medium"></div>
            </div>
            
            {/* Welcome Text */}
            <div className="relative z-10 text-center text-white mb-8">
              <h1 className="text-6xl font-bold mb-6 leading-tight">
                Welcome to Scaler Academy
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-2xl">
                Your comprehensive online learning platform where knowledge meets innovation. 
                Create, learn, and grow with our interactive course system.
              </p>
            </div>

            {/* Video Element - Front and Center */}
            <div className="relative z-10 mb-8">
              <div className="w-96 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/images/video-poster.jpg"
                >
                  <source src="/images/login-bg-video.mp4" type="video/mp4" />
                  <source src="/images/login-bg-video.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Video Caption */}
              <div className="text-center mt-4">
                <p className="text-blue-200 text-sm">Experience Interactive Learning</p>
              </div>
            </div>
              
            {/* Feature Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm max-w-4xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="font-semibold mb-2">Interactive Courses</h3>
                <p className="text-blue-100">Engage with dynamic content and interactive quizzes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-blue-100">Monitor your learning journey with detailed analytics</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl mb-3">👨‍🏫</div>
                <h3 className="font-semibold mb-2">Expert Instructors</h3>
                <p className="text-blue-100">Learn from industry professionals and educators</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="relative z-10 mt-8">
              <div className="flex items-center justify-center space-x-8 text-blue-200">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm">1000+ Active Students</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm">50+ Expert Instructors</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm">200+ Courses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign in form (40%) */}
          <div className="w-2/5 bg-white  flex items-start justify-center  pt-20">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">📚</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
                <p className="text-gray-600">Sign in to your account or create a new one</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="max-w-6xl mx-auto p-4">
          {!currentUser?.profile ? (
            <div className="max-w-md mx-auto mt-20">
              <ProfileSetup />
            </div>
          ) : (
            <Dashboard user={currentUser} />
          )}
        </div>
      </Authenticated>
    </div>
  );
}
