import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface LectureViewerProps {
  lectureId: Id<"lectures">;
  onBack: () => void;
  courseId: Id<"courses">;
}

export function LectureViewer({ lectureId, onBack, courseId }: LectureViewerProps) {
  const lecture = useQuery(api.lectures.getLecture, { lectureId });
  const progress = useQuery(api.progress.getCourseProgress, { courseId });
  const quizAttempts = useQuery(api.progress.getQuizAttempts, { lectureId });
  
  const completeReading = useMutation(api.progress.completeReading);
  const submitQuiz = useMutation(api.progress.submitQuiz);
  
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);

  const isCompleted = progress?.lectureProgress.some(p => p.lectureId === lectureId && p.completed) || false;

  // Initialize quiz answers or load previous attempt
  useEffect(() => {
    if (lecture?.type === "quiz" && lecture.questions) {
      if (quizAttempts && quizAttempts.length > 0) {
        // Load previous attempt
        const lastAttempt = quizAttempts[quizAttempts.length - 1];
        setSelectedAnswers(lastAttempt.answers);
        setShowResults(true);
        setQuizResult({
          score: lastAttempt.score,
          passed: lastAttempt.passed,
          correctAnswers: Math.round((lastAttempt.score / 100) * lastAttempt.answers.length),
          totalQuestions: lastAttempt.answers.length,
        });
      } else {
        // Initialize empty answers
        setSelectedAnswers(new Array(lecture.questions.length).fill(-1));
      }
    }
  }, [lecture, quizAttempts]);

  if (!lecture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleCompleteReading = async () => {
    try {
      await completeReading({ lectureId });
      toast.success("Lecture completed!");
    } catch (error) {
      toast.error("Failed to mark lecture as complete");
    }
  };

  const handleQuizSubmit = async () => {
    if (!lecture.questions || selectedAnswers.some(answer => answer === -1)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitQuiz({ lectureId, answers: selectedAnswers });
      setQuizResult(result);
      setShowResults(true);
      
      if (result.passed) {
        toast.success(`Quiz completed! Score: ${result.score}%`);
      } else {
        toast.error(`Quiz failed. Score: ${result.score}%. You need 70% to pass.`);
      }
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    if (lecture?.questions) {
      setSelectedAnswers(new Array(lecture.questions.length).fill(-1));
      setShowResults(false);
      setQuizResult(null);
    }
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
          Back to Course
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                lecture.type === "quiz" 
                  ? "bg-orange-100 text-orange-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {lecture.type === "quiz" ? "📝 Quiz" : "📖 Reading"}
              </span>
              {isCompleted && (
                <div className="text-green-600 font-medium">✓ Completed</div>
              )}
            </div>
          </div>

          {lecture.type === "reading" ? (
            <div className="space-y-6">
              {lecture.content && (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {lecture.content}
                  </div>
                </div>
              )}
              
              {lecture.link && (
                <div>
                  <h3 className="font-medium mb-2">External Resource:</h3>
                  <a
                    href={lecture.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {lecture.link}
                  </a>
                </div>
              )}

              {lecture.fileUrl && (
                <div>
                  <h3 className="font-medium mb-2">Attached File:</h3>
                  <a
                    href={lecture.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <span>📎</span>
                    <span>{lecture.fileName || 'View/Download File'}</span>
                  </a>
                </div>
              )}

              {!isCompleted && (
                <div className="pt-4 border-t">
                  <button
                    onClick={handleCompleteReading}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Mark as Complete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {showResults && quizResult ? (
                <div className="space-y-6">
                  {/* Simple Quiz Results */}
                  <div className={`p-6 rounded-xl text-center ${
                    quizResult.passed ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"
                  }`}>
                    <div className={`text-4xl font-bold mb-2 ${
                      quizResult.passed ? "text-green-600" : "text-red-600"
                    }`}>
                      {quizResult.score}%
                    </div>
                    <div className="text-xl font-semibold mb-2">
                      {quizResult.correctAnswers} out of {quizResult.totalQuestions} correct
                    </div>
                    <div className={`text-lg font-medium ${
                      quizResult.passed ? "text-green-700" : "text-red-700"
                    }`}>
                      {quizResult.passed ? "✓ Quiz Passed!" : "✗ Quiz Failed"}
                    </div>
                    {!quizResult.passed && (
                      <p className="text-sm text-red-600 mt-2">
                        You need 70% or higher to pass
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={resetQuiz}
                      className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quiz Questions */}
                  {lecture.questions?.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-4">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={oIndex}
                              checked={selectedAnswers[qIndex] === oIndex}
                              onChange={() => {
                                const newAnswers = [...selectedAnswers];
                                newAnswers[qIndex] = oIndex;
                                setSelectedAnswers(newAnswers);
                              }}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-6">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={isSubmitting || selectedAnswers.some(answer => answer === -1)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
