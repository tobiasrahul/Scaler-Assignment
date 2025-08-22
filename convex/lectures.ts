import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new lecture (instructors only)
export const createLecture = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    type: v.union(v.literal("reading"), v.literal("quiz")),
    content: v.optional(v.string()),
    link: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    questions: v.optional(v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user owns the course
    const course = await ctx.db.get(args.courseId);
    if (!course || course.instructorId !== userId) {
      throw new Error("Not authorized to add lectures to this course");
    }

    // Get next order number
    const existingLectures = await ctx.db
      .query("lectures")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    const nextOrder = existingLectures.length + 1;

    return await ctx.db.insert("lectures", {
      courseId: args.courseId,
      title: args.title,
      type: args.type,
      order: nextOrder,
      content: args.content,
      link: args.link,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileType: args.fileType,
      questions: args.questions,
    });
  },
});

// Get lecture details
export const getLecture = query({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) return null;

    const userId = await getAuthUserId(ctx);
    if (!userId) return lecture;

    // For students, don't return correct answers for quizzes
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role === "student" && lecture.type === "quiz" && lecture.questions) {
      return {
        ...lecture,
        questions: lecture.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: undefined, // Hide correct answer from students
        })),
      };
    }

    return lecture;
  },
});
