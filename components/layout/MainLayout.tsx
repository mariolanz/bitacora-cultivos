


import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAnnouncements, useAuth } from '../../context/AppProvider';
import Card from '../ui/Card';

const AnnouncementsModal: React.FC = () => {
    const { announcements, markAnnouncementAsRead } = useAnnouncements();
    const { currentUser } = useAuth();

    const unreadAnnouncements = announcements.filter(a => 
        !a.read && 
        (!a.locationId || a.locationId === currentUser?.locationId || currentUser?.locationId === 'TODAS')
    );


    if (unreadAnnouncements.length === 0) {
        return null;
    }

    const latestUnread = unreadAnnouncements[0];

    const handleClose = (id: string) => {
        markAnnouncementAsRead(id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg relative">
                <button onClick={() => handleClose(latestUnread.id)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl" aria-label="Cerrar">&times;</button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-emerald-500 mb-4">Anuncio del Administrador</h2>
                    <p className="text-gray-300 mb-6 whitespace-pre-wrap">{latestUnread.message}</p>
                    <button onClick={() => handleClose(latestUnread.id)} className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Entendido</button>
                </div>
            </Card>
        </div>
    );
};

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuButtonClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <AnnouncementsModal />
    </div>
  );
};

export default MainLayout;