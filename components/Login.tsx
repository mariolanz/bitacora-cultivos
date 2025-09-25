
import React, { useState } from 'react';
import { useAuth } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password);
    if (user) {
      navigate('/');
    } else {
      setError('Usuario o contraseña inválidos');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-emerald-500 mb-2">Torus Ac.</h1>
            <p className="text-gray-400 mb-6">Sistema de Gestión de Cultivo</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors"
          >
            Iniciar Sesión
          </button>
           <div className="mt-4 text-center text-sm text-gray-500">
            <p>Admin: LUIS BA / LUBBana420</p>
            <p>Multi-rol: CRISTIAN / CRBana420</p>
            <p>Multi-rol: ARTURO / ARBana420</p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
