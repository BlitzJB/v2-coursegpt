import { useState, useEffect } from 'react';
import { Course, Unit, Subunit, CourseContent } from '../types/course';
import apiService from '../services/api';
import { mockCourses, getMockUnits, getMockSubunits, getMockContent } from '../mock/courseData';

// Check if we should use mock data (from .env)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Hook for fetching all courses
 */
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data: Course[];
        
        if (USE_MOCK_DATA) {
          // Use mock data
          data = mockCourses;
        } else {
          // Fetch from API
          data = await apiService.fetchCourses();
        }
        
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { courses, loading, error };
};

/**
 * Hook for fetching course details by folder
 */
export const useCourse = (courseFolder: string) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseFolder) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        let data: Course;
        
        if (USE_MOCK_DATA) {
          // Use mock data
          data = mockCourses.find(c => c.folder === courseFolder) as Course;
          if (!data) {
            throw new Error(`Course not found: ${courseFolder}`);
          }
        } else {
          // Fetch from API
          data = await apiService.fetchCourseByFolder(courseFolder);
        }
        
        setCourse(data);
      } catch (err) {
        console.error(`Error fetching course ${courseFolder}:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to fetch course ${courseFolder}`));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseFolder]);

  return { course, loading, error };
};

/**
 * Hook for fetching units for a course
 */
export const useUnits = (courseFolder: string) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseFolder) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        let data: Unit[];
        
        if (USE_MOCK_DATA) {
          // Use mock data
          data = getMockUnits(courseFolder);
        } else {
          // Fetch from API
          data = await apiService.fetchUnits(courseFolder);
        }
        
        setUnits(data);
      } catch (err) {
        console.error(`Error fetching units for course ${courseFolder}:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to fetch units for course ${courseFolder}`));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseFolder]);

  return { units, loading, error };
};

/**
 * Hook for fetching subunits for a unit
 */
export const useSubunits = (courseFolder: string, unitFolder: string) => {
  const [subunits, setSubunits] = useState<Subunit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseFolder || !unitFolder) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        let data: Subunit[];
        
        if (USE_MOCK_DATA) {
          // Use mock data
          data = getMockSubunits(courseFolder, unitFolder);
        } else {
          // Fetch from API
          data = await apiService.fetchSubunits(courseFolder, unitFolder);
        }
        
        setSubunits(data);
      } catch (err) {
        console.error(`Error fetching subunits for unit ${unitFolder}:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to fetch subunits for unit ${unitFolder}`));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseFolder, unitFolder]);

  return { subunits, loading, error };
};

/**
 * Hook for fetching content for a subunit
 */
export const useSubunitContent = (courseFolder: string, unitFolder: string, subunitFile: string) => {
  const [content, setContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseFolder || !unitFolder || !subunitFile) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        let data: CourseContent;
        
        if (USE_MOCK_DATA) {
          // Use mock data
          data = getMockContent(courseFolder, unitFolder, subunitFile);
        } else {
          // Fetch from API
          data = await apiService.fetchSubunitContent(courseFolder, unitFolder, subunitFile);
        }
        
        setContent(data);
      } catch (err) {
        console.error(`Error fetching content for subunit ${subunitFile}:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to fetch content for subunit ${subunitFile}`));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseFolder, unitFolder, subunitFile]);

  return { content, loading, error };
}; 