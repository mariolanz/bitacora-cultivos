import React, { useState, useMemo } from 'react';
import { useTasks, useAuth, useLocations } from '../context/AppProvider';
import { Task, UserRole } from '../types';
import Card from './ui/Card';

const DayTasksModal: React.FC<{
    date: Date;
    tasks: Task[];
    onClose: () => void;
}> = ({ date, tasks, onClose }) => {
    const { locations } = useLocations();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

    const tasksToDisplay = useMemo(() => {
        if (!isAdmin) {
            return tasks.map(task => {
                const locationName = task.locationId === 'all' 
                    ? 'Todas las Ubicaciones' 
                    : locations.find(l => l.id === task.locationId)?.name || task.locationId;
                return { ...task, displayLocation: locationName };
            });
        }

        // Admin expansion logic
        const result: Array<Task & { displayLocation: string }> = [];
        tasks.forEach(task => {
            if (task.locationId === 'all') {
                const rooms = locations.filter(l => l.parentId); // get all rooms
                rooms.forEach(room => {
                    const parent = locations.find(l => l.id === room.parentId);
                    result.push({
                        ...task,
                        id: `${task.id}-${room.id}`, // unique key
                        displayLocation: `${parent?.name || 'N/A'} - ${room.name}`
                    });
                });
            } else {
                const taskLocation = locations.find(l => l.id === task.locationId);
                if (taskLocation) {
                    if (taskLocation.parentId) { // A specific room
                         const parent = locations.find(l => l.id === taskLocation.parentId);
                         result.push({
                            ...task,
                            displayLocation: `${parent?.name || 'N/A'} - ${taskLocation.name}`
                        });
                    } else { // A parent location
                        const rooms = locations.filter(l => l.parentId === taskLocation.id);
                        rooms.forEach(room => {
                            const parent = taskLocation;
                            result.push({
                                ...task,
                                id: `${task.id}-${room.id}`,
                                displayLocation: `${parent.name} - ${room.name}`
                            });
                        });
                    }
                }
            }
        });
        return result.sort((a,b) => a.displayLocation.localeCompare(b.displayLocation));

    }, [tasks, locations, isAdmin]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl" aria-label="Cerrar">&times;</button>
                <h3 className="text-lg font-bold mb-4">Tareas para {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {tasksToDisplay.length > 0 ? tasksToDisplay.map(task => {
                        return (
                            <div key={task.id} className="p-3 rounded bg-gray-700">
                                <p className="font-semibold text-white">{task.title}</p>
                                <p className="text-xs text-emerald-400 font-medium">{task.displayLocation}</p> 
                                {task.description && <p className="text-xs mt-1 text-gray-400">{task.description}</p>}
                                {task.sop && (
                                    <div className="mt-2 p-2 bg-gray-600/70 rounded border border-gray-500">
                                        <h4 className="font-semibold text-xs text-gray-300 mb-1">{task.sop.title}</h4>
                                        <ul className="list-disc list-inside text-xs text-gray-200 pl-2 space-y-1">
                                            {task.sop.steps.map((step, index) => <li key={index}>{step}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )
                    }) : <p className="text-gray-500">No hay tareas programadas para este día.</p>}
                </div>
            </Card>
        </div>
    );
};

const WeeklyTaskCalendar: React.FC = () => {
    const { tasks } = useTasks();
    const { currentUser, activeRole } = useAuth();
    const [dayModal, setDayModal] = useState<{ date: Date, tasks: Task[] } | null>(null);

    const getTasksForDate = (date: Date): Task[] => {
        if (!currentUser || !activeRole) return [];

        const dateStr = date.toISOString().split('T')[0];
        
        return tasks.filter(task => {
            if (activeRole !== UserRole.ADMIN) {
                const roleMatch = task.assigneeRoles.includes(activeRole);
                
                let locationMatch = false;
                if (activeRole === UserRole.MAINTENANCE) {
                     locationMatch = task.locationId === 'all' 
                        || (currentUser.maintenanceLocationIds && currentUser.maintenanceLocationIds.includes('TODAS'))
                        || (currentUser.maintenanceLocationIds && task.locationId !== 'all' && currentUser.maintenanceLocationIds.includes(task.locationId));
                } else { // Grower, Trimmer
                    locationMatch = task.locationId === 'all' 
                        || currentUser.locationId === 'TODAS' 
                        || (currentUser.locationId && task.locationId === currentUser.locationId);
                }

                if (!roleMatch || !locationMatch) return false;
            }
            
            const month = date.getMonth(); // 0-11
            switch (task.recurrenceType) {
                case 'daily': return true;
                case 'weekly': return task.dayOfWeek === date.getDay();
                case 'monthly': return task.dayOfMonth === date.getDate();
                case 'bimonthly': return task.dayOfMonth === date.getDate() && month % 2 === 0;
                case 'quarterly': return task.dayOfMonth === date.getDate() && month % 3 === 0;
                case 'semiannually': return task.dayOfMonth === date.getDate() && month % 6 === 0;
                case 'single':
                    if (!task.date) return false;
                    const taskDate = new Date(task.date);
                    const taskDateStr = `${taskDate.getUTCFullYear()}-${(taskDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${taskDate.getUTCDate().toString().padStart(2, '0')}`;
                    return dateStr === taskDateStr;
                default: return false;
            }
        });
    };

    const today = new Date();
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
    });

    return (
        <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-300 border-b-2 border-gray-700 pb-2">Calendario de Tareas de la Semana</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {weekDays.map(date => {
                        const dailyTasks = getTasksForDate(date);
                        const isToday = date.toDateString() === today.toDateString();
                        return (
                            <div 
                                key={date.toISOString()} 
                                className={`p-3 rounded-lg border ${isToday ? 'border-emerald-500' : 'border-gray-700'} bg-gray-800 cursor-pointer hover:bg-gray-700/50`}
                                onClick={() => setDayModal({ date, tasks: dailyTasks })}
                            >
                                <p className={`font-bold text-center ${isToday ? 'text-emerald-400' : 'text-white'}`}>
                                    {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                                </p>
                                <p className="text-sm text-center text-gray-400 mb-2">{date.getDate()}</p>
                                <div className="space-y-2">
                                    {dailyTasks.map(task => (
                                        <div 
                                            key={task.id}
                                            className="w-full text-left text-xs p-2 rounded bg-gray-700 text-gray-200 truncate"
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {dailyTasks.length === 0 && <p className="text-xs text-center text-gray-500">Sin tareas</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {dayModal && (
                <DayTasksModal
                    date={dayModal.date}
                    tasks={dayModal.tasks}
                    onClose={() => setDayModal(null)}
                />
            )}
        </>
    );
};

export default WeeklyTaskCalendar;