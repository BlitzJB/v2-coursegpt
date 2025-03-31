import React from 'react';
import { Course } from '../../types/course';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

type CourseCardProps = {
  course: Course;
  onClick: (courseFolder: string) => void;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const getStatusBadge = () => {
    if (course.initializing) {
      return <Badge variant="warning">Initializing</Badge>;
    } else if (course.in_progress) {
      return <Badge variant="info">In Progress</Badge>;
    } else if (course.complete) {
      return <Badge variant="success">Complete</Badge>;
    } else {
      return <Badge variant="error">Incomplete</Badge>;
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <Card onClick={() => onClick(course.folder)}>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
          <div className="flex space-x-2">
            {getStatusBadge()}
            {course.difficulty_level && (
              <Badge variant="secondary">{course.difficulty_level}</Badge>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {course.estimated_duration && (
            <span>{course.estimated_duration}</span>
          )}
          {course.timestamp && (
            <span>Created: {formatDate(course.timestamp)}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CourseCard; 