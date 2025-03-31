import { useEffect } from 'react';

/**
 * A custom hook to set the document title with an optional suffix
 * @param title The page title to set
 * @param suffix Optional suffix to append after the title
 */
const useDocumentTitle = (title: string, suffix: string = '| CourseGPT'): void => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} ${suffix}` : 'CourseGPT';
    
    // Clean up function to restore the previous title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

export default useDocumentTitle; 