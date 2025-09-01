import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIButton from './components/AIButton';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Upload from './pages/Upload';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-all duration-300 flex flex-col">
              <Routes>
                <Route path="/" element={
                  <>
                    <Navbar />
                    <main className="flex-1 min-h-0">
                      <Landing />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/*" element={
                  <div className="flex h-screen">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:flex lg:w-64 lg:flex-col">
                      <Navbar />
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col lg:ml-0">
                      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/flashcards"
                    element={
                      <ProtectedRoute>
                        <Flashcards />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute>
                        <Upload />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz"
                    element={
                      <ProtectedRoute>
                        <Quiz />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                      </main>
                      
                      {/* Mobile Bottom Navigation */}
                      <div className="lg:hidden">
                        <Navbar />
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
              <AIButton />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#374151',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;