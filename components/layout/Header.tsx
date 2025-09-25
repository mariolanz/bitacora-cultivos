

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth, useCrops, useConfirmation, useNotifications, useLocations } from '../../context/AppProvider';
import { useNavigate } from 'react-router-dom';

const NotificationCenter: React.FC = () => {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) { // When opening and there are unread notifications
             setTimeout(() => {
                notifications.filter(n => !n.read).forEach(n => markAsRead(n.id));
            }, 1000); // Mark as read after a short delay
        }
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none" aria-label="Abrir notificaciones">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-3 font-bold text-white border-b border-gray-700">Notificaciones</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <li key={n.id} className={`border-b border-gray-700 last:border-b-0 hover:bg-gray-700 ${!n.read ? 'bg-emerald-900/30' : ''}`}>
                                <div className="p-3 text-sm text-gray-300">
                                    <p className={`font-semibold ${n.type === 'warning' ? 'text-yellow-400' : 'text-emerald-400'}`}>{n.type === 'warning' ? 'Alerta' : 'Información'}</p>
                                    <p>{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-gray-500">No hay notificaciones.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
  onMenuButtonClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuButtonClick }) => {
  const { currentUser, logout } = useAuth();
  const { activeCrop } = useCrops();
  const { locations } = useLocations();
  const { showConfirmation } = useConfirmation();
  const navigate = useNavigate();

  const handleLogout = () => {
      showConfirmation("¿Estás seguro de que quieres cerrar sesión?", () => {
          logout();
          navigate('/login');
      });
  };

  const cropName = useMemo(() => {
    if (!activeCrop) return 'Panel';
    const location = locations.find(l => l.id === activeCrop.locationId);
    return location ? `Cultivo: ${location.name}` : 'Panel';
  }, [activeCrop, locations]);

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-gray-800 border-b border-gray-700 flex-shrink-0">
      <div className="flex items-center">
        {/* Hamburger Menu Button - visible on small screens */}
        <button 
          onClick={onMenuButtonClick}
          className="p-2 mr-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold truncate">
          {cropName}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationCenter />
        <span className="hidden sm:inline text-gray-400 text-right truncate">Bienvenido, {currentUser?.username}</span>
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          aria-label="Cerrar sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

export default Header;