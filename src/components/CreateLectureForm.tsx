import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface CreateLectureFormProps {
  courseId: Id<"courses">;
  onSuccess: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export function CreateLectureForm({ courseId, onSuccess }: CreateLectureFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"reading" | "quiz">("reading");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createLecture = useMutation(api.lectures.createLecture);

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    // Simulate file upload - in a real app, you'd upload to a service like Cloudinary, AWS S3, etc.
    // For now, we'll create a fake URL
    return new Promise((resolve) => {
      setTimeout(() => {
        const fakeUrl = `https://example.com/uploads/${file.name}`;
        resolve(fakeUrl);
      }, 1000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }

    if (type === "reading" && !content.trim() && !link.trim() && !file) {
      toast.error("Please provide content, a link, or upload a file for the reading");
      return;
    }

    if (type === "quiz" && questions.length === 0) {
      toast.error("Please add at least one question for the quiz");
      return;
    }

    if (type === "quiz") {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) {
          toast.error(`Please enter question ${i + 1}`);
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          toast.error(`Please fill all options for question ${i + 1}`);
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      let fileUrl = undefined;
      let fileName = undefined;
      let fileType = undefined;

      if (file) {
        toast.info("Uploading file...");
        fileUrl = await handleFileUpload(file);
        fileName = file.name;
        fileType = file.type;
      }

      await createLecture({
        courseId,
        title,
        type,
        content: type === "reading" ? content : undefined,
        link: type === "reading" ? link : undefined,
        fileUrl,
        fileName,
        fileType,
        questions: type === "quiz" ? questions : undefined,
      });
      toast.success("Lecture created successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create lecture");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    return '📎';
  };

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h4 className="text-xl font-bold text-gray-900 mb-6">Add New Lecture</h4>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lecture Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter lecture title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lecture Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "reading" | "quiz")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="reading">📖 Reading Material</option>
              <option value="quiz">📝 Quiz</option>
            </select>
          </div>
        </div>

        {type === "reading" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter the reading content or instructions"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                External Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://example.com (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload File (Image, PDF, Video, etc.)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,video/*,audio/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">📎</div>
                  <p className="text-gray-600 mb-2">Click to upload a file</p>
                  <p className="text-sm text-gray-500">PDF, Images, Videos, Documents</p>
                </label>
                
                {file && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center">
                      <span className="mr-2 text-2xl">{getFileIcon(file.type)}</span>
                      <span className="text-sm font-medium text-purple-800">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-3 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {type === "quiz" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-700">
                Quiz Questions
              </label>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                <span className="mr-1">➕</span>
                Add Question
              </button>
            </div>
            
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Question {qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
                  placeholder="Enter your question"
                />
                
                <div className="space-y-3">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                        className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2">🚀</span>
                Create Lecture
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
