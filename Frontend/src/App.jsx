import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlanTrip from './pages/PlanTrip';
import MyTrips from './pages/MyTrips';
import Team from './pages/Team';
import Explore from './pages/Explore';
import Calendar from './pages/Calendar';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import HomePage from './pages/Home'; 
import ExpenseTracker from './pages/ExpenseTracker'; 
import Maps from './pages/Maps'; 

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const appRoutes = [
  {
    path: "/",
    element: <PublicRoute><HomePage /></PublicRoute>,
  },
  {
    path: "/login",
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: "/register",
    element: <PublicRoute><Register /></PublicRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/plan",
    element: <ProtectedRoute><PlanTrip /></ProtectedRoute>,
  },
  {
    path: "/trips",
    element: <ProtectedRoute><MyTrips /></ProtectedRoute>,
  },
  {
    path: "/team",
    element: <ProtectedRoute><Team /></ProtectedRoute>,
  },
  
  {
    path: "/explore",
    element: <ProtectedRoute><Explore /></ProtectedRoute>,
  },
  {
    path: "/calendar",
    element: <ProtectedRoute><Calendar /></ProtectedRoute>,
  },
  {
    path: "/analytics",
    element: <ProtectedRoute><Announcements /></ProtectedRoute>,
  },
  {
    path: "/expense-tracker", 
    element: <ProtectedRoute><ExpenseTracker /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: "/maps",
    element: <ProtectedRoute><Maps /></ProtectedRoute>,
  },
];

const router = createBrowserRouter(appRoutes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;