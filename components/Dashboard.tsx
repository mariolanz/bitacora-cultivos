
import React, { useMemo, useState } from 'react';
import { useCrops, useConfirmation, useAuth, usePlantBatches, useTasks, useGenetics, useLocations } from '../context/AppProvider';
import Card from './ui/Card';
import { Crop, CropStage, UserRole, PlantBatch, PlantBatchStatus, Location, Task, SensorDataPoint } from '../types';
import { getStageInfo } from '../services/nutritionService';
import { STAGES } from '../constants';
import { useNavigate, Navigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MaintenanceDashboard from './MaintenanceDashboard';
import WeeklyTaskCalendar from './WeeklyTaskCalendar';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const SensorDetailModal: React.FC<{
    data: SensorDataPoint[];
    onClose: () => void;
    logDate: string;
}> = ({ data, onClose, logDate }) => {
    const formattedData = data.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    }));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl relative h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl">&times;</button>
                <h3 className="text-lg font-bold mb-4">Detalle de Sensores - {new Date(logDate).toLocaleDateString()}</h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="time" stroke="#A0AEC0" />
                            <YAxis yAxisId="left" stroke="#F56565" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#F56565' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#4299E1" label={{ value: '%', angle: -90, position: 'insideRight', fill: '#4299E1' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperatura" stroke="#F56565" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humedad" stroke="#4299E1" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    )
};

const MoveCropModal: React.FC<{
    crop: Crop;
    destinationRooms: Location[];
    onConfirm: (destinationRoomId: string) => void;
    onCancel: () => void;
}> = ({ crop, destinationRooms, onConfirm, onCancel }) => {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const { locations } = useLocations();
    const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Mover Cultivo a Floración</h3>
                <p className="text-gray-400 mb-4">El cultivo "{cropName}" está en una sala de vegetación. Por favor, selecciona la sala de floración de destino.</p>
                <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md mb-6" required>
                    <option value="">Seleccionar cuarto...</option>
                    {destinationRooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                </select>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700">Cancelar</button>
                    <button onClick={() => onConfirm(selectedRoomId)} disabled={!selectedRoomId} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">Confirmar</button>
                </div>
            </Card>
        </div>
    );
};

const StageSection: React.FC<{ title: string; children: React.ReactNode; count: number; }> = ({ title, children, count }) => {
    if (count === 0) return null;
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-300 border-b-2 border-gray-700 pb-2">{title}</h2>
            <div className="space-y-2">{children}</div>
        </div>
    );
};

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const CropRow: React.FC<{
    crop: Crop;
    onAdvance: (crop: Crop) => void;
    onLogEntry: (cropId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ crop, onAdvance, onLogEntry, isOpen, onToggle }) => {
    const { activeCropId, deleteCrop, archiveCrop } = useCrops();
    const { showConfirmation } = useConfirmation();
    const { currentUser } = useAuth();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { plantBatches } = usePlantBatches();

    const stageInfo = getStageInfo(crop);

    const isSelected = activeCropId === crop.id;
    const cropName = useMemo(() => locations.find(l => l.id === crop.locationId)?.name || crop.id, [locations, crop.locationId]);

    const batchIds = useMemo(() => crop.plantCounts.map(pc => pc.batchId), [crop.plantCounts]);
    
    const plantCountsByGenetic = useMemo(() => {
        const counts: Record<string, number> = {};
        crop.plantCounts.forEach(pc => {
            const batch = plantBatches.find(b => b.id === pc.batchId);
            if (batch) {
                const genetic = genetics.find(g => g.id === batch.geneticsId);
                if (genetic) {
                    counts[genetic.name] = (counts[genetic.name] || 0) + pc.count;
                }
            }
        });
        return counts;
    }, [crop.plantCounts, plantBatches, genetics]);

    const totalPlants = useMemo(() => {
        return crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0);
    }, [crop.plantCounts]);


    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation(`¿Estás seguro de que quieres eliminar el cultivo "${cropName}"? Esta acción no se puede deshacer.`, () => deleteCrop(crop.id));
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation(`¿Estás seguro de que quieres archivar el cultivo "${cropName}"? Se moverá al historial y liberará la habitación.`, () => archiveCrop(crop.id));
    };
    
    const canAdvance = stageInfo.stage !== CropStage.HARVESTED;
    const canLog = [CropStage.PRE_VEGETATION, CropStage.VEGETATION, CropStage.FLOWERING].includes(stageInfo.stage);

    return (
        <div className={`rounded-lg transition-all duration-200 ${isSelected ? 'bg-gray-800 ring-2 ring-emerald-500' : 'bg-gray-800'}`}>
            <header onClick={onToggle} className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700/50 rounded-t-lg">
                <span className="font-bold text-white text-lg">{cropName}</span>
                <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stageInfo.stage === CropStage.HARVESTED ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                        {stageInfo.stage}
                    </span>
                    <span className="text-sm text-gray-400 w-36 text-right">Semana {stageInfo.weekInStage} / Día {stageInfo.dayOfWeekInStage}</span>
                    <ChevronIcon isOpen={isOpen} />
                </div>
            </header>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div className="col-span-full">
                            <span className="text-gray-400">Plantas por Genética:</span>
                            <p className="font-semibold text-white break-words">
                                {Object.entries(plantCountsByGenetic).map(([name, count]) => `${name} (${count})`).join(', ')}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">Total de Plantas:</span>
                            <p className="font-semibold text-white">{totalPlants}</p>
                        </div>
                        <div><span className="text-gray-400">Lotes:</span><p className="font-semibold text-white break-words">{batchIds.join(', ')}</p></div>
                        <div><span className="text-gray-400">Creado:</span><p className="font-semibold text-white">{new Date(crop.cloningDate).toLocaleDateString()}</p></div>
                        <div><span className="text-gray-400">Días Totales:</span><p className="font-semibold text-white">{stageInfo.totalDays + 1}</p></div>
                        <div><span className="text-gray-400">Semanas Totales:</span><p className="font-semibold text-white">{stageInfo.totalWeek}</p></div>
                        <div><span className="text-gray-400">Semana en Etapa:</span><p className="font-semibold text-white">{stageInfo.weekInStage}</p></div>
                    </div>
                    <div className="flex justify-end items-center gap-4 pt-3">
                        {canLog && <button onClick={(e) => { e.stopPropagation(); onLogEntry(crop.id); }} className="text-xs font-bold py-1 px-3 rounded bg-gray-600 hover:bg-gray-500 text-white">Registrar Cuidados</button>}
                        {canAdvance && <button onClick={(e) => { e.stopPropagation(); onAdvance(crop); }} className="text-xs font-bold py-1 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white">Avanzar Etapa</button>}
                        {stageInfo.stage === CropStage.HARVESTED && <button onClick={handleArchive} className="text-xs text-blue-400 hover:text-blue-300">Archivar</button>}
                        {currentUser?.roles.includes(UserRole.ADMIN) && <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">Eliminar</button>}
                    </div>
                </div>
            )}
        </div>
    );
};

const BatchRow: React.FC<{
    batch: PlantBatch;
    onMoveToPreVeg: (batch: PlantBatch) => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ batch, onMoveToPreVeg, isOpen, onToggle }) => {
    const navigate = useNavigate();
    const { setActiveBatchId } = usePlantBatches();

    const totalDays = useMemo(() => {
        const creationDate = new Date(batch.creationDate);
        const start = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate());
        const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        return Math.max(0, Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY));
    }, [batch.creationDate]);

    const weekInStage = Math.floor(totalDays / 7) + 1;
    const dayOfWeekInStage = (totalDays % 7) + 1;
    const totalWeek = weekInStage;

    const canMoveToPreVeg = batch.status === PlantBatchStatus.GERMINATION_ROOTING && totalDays >= 14 && batch.rootedPlantCount && batch.rootedPlantCount > 0;
    const plantCountDisplay = `${batch.initialPlantCount} / ${batch.rootedPlantCount ?? 'N/A'} / ${batch.availablePlantCount}`;

    const handleLogEntry = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveBatchId(batch.id);
        navigate('/log');
    };

    return (
        <div className="bg-gray-800 rounded-lg">
            <header onClick={onToggle} className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700/50 rounded-t-lg">
                <span className="font-bold text-white text-lg">{batch.id}</span>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 w-36 text-right">Semana {weekInStage} / Día {dayOfWeekInStage}</span>
                    <ChevronIcon isOpen={isOpen} />
                </div>
            </header>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 space-y-3">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div><span className="text-gray-400">Creado:</span><p className="font-semibold text-white">{new Date(batch.creationDate).toLocaleDateString()}</p></div>
                        <div><span className="text-gray-400">Días Totales:</span><p className="font-semibold text-white">{totalDays + 1}</p></div>
                        <div><span className="text-gray-400">Semanas Totales:</span><p className="font-semibold text-white">{totalWeek}</p></div>
                        <div className="col-span-full"><span className="text-gray-400">Plantas (Ini/Enr/Disp):</span><p className="font-semibold text-white">{plantCountDisplay}</p></div>
                     </div>
                    <div className="pt-3 space-y-2">
                        {batch.status === PlantBatchStatus.GERMINATION_ROOTING && (
                            <>
                                <button onClick={handleLogEntry} className="w-full text-sm font-bold py-2 px-3 rounded bg-gray-600 hover:bg-gray-500 text-white">Registrar Cuidados</button>
                                {canMoveToPreVeg ? (
                                    <button onClick={(e) => { e.stopPropagation(); onMoveToPreVeg(batch); }} className="w-full text-sm font-bold py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white">Mover a Pre-Veg</button>
                                ) : (
                                    <p className="text-xs text-center text-gray-500">Registra plantas enraizadas y espera 14 días para avanzar.</p>
                                )}
                            </>
                        )}
                        {batch.status === PlantBatchStatus.PRE_VEGETATION && (
                            <p className="text-sm text-center text-green-400 font-semibold">Listo para configurar cultivo.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const GrowerAdminDashboard: React.FC = () => {
  const { allCrops, activeCrop, saveCrop, setActiveCropId } = useCrops();
  const { plantBatches, savePlantBatch } = usePlantBatches();
  const { currentUser } = useAuth();
  const { locations } = useLocations();
  const { showConfirmation } = useConfirmation();
  const navigate = useNavigate();

  const [movingCrop, setMovingCrop] = useState<Crop | null>(null);
  const [viewingSensorData, setViewingSensorData] = useState<{ data: SensorDataPoint[], date: string } | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleToggleRow = (id: string) => {
    const newExpandedId = expandedRowId === id ? null : id;
    setExpandedRowId(newExpandedId);
    if (id.startsWith('crop-')) {
        setActiveCropId(newExpandedId);
    } else if (activeCrop) {
        // If user opens a batch row, deselect any active crop
        setActiveCropId(null);
    }
  };

  const handleLogEntryForCrop = (cropId: string) => {
    setActiveCropId(cropId);
    navigate('/log');
  };

  const handleAdvanceStage = (crop: Crop) => {
    const stageInfo = getStageInfo(crop);
    const now = new Date().toISOString();
    const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;

    if (stageInfo.stage === CropStage.CLONING) {
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Pre-Vegetación?`, () => saveCrop({ ...crop, preVegDate: now }));
    } else if (stageInfo.stage === CropStage.PRE_VEGETATION) {
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Vegetación?`, () => saveCrop({ ...crop, vegDate: now }));
    } else if (stageInfo.stage === CropStage.VEGETATION) {
        const cropLocation = locations.find(l => l.id === crop.locationId);
        if (cropLocation?.type === 'VEGETACION') {
            setMovingCrop(crop);
            return;
        }
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Floración?`, () => saveCrop({ ...crop, flowerDate: now }));
    } else if (stageInfo.stage === CropStage.FLOWERING) {
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Secado y Curado?`, () => saveCrop({ ...crop, dryingCuringDate: now }));
    } else if (stageInfo.stage === CropStage.DRYING_CURING) {
         showConfirmation(`¿Estás seguro de que quieres marcar "${cropName}" como Cosechado?`, () => saveCrop({ ...crop, harvestDate: now }));
    }
  };

  const handleMoveToPreVeg = (batch: PlantBatch) => {
    showConfirmation(`¿Mover este lote a Pre-Vegetación con ${batch.rootedPlantCount} plantas disponibles?`, () => {
        savePlantBatch({
            ...batch,
            status: PlantBatchStatus.PRE_VEGETATION,
            availablePlantCount: batch.rootedPlantCount || 0
        });
    });
  };

  const handleConfirmMove = (destinationRoomId: string) => {
      if (movingCrop) {
          saveCrop({ ...movingCrop, flowerDate: new Date().toISOString(), locationId: destinationRoomId });
          setMovingCrop(null);
      }
  };

  const destinationRoomsForLL = useMemo(() => {
    if (!movingCrop) return [];
    const parentLocation = locations.find(l => l.id === movingCrop.locationId)?.parentId;
    if (!parentLocation) return [];
    return locations.filter(l => l.parentId === parentLocation && l.type === 'FLORACION');
  }, [locations, movingCrop]);

  const visibleCrops = React.useMemo(() => {
    const nonArchivedCrops = allCrops.filter(crop => !crop.isArchived);
    if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
        return nonArchivedCrops;
    }
    if (!currentUser.locationId) return [];
    
    const userRoomIds = locations.filter(l => l.parentId === currentUser.locationId).map(l => l.id);
    userRoomIds.push(currentUser.locationId);
    return nonArchivedCrops.filter(crop => userRoomIds.includes(crop.locationId));
  }, [allCrops, currentUser, locations]);

  const cropsByStage = STAGES.reduce((acc, stage) => {
      acc[stage] = [];
      return acc;
  }, {} as Record<CropStage, Crop[]>);

  visibleCrops.forEach(crop => {
      const { stage } = getStageInfo(crop);
      if (cropsByStage[stage]) {
          cropsByStage[stage].push(crop);
      }
  });

  const germinationBatches = useMemo(() => {
    return plantBatches.filter(batch => {
        if (batch.status !== PlantBatchStatus.GERMINATION_ROOTING) {
            return false;
        }
        // Admins can see all batches
        if (currentUser?.roles.includes(UserRole.ADMIN)) {
            return true;
        }
        // Other users can only see batches they created
        return batch.creatorId === currentUser?.id;
    });
  }, [plantBatches, currentUser]);
  
  const preVegBatches = plantBatches.filter(b => b.status === PlantBatchStatus.PRE_VEGETATION);

  return (
    <div className="space-y-8">
      {movingCrop && (
        <MoveCropModal 
            crop={movingCrop} 
            destinationRooms={destinationRoomsForLL}
            onConfirm={handleConfirmMove}
            onCancel={() => setMovingCrop(null)}
        />
      )}
      {viewingSensorData && (
          <SensorDetailModal
              data={viewingSensorData.data}
              logDate={viewingSensorData.date}
              onClose={() => setViewingSensorData(null)}
          />
      )}

      <WeeklyTaskCalendar />

      <StageSection title="Lotes en Germinación/Enraizamiento" count={germinationBatches.length}>
          {germinationBatches.map(batch => 
              <BatchRow 
                  key={batch.id} 
                  batch={batch} 
                  onMoveToPreVeg={handleMoveToPreVeg}
                  isOpen={expandedRowId === batch.id}
                  onToggle={() => handleToggleRow(batch.id)}
              />
          )}
      </StageSection>
      
      <StageSection title="Lotes en Pre-Vegetación (Listos para Cultivo)" count={preVegBatches.length}>
          {preVegBatches.map(batch => 
              <BatchRow 
                  key={batch.id} 
                  batch={batch} 
                  onMoveToPreVeg={handleMoveToPreVeg}
                  isOpen={expandedRowId === batch.id}
                  onToggle={() => handleToggleRow(batch.id)}
              />
          )}
      </StageSection>

      {STAGES.map(stage => (
          <StageSection key={stage} title={stage} count={cropsByStage[stage].length}>
              {cropsByStage[stage].map(crop => (
                  <CropRow 
                      key={crop.id} 
                      crop={crop} 
                      onAdvance={handleAdvanceStage}
                      onLogEntry={handleLogEntryForCrop}
                      isOpen={expandedRowId === crop.id}
                      onToggle={() => handleToggleRow(crop.id)}
                  />
              ))}
          </StageSection>
      ))}

      {activeCrop && (
          <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-300 border-b-2 border-gray-700 pb-2">Historial de Registros para {locations.find(l=>l.id===activeCrop.locationId)?.name}</h2>
              <Card>
                  {activeCrop.logEntries.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                           <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                               <tr>
                                   <th scope="col" className="px-4 py-3">Fecha</th>
                                   <th scope="col" className="px-4 py-3">Ambiente</th>
                                   <th scope="col" className="px-4 py-3">Riego In</th>
                                   <th scope="col" className="px-4 py-3">Riego Out</th>
                                   <th scope="col" className="px-4 py-3">Eventos y Notas</th>
                                   <th scope="col" className="px-4 py-3">Sensores</th>
                               </tr>
                           </thead>
                           <tbody>
                               {activeCrop.logEntries.slice().reverse().map(log => (
                                   <tr key={log.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                       <td className="px-4 py-4 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                       <td className="px-4 py-4 text-xs">
                                          {log.environmental && (
                                              <>
                                                  <p><strong>T:</strong> {log.environmental.temp}°C</p>
                                                  <p><strong>H:</strong> {log.environmental.humidity}%</p>
                                              </>
                                          )}
                                       </td>
                                       <td className="px-4 py-4 text-xs">
                                          {log.irrigation && (
                                              <>
                                                  <p><strong>pH:</strong> <span className={(log.irrigation.ph < 5.8 || log.irrigation.ph > 6.2) ? 'text-yellow-400 font-bold' : ''}>{log.irrigation.ph}</span></p>
                                                  <p><strong>PPM:</strong> {log.irrigation.ppm}</p>
                                              </>
                                          )}
                                       </td>
                                       <td className="px-4 py-4 text-xs">
                                           {log.irrigation && (
                                              <>
                                                  <p><strong>pH:</strong> <span className={(log.irrigation.phOut && (log.irrigation.phOut < 5.8 || log.irrigation.phOut > 6.2)) ? 'text-yellow-400 font-bold' : ''}>{log.irrigation.phOut ?? 'N/A'}</span></p>
                                                  <p><strong>PPM:</strong> <span className={(log.irrigation.ppmOut && log.irrigation.ppm && log.irrigation.ppmOut > (log.irrigation.ppm * 1.25)) ? 'text-yellow-400 font-bold' : ''}>{log.irrigation.ppmOut ?? 'N/A'}</span></p>
                                              </>
                                          )}
                                       </td>
                                       <td className="px-4 py-4 max-w-xs text-xs">
                                          {log.notes && <p className="whitespace-pre-wrap mb-1" title={log.notes}>{log.notes}</p>}
                                          
                                          {log.plantHealth && log.plantHealth.length > 0 && (
                                              <div className="my-1">
                                                  <strong className="text-yellow-400">Salud:</strong>
                                                  <ul className="list-disc list-inside pl-1">
                                                      {log.plantHealth.map((h, i) => <li key={i}>{h}</li>)}
                                                  </ul>
                                              </div>
                                          )}

                                          {log.foliarSpray && log.foliarSpray.length > 0 && (
                                              <div className="my-1">
                                                  <strong>Foliar:</strong>
                                                  <ul className="list-disc list-inside pl-1">
                                                      {log.foliarSpray.map((s, i) => <li key={i}>{s.name}</li>)}
                                                  </ul>
                                              </div>
                                          )}
                                          
                                          {log.supplements && log.supplements.length > 0 && (
                                               <div className="my-1">
                                                  <strong>Suplementos:</strong>
                                                  <ul className="list-disc list-inside pl-1">
                                                      {log.supplements.map((s, i) => <li key={i}>{s.name}</li>)}
                                                  </ul>
                                              </div>
                                          )}

                                          {log.completedTasks && log.completedTasks.map(t => (
                                              <span key={t.taskId} className="block bg-gray-700 px-2 py-1 rounded-full mt-1">✔ {t.taskTitle} ({t.completedBy})</span>
                                          ))}
                                       </td>
                                       <td className="px-4 py-4">
                                            {log.sensorData && log.sensorData.length > 0 && (
                                                <button onClick={() => setViewingSensorData({ data: log.sensorData!, date: log.date })} className="text-xs py-1 px-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white">Ver Gráfica</button>
                                            )}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                      </div>
                  ) : (
                      <p className="text-center text-gray-500">Aún no hay entradas de registro para este cultivo.</p>
                  )}
              </Card>
          </div>
      )}
    </div>
  )
}

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();

    const isMaintenanceOnly = currentUser?.roles.length === 1 && currentUser.roles[0] === UserRole.MAINTENANCE;
    if (isMaintenanceOnly) {
        return <Navigate to="/maintenance-calendar" replace />;
    }
    
    return <GrowerAdminDashboard />;
};

export default Dashboard;
