import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import SubunitCard from '../components/courses/SubunitCard';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCourse, useUnits, useSubunits } from '../hooks/useCourseData';

const UnitDetailsPage: React.FC = () => {
  const { courseFolder, unitFolder } = useParams<{ courseFolder: string; unitFolder: string }>();
  const navigate = useNavigate();
  
  // Use custom hooks to fetch data
  const { course } = useCourse(courseFolder || '');
  const { units } = useUnits(courseFolder || '');
  const { subunits, loading, error } = useSubunits(courseFolder || '', unitFolder || '');
  
  // Find current unit
  const currentUnit = units.find(u => u.folder === unitFolder);
  const unitTitle = currentUnit 
    ? `Unit ${currentUnit.unit_number}: ${currentUnit.unit_title}` 
    : 'Unit Details';
  
  // Set document title
  useDocumentTitle(unitTitle);

  // Handle subunit click
  const handleSubunitClick = (subunitFile: string) => {
    navigate(`/courses/${courseFolder}/units/${unitFolder}/subunits/${subunitFile}`);
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
          Error loading subunits: {error.message}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Courses', link: '/' },
          { label: course?.title || 'Course', link: `/courses/${courseFolder}` },
          { label: unitTitle }
        ]}
      />
      
      <h1 className="text-3xl font-bold mb-6 dark:text-white">{unitTitle}</h1>
      
      {currentUnit?.unit_description && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow dark:shadow-gray-700 mb-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300">{currentUnit.unit_description}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 dark:text-white">Lessons</h2>
      {subunits.length === 0 ? (
        <div className="text-center py-10 dark:text-gray-300">No lessons available for this unit</div>
      ) : (
        <div className="space-y-4">
          {subunits.map((subunit, index) => (
            <SubunitCard 
              key={index} 
              subunit={subunit} 
              onClick={handleSubunitClick} 
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default UnitDetailsPage; 