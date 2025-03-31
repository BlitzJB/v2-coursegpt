import { Course, Unit, Subunit, CourseContent } from '../types/course';

// Set base URL for API requests
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch all available courses
 */
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    
    if (!response.ok) {
      throw new Error(`Error fetching courses: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    throw error;
  }
};

/**
 * Fetch course details by folder name
 */
export const fetchCourseByFolder = async (courseFolder: string): Promise<Course> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseFolder}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching course: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch course "${courseFolder}":`, error);
    throw error;
  }
};

/**
 * Fetch units for a specific course
 */
export const fetchUnits = async (courseFolder: string): Promise<Unit[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseFolder}/units`);
    
    if (!response.ok) {
      throw new Error(`Error fetching units: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch units for course "${courseFolder}":`, error);
    throw error;
  }
};

/**
 * Fetch subunits for a specific unit
 */
export const fetchSubunits = async (courseFolder: string, unitFolder: string): Promise<Subunit[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseFolder}/units/${unitFolder}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching subunits: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch subunits for unit "${unitFolder}":`, error);
    throw error;
  }
};

/**
 * Fetch content for a specific subunit
 */
export const fetchSubunitContent = async (
  courseFolder: string, 
  unitFolder: string, 
  subunitFile: string
): Promise<CourseContent> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseFolder}/units/${unitFolder}/subunits/${subunitFile}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching content: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch content for subunit "${subunitFile}":`, error);
    throw error;
  }
};

/**
 * API service object for export
 */
const apiService = {
  fetchCourses,
  fetchCourseByFolder,
  fetchUnits,
  fetchSubunits,
  fetchSubunitContent
};

export default apiService; 