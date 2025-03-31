import React, { useState, useEffect } from 'react';
import { Course, Unit, Subunit, CourseContent } from '../../types/course';
import Container from '../ui/Container';
import CourseCard from './CourseCard';
import UnitCard from './UnitCard';
import SubunitCard from './SubunitCard';
import CourseContentComponent from './CourseContent';
import BackButton from '../navigation/BackButton';
import { useCourses, useUnits, useSubunits, useSubunitContent } from '../../hooks/useCourseData';

type ViewState = 
  | { type: 'courses' }
  | { type: 'units'; courseFolder: string }
  | { type: 'subunits'; courseFolder: string; unitFolder: string }
  | { type: 'content'; courseFolder: string; unitFolder: string; subunitFile: string };

export const CoursesViewer: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'courses' });
  
  // Use the appropriate hook based on the current view state
  const { 
    courses, 
    loading: coursesLoading, 
    error: coursesError 
  } = useCourses();
  
  const { 
    units, 
    loading: unitsLoading, 
    error: unitsError 
  } = viewState.type === 'units' || viewState.type === 'subunits' || viewState.type === 'content'
    ? useUnits(viewState.courseFolder)
    : { units: [], loading: false, error: null };
  
  const { 
    subunits, 
    loading: subunitsLoading, 
    error: subunitsError 
  } = viewState.type === 'subunits' || viewState.type === 'content'
    ? useSubunits(viewState.courseFolder, viewState.unitFolder)
    : { subunits: [], loading: false, error: null };
  
  const { 
    content, 
    loading: contentLoading, 
    error: contentError 
  } = viewState.type === 'content'
    ? useSubunitContent(viewState.courseFolder, viewState.unitFolder, viewState.subunitFile)
    : { content: null, loading: false, error: null };
  
  // Determine loading and error states
  const loading = 
    (viewState.type === 'courses' && coursesLoading) ||
    (viewState.type === 'units' && unitsLoading) ||
    (viewState.type === 'subunits' && subunitsLoading) ||
    (viewState.type === 'content' && contentLoading);
  
  const error = 
    (viewState.type === 'courses' && coursesError) ||
    (viewState.type === 'units' && unitsError) ||
    (viewState.type === 'subunits' && subunitsError) ||
    (viewState.type === 'content' && contentError);

  // Handler for course selection
  const handleCourseClick = (courseFolder: string) => {
    setViewState({ type: 'units', courseFolder });
  };

  // Handler for unit selection
  const handleUnitClick = (unitFolder: string) => {
    if (viewState.type === 'units') {
      setViewState({ 
        type: 'subunits', 
        courseFolder: viewState.courseFolder, 
        unitFolder 
      });
    }
  };

  // Handler for subunit selection
  const handleSubunitClick = (subunitFile: string) => {
    if (viewState.type === 'subunits') {
      setViewState({
        type: 'content',
        courseFolder: viewState.courseFolder,
        unitFolder: viewState.unitFolder,
        subunitFile
      });
    }
  };

  // Navigation handlers
  const goBackToCourses = () => {
    setViewState({ type: 'courses' });
  };

  const goBackToUnits = () => {
    if (viewState.type === 'subunits' || viewState.type === 'content') {
      setViewState({ type: 'units', courseFolder: viewState.courseFolder });
    }
  };

  const goBackToSubunits = () => {
    if (viewState.type === 'content') {
      setViewState({ 
        type: 'subunits', 
        courseFolder: viewState.courseFolder, 
        unitFolder: viewState.unitFolder 
      });
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="text-center py-10">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center py-10 text-red-500">
          Error: {error.message}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Courses View */}
      {viewState.type === 'courses' && (
        <>
          <h1 className="text-3xl font-bold mb-6">Courses</h1>
          {courses.length === 0 ? (
            <div className="text-center py-10">No courses available</div>
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
        </>
      )}

      {/* Units View */}
      {viewState.type === 'units' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Units</h1>
            <BackButton onClick={goBackToCourses} label="Back to Courses" />
          </div>
          {units.length === 0 ? (
            <div className="text-center py-10">No units available for this course</div>
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
        </>
      )}

      {/* Subunits View */}
      {viewState.type === 'subunits' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Lessons</h1>
            <BackButton onClick={goBackToUnits} label="Back to Units" />
          </div>
          {subunits.length === 0 ? (
            <div className="text-center py-10">No lessons available for this unit</div>
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
        </>
      )}

      {/* Content View */}
      {viewState.type === 'content' && content && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{content.frontmatter.title}</h1>
            <BackButton onClick={goBackToSubunits} label="Back to Lessons" />
          </div>
          <CourseContentComponent content={content} />
        </>
      )}
    </Container>
  );
};

export default CoursesViewer; 