import React, { useEffect } from 'react';
import { useAuth } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import { UserRole } from '../types';

const SelectRole: React.FC = () => {
    const { currentUser, activeRole, setActiveRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        // If user is Admin, set role automatically and redirect.
        if (currentUser.roles.includes(UserRole.ADMIN)) {
            setActiveRole(UserRole.ADMIN);
            navigate('/');
            return;
        }

        // If user has only one role, set it automatically and redirect.
        if (currentUser.roles.length <= 1) {
            if (currentUser.roles.length === 1 && !activeRole) {
                setActiveRole(currentUser.roles[0]);
            }
            navigate('/');
            return;
        }
        
        // If a role is already active, redirect.
        if (activeRole) {
            navigate('/');
            return;
        }
        
        // Otherwise, show role selection for multi-role non-admin users.
    }, [currentUser, activeRole, setActiveRole, navigate]);

    if (!currentUser || activeRole || currentUser.roles.length <= 1 || currentUser.roles.includes(UserRole.ADMIN)) {
        // Render nothing while redirecting or if this component shouldn't be shown
        return null;
    }

    const handleRoleSelection = (role: UserRole) => {
        setActiveRole(role);
        navigate('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <Card className="w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Bienvenido, {currentUser.username}</h1>
                <p className="text-gray-400 mb-8">¿Cómo quieres trabajar hoy?</p>
                <div className="space-y-4">
                    {currentUser.roles.map((role) => (
                        <button
                            key={role}
                            onClick={() => handleRoleSelection(role)}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors text-lg"
                        >
                            Entrar como {role}
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SelectRole;
