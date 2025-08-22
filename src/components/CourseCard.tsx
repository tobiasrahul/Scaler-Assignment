import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CourseCardProps {
  course: {
    _id: Id<"courses">;
    title: string;
    description: string;
    instructor: string;
    createdAt: number;
    imageUrl?: string;
    category?: string;
    enrollmentCount: number;
  };
  onSelect: () => void;
}

export function CourseCard({ course, onSelect }: CourseCardProps) {
  const progress = useQuery(api.progress.getCourseProgress, { courseId: course._id });
  const courseWithLectures = useQuery(api.courses.getCourseWithLectures, { courseId: course._id });

  // Generate a consistent gradient background
  const courseHash = course._id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const gradients = [
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600", 
    "from-green-400 to-green-600",
    "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
  ];
  const gradient = gradients[Math.abs(courseHash) % gradients.length];

  // Get instructor initials with proper error handling
  const getInstructorInitials = (name: string): string => {
    if (!name || typeof name !== 'string') {
      return 'IN'; // Default initials
    }
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'IN'; // Default initials
    }
    
    const names = trimmedName.split(' ').filter(n => n.length > 0);
    
    if (names.length === 0) {
      return 'IN'; // Default initials
    } else if (names.length === 1) {
      return names[0][0].toUpperCase();
    } else {
      return (names + names[names.length - 1]).toUpperCase();
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
      {/* Course Image Header - Image Only */}
      <div className="h-48 relative overflow-hidden">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title || 'Course image'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const nextElement = target.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.classList.remove('hidden');
              }
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`}></div>
        )}
        
        {/* Fallback gradient background */}
        <div className={`hidden absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        
        <div className="absolute inset-0 bg-black/10"></div>
        
        
        {/* Floating elements for visual appeal */}
        <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
        <div className="absolute bottom-8 right-16 w-8 h-8 bg-white/20 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {course.title || 'Untitled Course'}
        </h3>
        
        {/* Instructor Info with Avatar */}
        <div className="flex items-center mb-4">
          
          <div className="flex-1 min-w-0">
            <span className="text-sm text-blue-600 font-medium truncate">
              By {course.instructor || 'Unknown Instructor'}
            </span>
          </div>
          <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
            {course.enrollmentCount || 0} {course.enrollmentCount === 1 ? 'student' : 'students'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description || 'No description available.'}
        </p>
        
        {/* Course Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center">
            <span className="mr-1">📚</span>
            <span>{courseWithLectures?.lectures?.length || 0} lessons</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">👥</span>
            <span>{course.enrollmentCount || 0} enrolled</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">🏆</span>
            <span>Certificate</span>
          </div>
        </div>
        
        {/* Progress Section */}
        {progress && progress.totalLectures > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Your Progress</span>
              <span className="font-semibold">{progress.progressPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress.progressPercentage || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.completedLectures || 0} of {progress.totalLectures || 0} lessons</span>
              <span>
                {(progress.progressPercentage || 0) === 100 ? "Completed! 🎉" : "In Progress"}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          {progress && (progress.completedLectures || 0) > 0 ? (
            <span className="flex items-center justify-center">
              <span className="mr-2">📚</span>
              Continue Learning
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">🚀</span>
              Start Course
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
