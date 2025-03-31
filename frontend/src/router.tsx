import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import UnitDetailsPage from './pages/UnitDetailsPage';
import SubunitContentPage from './pages/SubunitContentPage';
import CourseCreatePage from './pages/CourseCreatePage';
import NotFoundPage from './pages/NotFoundPage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <CoursesPage />,
      },
      {
        path: 'courses/create',
        element: <CourseCreatePage />
      },
      {
        path: 'courses/:courseFolder',
        element: <CourseDetailsPage />
      },
      {
        path: 'courses/:courseFolder/units/:unitFolder',
        element: <UnitDetailsPage />
      },
      {
        path: 'courses/:courseFolder/units/:unitFolder/subunits/:subunitFile',
        element: <SubunitContentPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
];

export const router = createBrowserRouter(routes); 