import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import CourseContentComponent from '../components/courses/CourseContent';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCourse, useUnits, useSubunits, useSubunitContent } from '../hooks/useCourseData';

const SubunitContentPage: React.FC = () => {
  const { courseFolder, unitFolder, subunitFile } = useParams<{ 
    courseFolder: string; 
    unitFolder: string;
    subunitFile: string;
  }>();
  const navigate = useNavigate();
  
  // Use custom hooks to fetch data
  const { course } = useCourse(courseFolder || '');
  const { units } = useUnits(courseFolder || '');
  const { subunits } = useSubunits(courseFolder || '', unitFolder || '');
  const { content, loading, error } = useSubunitContent(courseFolder || '', unitFolder || '', subunitFile || '');
  
  // Find current unit and subunit
  const currentUnit = units.find(u => u.folder === unitFolder);
  const currentSubunit = subunits.find(s => s.file === subunitFile);
  
  // Set document title
  useDocumentTitle(content?.frontmatter.title || currentSubunit?.title || 'Lesson Content');

  if (loading) {
    return (
      <Container className="py-8">
        <div className="text-center py-10">Loading content...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center py-10 text-red-500">
          Error loading content: {error.message}
        </div>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container className="py-8">
        <div className="text-center py-10">Content not found</div>
      </Container>
    );
  }

  const unitTitle = currentUnit 
    ? `Unit ${currentUnit.unit_number}: ${currentUnit.unit_title}` 
    : 'Unit';
  
  const subunitTitle = content.frontmatter.title || currentSubunit?.title || 'Lesson';

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Courses', link: '/' },
          { label: course?.title || 'Course', link: `/courses/${courseFolder}` },
          { label: unitTitle, link: `/courses/${courseFolder}/units/${unitFolder}` },
          { label: subunitTitle }
        ]}
      />
      
      <CourseContentComponent content={content} />
    </Container>
  );
};

export default SubunitContentPage; 