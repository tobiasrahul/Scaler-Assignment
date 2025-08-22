import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new course (instructors only)
export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is an instructor
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "instructor") {
      throw new Error("Only instructors can create courses");
    }

    return await ctx.db.insert("courses", {
      title: args.title,
      description: args.description,
      instructorId: userId,
      createdAt: Date.now(),
      imageUrl: args.imageUrl,
      category: args.category,
    });
  },
});

// Get all courses with enrollment counts (for students to browse)
export const getAllCourses = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    
    // Get instructor info and enrollment count for each course
    const coursesWithData = await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId);
        const instructorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", course.instructorId))
          .unique();
        
        // Get enrollment count
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();
        
        return {
          ...course,
          instructor: instructorProfile ? 
            `${instructorProfile.firstName} ${instructorProfile.lastName}` : 
            instructor?.email || "Unknown",
          enrollmentCount: enrollments.length,
        };
      })
    );

    return coursesWithData;
  },
});

// Get courses created by current instructor with stats
export const getInstructorCourses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_instructor", (q) => q.eq("instructorId", userId))
      .collect();

    // Add enrollment count and lecture count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get enrollment count
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        // Get lecture count
        const lectures = await ctx.db
          .query("lectures")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        return {
          ...course,
          enrollmentCount: enrollments.length,
          lectureCount: lectures.length,
        };
      })
    );

    return coursesWithStats;
  },
});

// Get course details with lectures
export const getCourseWithLectures = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort lectures by order
    lectures.sort((a, b) => a.order - b.order);

    return { ...course, lectures };
  },
});
