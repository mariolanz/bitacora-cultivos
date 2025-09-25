import React, { useState } from 'react';
import { useTasks, useAuth, useInventory, useMaintenanceLogs } from '../context/AppProvider';
import Card from './ui/Card';
import { Task } from '../types';
import MaintenanceTaskModal from './MaintenanceTaskModal';

const TaskDayModal: React.FC<{
    date: Date;
    tasks: Task[];
    completedTaskIds: Set<string>;
    onClose: () => void;
    onComplete: (task: Task) => void;
}> = ({ date, tasks, completedTaskIds, onClose, onComplete }) => {
    const { inventory } = useInventory();
    const getPartName = (inventoryItemId: string) => {
        const item = inventory.find(i => i.id.startsWith(inventoryItemId));
        return item?.name || inventoryItemId;
    };
    const isToday = date.toDateString() === new Date().toDateString();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl">&times;</button>
                <h3 className="text-lg font-bold mb-4">Tareas para {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {tasks.length > 0 ? tasks.map(task => {
                        const isCompleted = completedTaskIds.has(task.id);
                        return (
                        <div key={task.id} className={`p-3 rounded ${isCompleted ? 'bg-green-900/50' : 'bg-gray-700'}`}>
                            <p className={`font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>{task.title}</p>
                            {task.description && <p className={`text-xs mb-2 ${isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>{task.description}</p>}
                             {(task.requiredTools || task.requiredParts) && (
                                <div className="mt-2 p-2 bg-gray-600/70 rounded border border-gray-500">
                                    <h4 className="font-semibold text-xs text-gray-300 mb-1">Preparación</h4>
                                    {task.requiredTools && task.requiredTools.length > 0 && (
                                        <div className="mb-1">
                                            <p className="text-xs text-gray-400">Herramientas:</p>
                                            <ul className="list-disc list-inside text-xs text-gray-200 pl-2">
                                                {task.requiredTools.map(tool => <li key={tool}>{tool}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {task.requiredParts && task.requiredParts.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-400">Insumos/Refacciones:</p>
                                            <ul className="list-disc list-inside text-xs text-gray-200 pl-2">
                                                {task.requiredParts.map(part => <li key={part.inventoryItemId}>{getPartName(part.inventoryItemId)} (Cant: {part.quantity})</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                             {isToday && !isCompleted && (
                                 <button onClick={() => onComplete(task)} className="mt-2 w-full text-center text-xs py-1 px-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-colors">
                                    Completar Tarea
                                </button>
                            )}
                            {isCompleted && <p className="mt-2 text-center text-xs text-green-400 font-bold">Completada</p>}
                        </div>
                    )}) : <p className="text-gray-500">No hay tareas programadas para este día.</p>}
                </div>
            </Card>
        </div>
    );
};


const MaintenanceDashboard: React.FC = () => {
    const { tasks, completeMaintenanceTask } = useTasks();
    const { currentUser, activeRole } = useAuth();
    const { maintenanceLogs } = useMaintenanceLogs();
    const [taskToLog, setTaskToLog] = useState<Task | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dayModal, setDayModal] = useState<{ date: Date, tasks: Task[] } | null>(null);

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getTasksForDate = (date: Date): [Task[], Set<string>] => {
        if (!currentUser || !activeRole) return [[], new Set()];

        const dateStr = date.toISOString().split('T')[0];
        const completedLogsForDay = maintenanceLogs.filter(log => log.completedAt.startsWith(dateStr));
        const completedTaskIds = new Set(completedLogsForDay.map(log => log.taskId));

        const scheduledTasks = tasks.filter(task => {
            const roleMatch = task.assigneeRoles.includes(activeRole);
            const locationMatch = task.locationId === 'all' || currentUser.maintenanceLocationIds?.includes('TODAS') || currentUser.maintenanceLocationIds?.includes(task.locationId);
            if (!roleMatch || !locationMatch) return false;

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

        return [scheduledTasks, completedTaskIds];
    };

    const handleSaveMaintenanceLog = (task: Task, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[]) => {
        if (!currentUser) return;
        completeMaintenanceTask(task, currentUser.id, notes, photo, partsUsed);
        setTaskToLog(null);
    };

    const handleOpenCompleteModal = (task: Task) => {
        setDayModal(null);
        setTimeout(() => setTaskToLog(task), 100);
    }
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const calendarDays = [];
    let date = startDate;
    while(date <= endOfMonth || calendarDays.length % 7 !== 0) {
        calendarDays.push(new Date(date));
        date.setDate(date.getDate() + 1);
        if (calendarDays.length > 42) break;
    }

    const today = new Date();

    // Fix: Explicitly type `new Set()` as `new Set<string>()` to resolve type inference issue.
    const [tasksForDayModal, completedIdsForDayModal] = dayModal ? getTasksForDate(dayModal.date) : [[], new Set<string>()];

    return (
        <div className="space-y-8">
             <Card>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>&lt;</button>
                    <h2 className="text-2xl font-bold text-gray-300">
                        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {daysOfWeek.map(day => <div key={day} className="font-bold p-2 text-gray-400">{day}</div>)}
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = day.toDateString() === today.toDateString();
                        const [tasksForDay, completedTaskIds] = getTasksForDate(day);
                        const incompleteTasks = tasksForDay.filter(t => !completedTaskIds.has(t.id));
                        return (
                            <div 
                                key={index} 
                                className={`border border-gray-700 min-h-36 flex flex-col p-1 cursor-pointer hover:bg-gray-700/50 ${isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900 text-gray-600'} ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
                                onClick={() => setDayModal({ date: day, tasks: tasksForDay })}
                            >
                                <span className={`font-semibold ${isToday ? 'text-emerald-400' : ''}`}>{day.getDate()}</span>
                                <div className="flex-1 overflow-y-auto text-left text-xs space-y-1 mt-1 pr-1">
                                    {incompleteTasks.slice(0, 3).map(task => (
                                        <div key={task.id} className="p-1 rounded bg-gray-600/70 text-gray-200">
                                            <p className="font-semibold truncate">{task.title}</p>
                                        </div>
                                    ))}
                                    {incompleteTasks.length > 3 && (
                                        <div className="p-1 text-center text-gray-400">
                                            + {incompleteTasks.length - 3} más
                                        </div>
                                    )}
                                    {completedTaskIds.size > 0 && (
                                        <div className="p-1 text-center text-green-500/80 font-bold">
                                            {completedTaskIds.size} ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
             </Card>
            {taskToLog && (
                <MaintenanceTaskModal
                    task={taskToLog}
                    onClose={() => setTaskToLog(null)}
                    onSave={handleSaveMaintenanceLog}
                />
            )}
            {dayModal && (
                <TaskDayModal
                    date={dayModal.date}
                    tasks={tasksForDayModal}
                    completedTaskIds={completedIdsForDayModal}
                    onClose={() => setDayModal(null)}
                    onComplete={handleOpenCompleteModal}
                />
            )}
        </div>
    );
}

export default MaintenanceDashboard;
