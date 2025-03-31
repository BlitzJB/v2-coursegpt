import { API_BASE_URL } from '../services/api';

type CreateCourseData = {
  title: string;
  description: string;
};

/**
 * Creates a new course by sending a request to the API
 */
export const createCourse = async (data: CreateCourseData): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error creating course: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create course:', error);
    throw error;
  }
}; 