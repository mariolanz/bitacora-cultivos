import React from 'react';
import Card from './ui/Card';
import { useMaintenanceLogs, useLocations } from '../context/AppProvider';

const MaintenanceReports: React.FC = () => {
    const { maintenanceLogs } = useMaintenanceLogs();
    const { locations } = useLocations();

    if (maintenanceLogs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-white">Reportes de Mantenimiento</h1>
                <Card>
                    <p className="text-center text-gray-500">No hay registros de mantenimiento para mostrar.</p>
                </Card>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Reportes de Mantenimiento</h1>
            <Card>
                <h2 className="text-xl font-semibold text-emerald-500 mb-4">Historial de Tareas Completadas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Tarea</th>
                                <th scope="col" className="px-6 py-3">Realizada Por</th>
                                <th scope="col" className="px-6 py-3">Ubicación</th>
                                <th scope="col" className="px-6 py-3">Notas</th>
                                <th scope="col" className="px-6 py-3">Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maintenanceLogs.slice().reverse().map(log => {
                                const location = locations.find(l => l.id === log.locationId);
                                return (
                                    <tr key={log.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(log.completedAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-medium text-white">{log.taskTitle}</td>
                                        <td className="px-6 py-4">{log.userUsername}</td>
                                        <td className="px-6 py-4">{location?.name || log.locationId}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={log.notes}>{log.notes}</td>
                                        <td className="px-6 py-4">
                                            {log.photoEvidence ? (
                                                <a href={`data:image/jpeg;base64,${log.photoEvidence}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Ver Foto</a>
                                            ) : 'No'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MaintenanceReports;
