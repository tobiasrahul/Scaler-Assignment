import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreateLectureForm } from "./CreateLectureForm";
import { Id } from "../../convex/_generated/dataModel";

interface CourseManagementProps {
  course: {
    _id: Id<"courses">;
    title: string;
    description: string;
    createdAt: number;
  };
}

export function CourseManagement({ course }: CourseManagementProps) {
  const [showLectureForm, setShowLectureForm] = useState(false);
  const courseWithLectures = useQuery(api.courses.getCourseWithLectures, { 
    courseId: course._id 
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{course.description}</p>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          {courseWithLectures?.lectures?.length || 0} lectures
        </span>
        <button
          onClick={() => setShowLectureForm(!showLectureForm)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          {showLectureForm ? "Cancel" : "Add Lecture"}
        </button>
      </div>

      {courseWithLectures?.lectures && courseWithLectures.lectures.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Lectures:</h4>
          <ul className="space-y-1">
            {courseWithLectures.lectures.map((lecture, index) => (
              <li key={lecture._id} className="text-sm text-gray-600 flex items-center">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-2">
                  {index + 1}
                </span>
                {lecture.title} 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  lecture.type === "quiz" 
                    ? "bg-orange-100 text-orange-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {lecture.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLectureForm && (
        <CreateLectureForm 
          courseId={course._id} 
          onSuccess={() => setShowLectureForm(false)}
        />
      )}
    </div>
  );
}
