
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, useCrops, usePlantBatches, useMotherPlants } from '../../context/AppProvider';
import { UserRole } from '../../types';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser } = useAuth();
  const { setActiveCropId } = useCrops();
  const { setActiveBatchId } = usePlantBatches();
  const { setActiveMotherPlantId } = useMotherPlants();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasGrowerAccess = currentUser?.roles.includes(UserRole.GROWER) || currentUser?.roles.includes(UserRole.ADMIN);
  const hasMaintenanceAccess = currentUser?.roles.includes(UserRole.MAINTENANCE) || currentUser?.roles.includes(UserRole.ADMIN);
  const hasTrimmerAccess = currentUser?.roles.includes(UserRole.TRIMMER) || currentUser?.roles.includes(UserRole.ADMIN);
  const hasAdminAccess = currentUser?.roles.includes(UserRole.ADMIN);
 
  const linkClass = "flex items-center px-4 py-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const activeLinkClass = "bg-emerald-600 text-white";
  const disabledLinkClass = "opacity-50 cursor-not-allowed";

  const getNavLinkClass = (isActive: boolean, isDisabled: boolean = false) => {
    let classes = `${linkClass}`;
    if (isActive) classes += ` ${activeLinkClass}`;
    if (isDisabled) classes += ` ${disabledLinkClass}`;
    return classes;
  };
  
  const handleLogNav = () => {
    setActiveCropId(null);
    setActiveBatchId(null);
    setActiveMotherPlantId(null);
  };

  const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, disabled?: boolean, onClick?: () => void }> = ({ to, icon, label, disabled = false, onClick }) => (
     <NavLink 
        to={disabled ? "#" : to} 
        className={({ isActive }) => getNavLinkClass(isActive, disabled)}
        onClick={(e) => {
            if (disabled) {
                e.preventDefault();
            } else {
                if (onClick) onClick();
                setIsMobileMenuOpen(false); // Close mobile menu on click
            }
        }}
    >
      {icon}
      <span className={`mx-4 font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
    </NavLink>
  );

  const iconClass = "h-6 w-6";
  const calendarIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  const panelIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
  const reportsIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  const settingsIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const harvestIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>;
  const archiveIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
  const batchIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10s5 2 5 2l-2.657 2.657m0 0a2 2 0 102.828 2.828l2.829-2.829-2.829-2.828z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>;
  const motherPlantIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v13.5a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 16.5V3M5 3h14M8 7h8m-8 4h8" /></svg>;
  const logIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
  const setupIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 5.636l1.414 1.414m12.728 0l-1.414 1.414M5.636 18.364l-1.414-1.414M12 16a4 4 0 110-8 4 4 0 010 8z" /></svg>;
  const aiIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  const expensesIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v.01M12 18v-1.01M12 20v-1.01M4 12H2.01M21.99 12H20m-4-7.99l-1-1m-10 0l1 1m0 12.01l-1 1m10 0l1-1" /></svg>;
  const scissorsIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
  const maintenanceIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const scheduleIcon = <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  
  const sidebarContent = (
    <div className="flex flex-col h-full">
       <div className={`flex items-center justify-between px-4 h-16 transition-all duration-300 flex-shrink-0 ${isCollapsed ? 'lg:justify-center' : 'lg:justify-between'}`}>
         <span className={`font-bold text-white text-lg ${isCollapsed ? 'lg:hidden' : ''}`}>Torus Ac.</span>
         <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-700 hidden lg:block">
            {isCollapsed ? 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> :
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            }
         </button>
       </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {hasGrowerAccess && (
            <>
                <NavItem to="/" icon={panelIcon} label="Panel Principal" />
                <NavItem to="/schedule" icon={scheduleIcon} label="Cronograma" />
                <NavItem to="/setup" icon={setupIcon} label="Configurar Cultivo" />
                <NavItem to="/batches" icon={batchIcon} label="Gestión de Lotes" />
                <NavItem to="/mother-plants" icon={motherPlantIcon} label="Plantas Madre" />
                <NavItem to="/log" icon={logIcon} label="Entrada de Registro" onClick={handleLogNav} />
                <NavItem to="/harvest" icon={harvestIcon} label="Cosecha" />
                <NavItem to="/reports" icon={reportsIcon} label="Reportes" />
                <NavItem to="/ai-diagnosis" icon={aiIcon} label="Diagnóstico IA" />
                <NavItem to="/expenses" icon={expensesIcon} label="Gastos" />
                <NavItem to="/archive" icon={archiveIcon} label="Cultivos Archivados" />
            </>
        )}

        {hasTrimmerAccess && (
            <NavItem to="/trimming" icon={scissorsIcon} label="Trimeado" />
        )}
        
        {hasMaintenanceAccess && (
             <>
                <hr className="my-4 border-gray-600" />
                <p className={`px-4 text-xs font-semibold text-gray-500 uppercase ${isCollapsed ? 'lg:hidden' : ''}`}>Mantenimiento</p>
                <NavItem to="/maintenance-calendar" icon={calendarIcon} label="Calendario Mant." />
                <NavItem to="/maintenance-reports" icon={reportsIcon} label="Reportes Mant." />
            </>
        )}

        <hr className="my-4 border-gray-600" />
        <NavItem to="/settings" icon={settingsIcon} label="Ajustes y Gestión" />
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
          {sidebarContent}
      </aside>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gray-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
          {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;