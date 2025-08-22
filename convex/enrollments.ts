import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Enroll in a course
export const enrollInCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if student is already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) => 
        q.eq("studentId", userId).eq("courseId", args.courseId))
      .unique();

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }

    return await ctx.db.insert("enrollments", {
      studentId: userId,
      courseId: args.courseId,
      enrolledAt: Date.now(),
    });
  },
});

// Get enrollment count for a course
export const getCourseEnrollmentCount = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    return enrollments.length;
  },
});

// Check if user is enrolled in a course
export const isEnrolledInCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) => 
        q.eq("studentId", userId).eq("courseId", args.courseId))
      .unique();

    return !!enrollment;
  },
});

// Get all courses a student is enrolled in
export const getStudentEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();

    // Get course details for each enrollment
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        return course;
      })
    );

    return courses.filter(Boolean);
  },
});
