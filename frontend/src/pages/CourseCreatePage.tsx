import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import { createCourse } from '../api/course';

type FormState = {
  title: string;
  description: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
};

const CourseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    isSubmitting: false,
    error: null,
    success: false
  });

  // Set document title
  useDocumentTitle('Create New Course');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formState.title.trim()) {
      setFormState(prev => ({ ...prev, error: 'Please enter a course title' }));
      return;
    }

    // Set submitting state
    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      // Call the API to create a course
      await createCourse({
        title: formState.title,
        description: formState.description,
      });
      
      // Show success message and redirect after a delay
      setFormState(prev => ({ ...prev, isSubmitting: false, success: true }));
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      let errorMessage = 'Failed to create course. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setFormState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: errorMessage
      }));
    }
  };

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Courses', link: '/' },
          { label: 'Create New Course' }
        ]}
      />
      
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      
      {formState.success ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6 animate-pulse">
          Course creation initiated successfully! Redirecting to courses list...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {formState.error && (
            <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
              {formState.error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Course Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title for the course"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={formState.isSubmitting}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Course Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the course content, target audience, and learning goals"
              rows={5}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={formState.isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-500">
              If left empty, a generic description will be generated based on the course title.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={formState.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                formState.isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      )}
    </Container>
  );
};

export default CourseCreatePage; 