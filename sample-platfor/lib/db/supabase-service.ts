import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for database operations only
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Store medical data for a user
 * 
 * @param auth0UserId The Auth0 user ID
 * @param data The medical data to store
 * @returns Supabase query result
 */
export async function createCourse(userId: string, courseData: { title: string; description?: string; level?: string; }) {
  console.log(`SupabaseService: Creating course for user ${userId}`);
  return supabase
    .from('courses')
    .insert({
      user_id: userId,
      title: courseData.title,
      description: courseData.description,
      level: courseData.level,
    })
    .select(); // Select the newly created course to get its ID and other data
}

export async function getCoursesByUserId(userId: string) {
  console.log(`SupabaseService: Getting courses for user ${userId}`);
  return supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId);
}

export async function getCourseById(courseId: string) {
  console.log(`SupabaseService: Getting course with ID ${courseId}`);
  return supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single(); // Use single() to get a single record
}

export async function updateCourse(courseId: string, userId: string, courseData: { title?: string; description?: string; level?: string; }) {
  console.log(`SupabaseService: Updating course ${courseId} for user ${userId}`);
  return supabase
    .from('courses')
    .update(courseData)
    .eq('id', courseId)
    .eq('user_id', userId);
}

export async function deleteCourse(courseId: string, userId: string) {
  console.log(`SupabaseService: Deleting course ${courseId} for user ${userId}`);
  return supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('user_id', userId);
}