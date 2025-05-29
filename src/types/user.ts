import { Course } from './course';

export interface UserProfile {
  userId: string;
  name?: string; // Optional: if we decide to include user's name
  email?: string; // Optional: if we decide to include user's email
  courses: Course[]; // List of all courses associated with the user
  // Add other user-specific preferences or settings here if needed
}