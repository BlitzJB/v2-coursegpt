import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import CourseCard from '../components/courses/CourseCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCourses } from '../hooks/useCourseData';

const CoursesPage: React.FC = () => {
  const { courses, loading, error } = useCourses();
  const navigate = useNavigate();
  
  // Set document title
  useDocumentTitle('Courses');

  // Handle course click
  const handleCourseClick = (courseFolder: string) => {
    navigate(`/courses/${courseFolder}`);
  };

  // Handle create course click
  const handleCreateCourse = () => {
    navigate('/courses/create');
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="text-center py-10 dark:text-white">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center py-10 text-red-500 dark:text-red-400">
          Error loading courses: {error.message}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-2 md:mb-0 dark:text-white">Available Courses</h1>
        <button 
          onClick={handleCreateCourse}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Course
        </button>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No courses available</p>
          <button 
            onClick={handleCreateCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create your first course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course, index) => (
            <CourseCard 
              key={index} 
              course={course} 
              onClick={handleCourseClick} 
            />
          ))}
        </div>
      )}
    </Container>
  );
}

export default CoursesPage;
