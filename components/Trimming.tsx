import React, { useState, useEffect, useMemo } from 'react';
// FIX: Remove non-existent useUsers hook and import useTrimming
import { useAuth, useCrops, useConfirmation, useTrimming, useLocations } from "../src/context/AppProvider";
import Card from './ui/Card';
import { Crop, CropStage, TrimmingSession } from '../types';

const Trimming: React.FC = () => {
    // FIX: Get users from useAuth hook
    const { currentUser, users } = useAuth();
    const { allCrops } = useCrops();
    const { locations } = useLocations();
    const { trimmingSessions, saveTrimmingSession } = useTrimming();
    const { showConfirmation } = useConfirmation();
    
    const [activeSession, setActiveSession] = useState<{ cropId: string, startTime: string } | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [isEndModalOpen, setEndModalOpen] = useState(false);
    const [endForm, setEndForm] = useState({ inputWeight: '', trimmedWeight: '', trimWasteWeight: '' });

    const availableCrops = useMemo(() => {
        return allCrops.filter(c => !c.isArchived && (c.harvestDate || c.dryingCuringDate));
    }, [allCrops]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (activeSession) {
            interval = setInterval(() => {
                setElapsedTime(new Date().getTime() - new Date(activeSession.startTime).getTime());
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeSession]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleStartSession = (cropId: string) => {
        if (!cropId) {
            alert("Por favor selecciona un cultivo cosechado.");
            return;
        }
        setActiveSession({ cropId, startTime: new Date().toISOString() });
    };

    const handleEndSession = () => {
        setEndModalOpen(true);
    };

    const handleCancelSession = () => {
        showConfirmation("¿Estás seguro que quieres cancelar la sesión actual? El progreso no se guardará.", () => {
            setActiveSession(null);
            setElapsedTime(0);
        });
    };

    const handleConfirmEndSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSession || !currentUser) return;

        const newSession: TrimmingSession = {
            id: `trim-${Date.now()}`,
            userId: currentUser.id,
            userUsername: currentUser.username,
            cropId: activeSession.cropId,
            startTime: activeSession.startTime,
            endTime: new Date().toISOString(),
            inputWeight: parseFloat(endForm.inputWeight),
            trimmedWeight: parseFloat(endForm.trimmedWeight),
            trimWasteWeight: parseFloat(endForm.trimWasteWeight),
        };

        saveTrimmingSession(newSession);
        setActiveSession(null);
        setElapsedTime(0);
        setEndModalOpen(false);
        setEndForm({ inputWeight: '', trimmedWeight: '', trimWasteWeight: '' });
    };

    const leaderboardData = useMemo(() => {
        const userStats: Record<string, { totalGrams: number, totalHours: number, sessionCount: number }> = {};

        trimmingSessions.forEach(session => {
            const durationHours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 3600000;
            if (!userStats[session.userId]) {
                userStats[session.userId] = { totalGrams: 0, totalHours: 0, sessionCount: 0 };
            }
            userStats[session.userId].totalGrams += session.trimmedWeight;
            userStats[session.userId].totalHours += durationHours;
            userStats[session.userId].sessionCount += 1;
        });

        return Object.entries(userStats)
            .map(([userId, stats]) => {
                const user = users.find(u => u.id === userId);
                return {
                    userId,
                    username: user?.username || 'Usuario Desconocido',
                    ...stats,
                    gramsPerHour: stats.totalHours > 0 ? stats.totalGrams / stats.totalHours : 0
                };
            })
            .sort((a, b) => b.gramsPerHour - a.gramsPerHour);
    }, [trimmingSessions, users]);

    const activeCropName = useMemo(() => {
        if (!activeSession) return '';
        const crop = allCrops.find(c => c.id === activeSession.cropId);
        return locations.find(l => l.id === crop?.locationId)?.name || crop?.id || '';
    }, [activeSession, allCrops, locations]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Módulo de Trimeado</h1>

            {!activeSession ? (
                <Card>
                    <h2 className="text-xl font-semibold text-emerald-500 mb-4">Iniciar Nueva Sesión de Trimeado</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            id="crop-select"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                            defaultValue=""
                        >
                            <option value="">Selecciona un cultivo cosechado...</option>
                            {availableCrops.map(c => (
                                <option key={c.id} value={c.id}>
                                    {locations.find(l => l.id === c.locationId)?.name || c.id}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleStartSession((document.getElementById('crop-select') as HTMLSelectElement).value)}
                            className="py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md"
                        >
                            Iniciar
                        </button>
                    </div>
                </Card>
            ) : (
                <Card className="border-emerald-500 border-2">
                    <h2 className="text-xl font-semibold text-emerald-400 mb-2">Sesión Activa</h2>
                    <p className="text-gray-300 mb-4">Trimeando cultivo: <span className="font-bold">{activeCropName}</span></p>
                    <div className="text-center bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-4xl font-mono tracking-widest text-white">{formatTime(elapsedTime)}</p>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleCancelSession} className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md">Cancelar Sesión</button>
                        <button onClick={handleEndSession} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md">Finalizar Sesión</button>
                    </div>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold text-emerald-500 mb-4">Tabla de Clasificación (Gramos/Hora)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">#</th>
                                <th scope="col" className="px-6 py-3">Trimeador</th>
                                <th scope="col" className="px-6 py-3">Eficiencia (g/hr)</th>
                                <th scope="col" className="px-6 py-3">Total Trimeado (g)</th>
                                <th scope="col" className="px-6 py-3">Horas Totales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboardData.map((stat, index) => (
                                <tr key={stat.userId} className="bg-gray-800 border-b border-gray-700">
                                    <td className="px-6 py-4 font-bold text-lg">{index + 1}</td>
                                    <td className="px-6 py-4 font-medium text-white">{stat.username}</td>
                                    <td className="px-6 py-4 text-emerald-400 font-bold">{stat.gramsPerHour.toFixed(2)}</td>
                                    <td className="px-6 py-4">{stat.totalGrams.toFixed(2)}</td>
                                    <td className="px-6 py-4">{stat.totalHours.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isEndModalOpen && activeSession && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Finalizar Sesión y Registrar Pesos</h3>
                        <form onSubmit={handleConfirmEndSession} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400">Peso de Entrada (g)</label>
                                <input type="number" step="0.1" value={endForm.inputWeight} onChange={e => setEndForm(p => ({...p, inputWeight: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400">Peso de Flor Trimeada (g)</label>
                                <input type="number" step="0.1" value={endForm.trimmedWeight} onChange={e => setEndForm(p => ({...p, trimmedWeight: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400">Peso de Manicura/Desecho (g)</label>
                                <input type="number" step="0.1" value={endForm.trimWasteWeight} onChange={e => setEndForm(p => ({...p, trimWasteWeight: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded" required />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEndModalOpen(false)} className="py-2 px-4 bg-gray-600 rounded">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-emerald-600 font-bold rounded">Guardar</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Trimming;