// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import ClientDetails from './components/ClientDetails';
import { useAuth } from './context/AuthContext';

// Composant ProtectedRoute
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <ClientList />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/clients/new" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <ClientForm />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/clients/:ubi" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <ClientDetails />
                  </main>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/clients/:ubi/edit" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <ClientForm />
                  </main>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;