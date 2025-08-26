import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreateCourseForm } from "./CreateCourseForm";
import { CourseManagement } from "./CourseManagement";

export function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState<"courses" | "create" | "analytics">("courses");
  const courses = useQuery(api.courses.getInstructorCourses);

  // Calculate total stats
  const totalStudents = courses?.reduce((sum, course) => sum + course.enrollmentCount, 0) || 0;
  const totalLectures = courses?.reduce((sum, course) => sum + course.lectureCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-800 text-white py-16 px-6 mb-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Instructor Dashboard
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Create, manage, and track your courses. Share your knowledge with students around the world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
          {[
            { id: "courses", name: "My Courses", icon: "📚", count: courses?.length || 0 },
            { id: "create", name: "Create Course", icon: "➕", count: null },
            
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:bg-white/70 hover:shadow-md"
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.name}
              {tab.count !== null && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 justify-center md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📚</div>
              <div>
                <div className="text-2xl font-bold">{courses?.length || 0}</div>
                <div className="text-purple-100">Total Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <div className="text-blue-100">Total Students</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📝</div>
              <div>
                <div className="text-2xl font-bold">{totalLectures}</div>
                <div className="text-green-100">Total Lectures</div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Content based on active tab */}
        {activeTab === "courses" && (
          <div>
            {courses?.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🎓</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Start Your Teaching Journey</h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  You haven't created any courses yet. Create your first course and start sharing your knowledge with students worldwide.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <span className="mr-2">➕</span>
                    New Course
                  </button>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {courses?.map((course) => (
                    <CourseManagement key={course._id} course={course} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="max-w-4xl mx-auto">
            <CreateCourseForm />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Analytics</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Detailed analytics and insights about your courses will be available here.</p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 text-center mt-12 mb-12">
          <h3 className="text-2xl font-bold mb-4">Inspire and Educate</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Join our community of expert instructors and make a difference in students' lives through quality education.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="font-semibold">✓ Unlimited Courses</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="font-semibold">✓ Student Analytics</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="font-semibold">✓ Revenue Sharing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
