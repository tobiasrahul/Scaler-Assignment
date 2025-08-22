import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Auto-enroll and mark reading lecture as complete
export const completeReading = mutation({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture || lecture.type !== "reading") {
      throw new Error("Invalid lecture");
    }

    // Auto-enroll student if not already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) => 
        q.eq("studentId", userId).eq("courseId", lecture.courseId))
      .unique();

    if (!existingEnrollment) {
      await ctx.db.insert("enrollments", {
        studentId: userId,
        courseId: lecture.courseId,
        enrolledAt: Date.now(),
      });
    }

    // Check if already completed
    const existingProgress = await ctx.db
      .query("progress")
      .withIndex("by_student_lecture", (q) => 
        q.eq("studentId", userId).eq("lectureId", args.lectureId))
      .unique();

    if (existingProgress) {
      return existingProgress._id;
    }

    return await ctx.db.insert("progress", {
      studentId: userId,
      courseId: lecture.courseId,
      lectureId: args.lectureId,
      completed: true,
      completedAt: Date.now(),
    });
  },
});

// Auto-enroll and submit quiz answers
export const submitQuiz = mutation({
  args: {
    lectureId: v.id("lectures"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture || lecture.type !== "quiz" || !lecture.questions) {
      throw new Error("Invalid quiz lecture");
    }

    // Auto-enroll student if not already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) => 
        q.eq("studentId", userId).eq("courseId", lecture.courseId))
      .unique();

    if (!existingEnrollment) {
      await ctx.db.insert("enrollments", {
        studentId: userId,
        courseId: lecture.courseId,
        enrolledAt: Date.now(),
      });
    }

    // Calculate score
    let correctAnswers = 0;
    lecture.questions.forEach((question, index) => {
      if (args.answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / lecture.questions.length) * 100);
    const passed = score >= 70;

    // Record quiz attempt
    await ctx.db.insert("quizAttempts", {
      studentId: userId,
      lectureId: args.lectureId,
      answers: args.answers,
      score,
      passed,
      attemptedAt: Date.now(),
    });

    // Update or create progress if passed
    if (passed) {
      const existingProgress = await ctx.db
        .query("progress")
        .withIndex("by_student_lecture", (q) => 
          q.eq("studentId", userId).eq("lectureId", args.lectureId))
        .unique();

      if (existingProgress) {
        await ctx.db.patch(existingProgress._id, {
          completed: true,
          score,
          completedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("progress", {
          studentId: userId,
          courseId: lecture.courseId,
          lectureId: args.lectureId,
          completed: true,
          score,
          completedAt: Date.now(),
        });
      }
    }

    return { score, passed, correctAnswers, totalQuestions: lecture.questions.length };
  },
});

// Auto-enroll when getting course progress
export const getCourseProgress = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const progress = await ctx.db
      .query("progress")
      .withIndex("by_student_course", (q) => 
        q.eq("studentId", userId).eq("courseId", args.courseId))
      .collect();

    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const totalLectures = lectures.length;
    const completedLectures = progress.filter(p => p.completed).length;

    return {
      totalLectures,
      completedLectures,
      progressPercentage: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
      lectureProgress: progress,
    };
  },
});

// Get quiz attempts for a lecture
export const getQuizAttempts = query({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_student_lecture", (q) => 
        q.eq("studentId", userId).eq("lectureId", args.lectureId))
      .collect();
  },
});
