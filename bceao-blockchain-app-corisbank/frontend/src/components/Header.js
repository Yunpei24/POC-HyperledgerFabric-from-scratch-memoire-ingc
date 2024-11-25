// Dans Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-bceao-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/bceao-logo.jpeg" alt="BCEAO" className="h-8 w-auto" />
            <span className="text-xl font-bold">BCEAO Blockchain</span>
          </Link>
          {user && (
            <div className="flex items-center space-x-8">
              <nav className="flex items-center space-x-4">
                <Link to="/" className="hover:text-bceao-secondary">
                  Clients Actifs
                </Link>
                <Link to="/all-clients" className="hover:text-bceao-secondary">
                  Tous les clients
                </Link>
                <Link
                  to="/clients/new"
                  className="bg-bceao-secondary text-bceao-primary px-4 py-2 rounded hover:bg-yellow-500"
                >
                  Nouveau Client
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-bceao-secondary text-xs">{user.organization}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;