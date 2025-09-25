import React, { useState, useEffect, useMemo } from 'react';
import Card from './ui/Card';
import { useCrops, useLocations, usePlantBatches, useGenetics } from '../context/AppProvider';
import { CropStage, HarvestData } from '../types';
import { getStageInfo } from '../services/nutritionService';
import { useNavigate } from 'react-router-dom';

const Harvest: React.FC = () => {
    const { activeCrop, saveCrop } = useCrops();
    const { locations } = useLocations();
    const { plantBatches } = usePlantBatches();
    const { genetics } = useGenetics();
    const navigate = useNavigate();

    type Weights = { wetWeight: string; dryWeight: string; trimWeight: string };
    const [weightsByGenetic, setWeightsByGenetic] = useState<Record<string, Weights>>({});
    const [curingNotes, setCuringNotes] = useState('');

    const cropName = useMemo(() => {
        if (!activeCrop) return '';
        const location = locations.find(l => l.id === activeCrop.locationId);
        return location?.name || activeCrop.id;
    }, [activeCrop, locations]);

    const cropGenetics = useMemo(() => {
        if (!activeCrop) return [];
        const geneticIds = new Set<string>();
        activeCrop.plantCounts.forEach(pc => {
            const batch = plantBatches.find(b => b.id === pc.batchId);
            if (batch) geneticIds.add(batch.geneticsId);
        });
        return Array.from(geneticIds).map(id => genetics.find(g => g.id === id)).filter(Boolean);
    }, [activeCrop, plantBatches, genetics]);

    useEffect(() => {
        if (activeCrop?.harvestData) {
            const initialWeights: Record<string, Weights> = {};
            activeCrop.harvestData.geneticHarvests.forEach(gh => {
                initialWeights[gh.geneticsId] = {
                    wetWeight: gh.wetWeight.toString(),
                    dryWeight: gh.dryWeight.toString(),
                    trimWeight: gh.trimWeight.toString(),
                };
            });
            setWeightsByGenetic(initialWeights);
        }
    }, [activeCrop, cropGenetics]);
    
    const curingAssistant = useMemo(() => {
        if (!activeCrop || !activeCrop.dryingCuringDate) return null;
        
        const dryingDate = new Date(activeCrop.dryingCuringDate);
        const now = new Date();
        const daysInCure = Math.floor((now.getTime() - dryingDate.getTime()) / (1000 * 3600 * 24));
        const lastBurp = activeCrop.harvestData?.lastBurpDate ? new Date(activeCrop.harvestData.lastBurpDate) : null;
        
        let recommendation = '';
        if (daysInCure <= 7) recommendation = 'Se recomienda hacer "burp" 2 veces al día.';
        else if (daysInCure <= 14) recommendation = 'Se recomienda hacer "burp" 1 vez al día.';
        else recommendation = 'Se recomienda hacer "burp" cada 2-3 días.';

        let nextBurp = 'N/A';
        if(lastBurp) {
            const nextBurpDate = new Date(lastBurp);
            if(daysInCure <= 7) nextBurpDate.setHours(lastBurp.getHours() + 12);
            else if (daysInCure <= 14) nextBurpDate.setDate(lastBurp.getDate() + 1);
            else nextBurpDate.setDate(lastBurp.getDate() + 2);
            nextBurp = nextBurpDate.toLocaleString();
        }

        return { recommendation, lastBurp: lastBurp?.toLocaleString() || 'Nunca', nextBurp };

    }, [activeCrop]);

    if (!activeCrop) {
        return <Card><p className="text-center text-gray-400">Por favor, selecciona un cultivo activo para registrar datos de cosecha.</p></Card>;
    }
    
    const stageInfo = getStageInfo(activeCrop);

    if (stageInfo.stage !== CropStage.DRYING_CURING && stageInfo.stage !== CropStage.FLOWERING && stageInfo.stage !== CropStage.HARVESTED) {
         return <Card><p className="text-center text-gray-400">Solo se pueden registrar datos de cosecha para cultivos en Floración, Secado o ya Cosechados.</p></Card>;
    }
    
    const handleWeightChange = (geneticsId: string, field: keyof Weights, value: string) => {
        setWeightsByGenetic(prev => ({
            ...prev,
            [geneticsId]: {
                ...(prev[geneticsId] || { wetWeight: '', dryWeight: '', trimWeight: '' }),
                [field]: value
            }
        }));
    };

    const handleRegisterBurp = () => {
        const now = new Date().toISOString();
        const updatedCrop = {
            ...activeCrop,
            harvestData: {
                ...activeCrop.harvestData,
                lastBurpDate: now,
                curingLog: [
                    ...(activeCrop.harvestData?.curingLog || []),
                    { date: now, notes: 'Burp realizado.' }
                ]
            } as HarvestData
        };
        saveCrop(updatedCrop);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const geneticHarvests = Object.entries(weightsByGenetic).map(([geneticsId, weights]) => ({
            geneticsId,
            wetWeight: parseFloat(weights.wetWeight) || 0,
            dryWeight: parseFloat(weights.dryWeight) || 0,
            trimWeight: parseFloat(weights.trimWeight) || 0,
        }));
        
        const totalWetWeight = geneticHarvests.reduce((sum, gh) => sum + gh.wetWeight, 0);
        const totalDryWeight = geneticHarvests.reduce((sum, gh) => sum + gh.dryWeight, 0);
        const totalTrimWeight = geneticHarvests.reduce((sum, gh) => sum + gh.trimWeight, 0);

        const existingCuringLog = activeCrop.harvestData?.curingLog || [];
        const newLogEntry = curingNotes ? [{ date: new Date().toISOString(), notes: curingNotes }] : [];
        
        const updatedCrop = {
            ...activeCrop,
            harvestDate: activeCrop.harvestDate || new Date().toISOString(),
            harvestData: {
                geneticHarvests,
                totalWetWeight,
                totalDryWeight,
                totalTrimWeight,
                curingLog: [...existingCuringLog, ...newLogEntry],
                lastBurpDate: activeCrop.harvestData?.lastBurpDate
            }
        };
        saveCrop(updatedCrop);
        alert("Datos de cosecha guardados.");
        navigate('/');
    };
  
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Registro de Cosecha para {cropName}</h1>
            <Card>
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div>
                        <h2 className="text-xl font-semibold text-emerald-500 border-b border-gray-700 pb-2 mb-4">Datos de Peso por Genética</h2>
                        <div className="space-y-4">
                            {cropGenetics.map(g => g && (
                                <div key={g.id} className="p-3 bg-gray-700/50 rounded-lg">
                                    <h3 className="font-bold text-white mb-2">{g.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400">Peso Húmedo (g)</label>
                                            <input type="number" value={weightsByGenetic[g.id]?.wetWeight || ''} onChange={e => handleWeightChange(g.id, 'wetWeight', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400">Peso Seco (g)</label>
                                            <input type="number" value={weightsByGenetic[g.id]?.dryWeight || ''} onChange={e => handleWeightChange(g.id, 'dryWeight', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400">Manicura (g)</label>
                                            <input type="number" value={weightsByGenetic[g.id]?.trimWeight || ''} onChange={e => handleWeightChange(g.id, 'trimWeight', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-emerald-500 border-b border-gray-700 pb-2">Registro y Asistente de Curado</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-300">Asistente Inteligente</h3>
                                {curingAssistant ? (
                                    <div className="p-3 bg-gray-700/50 rounded-lg text-sm space-y-2">
                                        <p><strong>Recomendación:</strong> {curingAssistant.recommendation}</p>
                                        <p><strong>Último Burp:</strong> {curingAssistant.lastBurp}</p>
                                        <p><strong>Siguiente Burp (est.):</strong> {curingAssistant.nextBurp}</p>
                                        <button type="button" onClick={handleRegisterBurp} className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md">Registrar Burp Ahora</button>
                                    </div>
                                ) : <p className="text-gray-500 text-sm">Avanza el cultivo a "Secado y Curado" para activar el asistente.</p>}

                                <div>
                                    <label className="block text-sm text-gray-400">Nueva Nota de Curado</label>
                                    <textarea value={curingNotes} onChange={e => setCuringNotes(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" placeholder="Añade notas de curado aquí (ej. 'Humedad en frasco al 65%')"></textarea>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-gray-300">Historial de Curado</h3>
                                 <div className="mt-2 space-y-2 max-h-60 overflow-y-auto bg-gray-900/50 p-2 rounded">
                                    {activeCrop.harvestData?.curingLog && activeCrop.harvestData.curingLog.length > 0 ? (
                                        activeCrop.harvestData.curingLog.slice().reverse().map(log => (
                                            <div key={log.date} className="text-sm p-2 bg-gray-700 rounded">
                                                <span className="font-bold text-gray-400">{new Date(log.date).toLocaleString()}: </span>
                                                <span className="text-gray-300">{log.notes}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-gray-500">Aún no hay notas de curado.</p>}
                                 </div>
                             </div>
                         </div>
                    </div>


                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <button type="submit" className="py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors">
                            Guardar Datos de Cosecha
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Harvest;