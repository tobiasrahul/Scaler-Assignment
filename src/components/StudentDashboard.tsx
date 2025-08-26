import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CourseCard } from "./CourseCard";
import { CourseViewer } from "./CourseViewer";
import { Id } from "../../convex/_generated/dataModel";
import { isEnrolledInCourse } from "../../convex/enrollments";

export function StudentDashboard() {
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Always call all hooks first before any conditional returns
  const courses = useQuery(api.courses.getAllCourses);

  // Categories with better filtering logic
  const categories = [
    { id: "all", name: "All Courses", icon: "📚" },
    { id: "programming", name: "Programming", icon: "💻" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "science", name: "Science", icon: "🔬" },
  ];

  // Categorize courses based on keywords in title/description
  const getCourseCategory = (course: any) => {
    const text = (course.title + " " + course.description).toLowerCase();
    if (text.includes('programming') || text.includes('code') || text.includes('javascript') || text.includes('python') || text.includes('web') || text.includes('software')) {
      return 'programming';
    }
    if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('graphic') || text.includes('visual')) {
      return 'design';
    }
    if (text.includes('business') || text.includes('management') || text.includes('marketing') || text.includes('finance') || text.includes('entrepreneur')) {
      return 'business';
    }
    if (text.includes('science') || text.includes('physics') || text.includes('chemistry') || text.includes('biology') || text.includes('math')) {
      return 'science';
    }
    return 'general';
  };

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || !courses) return [];
    
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Show max 5 suggestions
  }, [courses, searchTerm]);

  // Filter courses based on search term and category
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    let filtered = courses;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => getCourseCategory(course) === selectedCategory);
    }
    
    return filtered;
  }, [courses, searchTerm, selectedCategory]);

  // Handle clicking outside search to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSelectCourse(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSelectCourse = (course: any) => {
    setSelectedCourseId(course._id);
    setSearchTerm("");
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // NOW we can do conditional rendering after all hooks have been called
  if (selectedCourseId) {
    return (
      <CourseViewer 
        courseId={selectedCourseId} 
        onBack={() => setSelectedCourseId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16 px-6 mb-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Discover Amazing Courses
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore our comprehensive collection of courses designed to help you learn, grow, and achieve your goals.
          </p>
          
          {/* Google-like Search Bar */}
          <div className="max-w-2xl mx-auto relative" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-4 text-gray-900 bg-white rounded-full border-0 focus:ring-2 focus:ring-white/50 shadow-lg text-lg focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {suggestions.map((course, index) => (
                  <button
                    key={course._id}
                    onClick={() => handleSelectCourse(course)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedSuggestionIndex === index ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                        {course.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {highlightMatch(course.title, searchTerm)}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {highlightMatch(course.description, searchTerm)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            By {highlightMatch(course.instructor, searchTerm)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* Show all results link */}
                {filteredCourses.length > suggestions.length && (
                  <button
                    onClick={() => {
                      setShowSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                    }}
                    className="w-full px-6 py-3 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-200 font-medium transition-colors"
                  >
                    View all {filteredCourses.length} results for "{searchTerm}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const categoryCount = category.id === "all" 
                ? courses?.length || 0
                : courses?.filter(course => getCourseCategory(course) === category.id).length || 0;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchTerm(""); // Clear search when changing category
                    setShowSuggestions(false);
                  }}
                  className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg hover:transform hover:scale-105"
                  }`}
                >
                  <span className="mr-2 text-lg">{category.icon}</span>
                  {category.name}
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                    {categoryCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📚</div>
              <div>
                <div className="text-2xl font-bold">{courses?.length || 0}</div>
                <div className="text-blue-100">Total Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👨‍🏫</div>
              <div>
                <div className="text-2xl font-bold">
                  {courses ? new Set(courses.map(c => c.instructor)).size : 0}
                </div>
                <div className="text-green-100">Expert Instructors</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎓</div>
              <div>
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-purple-100">Students</div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchTerm 
                ? `Search Results for "${searchTerm}" (${filteredCourses.length})`
                : selectedCategory === "all" 
                  ? "All Courses"
                  : `${categories.find(c => c.id === selectedCategory)?.name} Courses (${filteredCourses.length})`
              }
            </h2>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm 
                  ? "No courses found"
                  : selectedCategory === "all"
                    ? "No courses available yet"
                    : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} courses available`
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms or browse all courses." 
                  : selectedCategory !== "all"
                    ? "Try selecting a different category or browse all courses."
                    : "Check back soon for new courses!"
                }
              </p>
              <div className="flex gap-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View All Courses
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  onSelect={() => setSelectedCourseId(course._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of students who are already advancing their careers with our expert-led courses.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="font-semibold">✓ Lifetime Access</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="font-semibold">✓ Certificate of Completion</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="font-semibold">✓ Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
