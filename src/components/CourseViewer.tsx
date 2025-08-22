import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LectureViewer } from "./LectureViewer";
import { Id } from "../../convex/_generated/dataModel";

interface CourseViewerProps {
  courseId: Id<"courses">;
  onBack: () => void;
}

export function CourseViewer({ courseId, onBack }: CourseViewerProps) {
  const [selectedLectureId, setSelectedLectureId] = useState<Id<"lectures"> | null>(null);
  const courseWithLectures = useQuery(api.courses.getCourseWithLectures, { courseId });
  const progress = useQuery(api.progress.getCourseProgress, { courseId });
  
  const enrollInCourse = useMutation(api.enrollments.enrollInCourse);

  // Auto-enroll when course is accessed
  useEffect(() => {
    if (courseId) {
      enrollInCourse({ courseId }).catch(() => {
        // Ignore if already enrolled
      });
    }
  }, [courseId, enrollInCourse]);

  // Loading state
  if (courseWithLectures === undefined || progress === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!courseWithLectures) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (selectedLectureId) {
    return (
      <LectureViewer
        lectureId={selectedLectureId}
        onBack={() => setSelectedLectureId(null)}
        courseId={courseId}
      />
    );
  }

  const isLectureCompleted = (lectureId: Id<"lectures">) => {
    return progress?.lectureProgress.some(p => p.lectureId === lectureId && p.completed) || false;
  };

  const canAccessLecture = (lectureIndex: number) => {
    if (lectureIndex === 0) return true;
    const previousLecture = courseWithLectures.lectures[lectureIndex - 1];
    return isLectureCompleted(previousLecture._id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{courseWithLectures.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{courseWithLectures.description}</p>
          
          {progress && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                <span className="text-2xl font-bold text-blue-600">{progress.progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progress.progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {progress.completedLectures} of {progress.totalLectures} lectures completed
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          
          {courseWithLectures.lectures.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Lectures Yet</h3>
              <p className="text-gray-600">This course doesn't have any lectures yet. Check back later!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseWithLectures.lectures.map((lecture, index) => {
                const completed = isLectureCompleted(lecture._id);
                const canAccess = canAccessLecture(index);
                
                return (
                  <div
                    key={lecture._id}
                    className={`group flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                      completed 
                        ? "bg-green-50 border-green-200 hover:bg-green-100" 
                        : canAccess 
                        ? "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300" 
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                        completed 
                          ? "bg-green-500" 
                          : canAccess 
                          ? "bg-blue-500" 
                          : "bg-gray-400"
                      }`}>
                        {completed ? "✓" : index + 1}
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${canAccess ? "text-gray-900" : "text-gray-500"}`}>
                          {lecture.title}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            lecture.type === "quiz" 
                              ? "bg-orange-100 text-orange-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {lecture.type === "quiz" ? "📝 Quiz" : "📖 Reading"}
                          </span>
                          {completed && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedLectureId(lecture._id)}
                      disabled={!canAccess}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        canAccess
                          ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {completed ? "Review" : canAccess ? "Start" : "🔒 Locked"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
