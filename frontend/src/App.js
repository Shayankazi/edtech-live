import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Public Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AuthCallbackPage from './pages/Auth/AuthCallbackPage';

// Private Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import MyCoursesPage from './pages/MyCourses/MyCoursesPage';
import WishlistPage from './pages/Wishlist/WishlistPage';
import CoursePlayerPage from './pages/CoursePlayer/CoursePlayerPage';

// Instructor Pages
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import CreateCoursePage from './pages/Instructor/CreateCoursePage';
import EditCoursePage from './pages/Instructor/EditCoursePage';
import CourseAnalyticsPage from './pages/Instructor/CourseAnalyticsPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

// Error Pages
import NotFoundPage from './pages/Error/NotFoundPage';
import UnauthorizedPage from './pages/Error/UnauthorizedPage';

// Route Guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'instructor' && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          
          {/* Auth Routes */}
          <Route path="login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          
          {/* Private Routes */}
          <Route path="dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="my-courses" element={
            <PrivateRoute>
              <MyCoursesPage />
            </PrivateRoute>
          } />
          <Route path="wishlist" element={
            <PrivateRoute>
              <WishlistPage />
            </PrivateRoute>
          } />
          
          {/* Instructor Routes */}
          <Route path="instructor" element={
            <InstructorRoute>
              <InstructorDashboard />
            </InstructorRoute>
          } />
          <Route path="instructor/courses/create" element={
            <InstructorRoute>
              <CreateCoursePage />
            </InstructorRoute>
          } />
          <Route path="instructor/courses/:id/edit" element={
            <InstructorRoute>
              <EditCoursePage />
            </InstructorRoute>
          } />
          <Route path="instructor/courses/:id/analytics" element={
            <InstructorRoute>
              <CourseAnalyticsPage />
            </InstructorRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* Error Routes */}
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Course Player Route (Full Screen) */}
        <Route path="learn/:courseId" element={
          <PrivateRoute>
            <CoursePlayerPage />
          </PrivateRoute>
        } />
        <Route path="learn/:courseId/:sectionId/:lessonId" element={
          <PrivateRoute>
            <CoursePlayerPage />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
