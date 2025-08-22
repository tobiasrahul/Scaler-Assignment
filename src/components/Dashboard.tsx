import { useState } from "react";
import { InstructorDashboard } from "./InstructorDashboard";
import { StudentDashboard } from "./StudentDashboard";

interface DashboardProps {
  user: {
    email?: string;
    profile?: {
      _id: string;
      _creationTime: number;
      userId: string;
      role: "instructor" | "student";
      firstName: string;
      lastName: string;
    } | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  if (!user.profile) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.profile.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user.profile.role === "instructor" 
            ? "Manage your courses and create new content" 
            : "Continue your learning journey"}
        </p>
      </div>

      {user.profile.role === "instructor" ? (
        <InstructorDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}
