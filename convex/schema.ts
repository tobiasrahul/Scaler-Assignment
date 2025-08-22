import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Extend users table with role information
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("instructor"), v.literal("student")),
    firstName: v.string(),
    lastName: v.string(),
  }).index("by_user", ["userId"]),

  // Courses created by instructors
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    instructorId: v.id("users"),
    createdAt: v.number(),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
  }).index("by_instructor", ["instructorId"]),

  // Course enrollments - new table to track student enrollments
  enrollments: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_student_course", ["studentId", "courseId"]),

  // Lectures within courses (reading or quiz)
  lectures: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    type: v.union(v.literal("reading"), v.literal("quiz")),
    order: v.number(),
    // For reading lectures
    content: v.optional(v.string()),
    link: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    // For quiz lectures
    questions: v.optional(v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.number(), // index of correct option
    }))),
  }).index("by_course", ["courseId", "order"]),

  // Student progress tracking
  progress: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    lectureId: v.id("lectures"),
    completed: v.boolean(),
    score: v.optional(v.number()), // for quiz lectures
    completedAt: v.optional(v.number()),
  })
    .index("by_student_course", ["studentId", "courseId"])
    .index("by_student_lecture", ["studentId", "lectureId"]),

  // Quiz attempts for detailed tracking
  quizAttempts: defineTable({
    studentId: v.id("users"),
    lectureId: v.id("lectures"),
    answers: v.array(v.number()), // selected option indices
    score: v.number(),
    passed: v.boolean(), // true if score >= 70%
    attemptedAt: v.number(),
  }).index("by_student_lecture", ["studentId", "lectureId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
