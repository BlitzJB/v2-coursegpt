import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import UnitCard from '../components/courses/UnitCard';
import BackButton from '../components/navigation/BackButton';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCourse, useUnits } from '../hooks/useCourseData';

const CourseDetailsPage: React.FC = () => {
  const { courseFolder } = useParams<{ courseFolder: string }>();
  const navigate = useNavigate();
  
  // Use custom hooks to fetch data
  const { course, loading: courseLoading, error: courseError } = useCourse(courseFolder || '');
  const { units, loading: unitsLoading, error: unitsError } = useUnits(courseFolder || '');
  
  const loading = courseLoading || unitsLoading;
  const error = courseError || unitsError;
  
  // Set document title
  useDocumentTitle(course?.title || 'Course Details');

  // Handle unit click
  const handleUnitClick = (unitFolder: string) => {
    navigate(`/courses/${courseFolder}/units/${unitFolder}`);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
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
          Error loading course: {error.message}
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-8">
        <div className="text-center py-10 dark:text-white">Course not found</div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Courses', link: '/' },
          { label: course.title }
        ]}
      />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-2 md:mb-0 dark:text-white">{course.title}</h1>
        <BackButton onClick={handleBackClick} label="Back to Courses" />
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow dark:shadow-gray-700 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">About this course</h2>
          <p className="text-gray-700 dark:text-gray-300">{course.description}</p>
        </div>
        {course.difficulty_level && (
          <div className="mb-2">
            <span className="font-medium dark:text-white">Difficulty:</span> <span className="dark:text-gray-300">{course.difficulty_level}</span>
          </div>
        )}
        {course.estimated_duration && (
          <div>
            <span className="font-medium dark:text-white">Estimated Duration:</span> <span className="dark:text-gray-300">{course.estimated_duration}</span>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Units</h2>
      {units.length === 0 ? (
        <div className="text-center py-10 dark:text-gray-300">No units available</div>
      ) : (
        <div className="space-y-4">
          {units.map((unit, index) => (
            <UnitCard 
              key={index} 
              unit={unit} 
              onClick={handleUnitClick} 
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default CourseDetailsPage; 