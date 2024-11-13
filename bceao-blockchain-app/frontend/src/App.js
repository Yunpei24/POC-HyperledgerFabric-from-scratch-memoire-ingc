// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
//import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import ClientDetails from './components/ClientDetails';
import { useAuth } from './context/AuthContext';
import ActiveClientList from './components/ActiveClientList';
import AllClientsList from './components/AllClientsList';
import UpdateClient from './components/UpdateClient';

// Composant ProtectedRoute
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Composant layout pour éviter la répétition
function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Route racine - Clients actifs */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <ActiveClientList />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Route pour tous les clients */}
            <Route path="/all-clients" element={
              <ProtectedRoute>
                <Layout>
                  <AllClientsList />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Route pour nouveau client */}
            <Route path="/clients/new" element={
              <ProtectedRoute>
                <Layout>
                  <ClientForm />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Route pour voir les détails d'un client */}
            <Route path="/clients/:ubi" element={
              <ProtectedRoute>
                <Layout>
                  <ClientDetails />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Route pour éditer un client */}
            <Route path="/clients/:ubi/edit" element={
              <ProtectedRoute>
                <Layout>
                  <ClientForm />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Route pour mettre à jour un client */}
            <Route
              path="/clients/:ubi/update"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UpdateClient />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;