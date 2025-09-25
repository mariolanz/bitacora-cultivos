


import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from './ui/Card';
import { usePlantBatches, useGenetics, useConfirmation, useAuth, useLocations, useCrops, useMotherPlants } from '../context/AppProvider';
import { PlantBatch, PlantBatchStatus, UserRole } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

const getInitials = (username: string = '') => username.split(' ').map(n => n[0]).join('').toUpperCase();

const BatchManagement: React.FC = () => {
    const { plantBatches, savePlantBatch, deletePlantBatch, setActiveBatchId } = usePlantBatches();
    const { setActiveCropId } = useCrops();
    const { motherPlants } = useMotherPlants();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const { currentUser } = useAuth();
    const { state } = useLocation();
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null);

    const [showDepleted, setShowDepleted] = useState(false);

    const initialFormState = {
        geneticsId: '', initialPlantCount: '', rootedPlantCount: '',
        type: 'clone' as 'clone' | 'seed',
        creationDate: new Date().toISOString().split('T')[0],
        sourceLocationId: ''
    };

    const [formState, setFormState] = useState(initialFormState);
    const [editingBatch, setEditingBatch] = useState<PlantBatch | null>(null);

    const sourceRooms = useMemo(() => {
        return locations.filter(l => l.type === 'VEGETACION' || l.type === 'ciclo completo');
    }, [locations]);

    const handleEditClick = (batch: PlantBatch) => {
        setEditingBatch(batch);
        setFormState({
            geneticsId: batch.geneticsId,
            initialPlantCount: batch.initialPlantCount.toString(),
            rootedPlantCount: batch.rootedPlantCount?.toString() || '',
            type: batch.type,
            creationDate: new Date(batch.creationDate).toISOString().split('T')[0],
            sourceLocationId: batch.sourceLocationId
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleLogEntry = (batchId: string) => {
        setActiveCropId(null);
        setActiveBatchId(batchId);
        navigate('/log');
    };

    useEffect(() => {
        if (state?.editingBatchId) {
            const batchToEdit = plantBatches.find(b => b.id === state.editingBatchId);
            if (batchToEdit) handleEditClick(batchToEdit);
        }
    }, [state, plantBatches]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancelEdit = () => {
        setEditingBatch(null);
        setFormState(initialFormState);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.geneticsId || !formState.initialPlantCount || (formState.type === 'clone' && !formState.sourceLocationId) || !currentUser) {
            alert("Por favor, completa la genética, el número de plantas y la fuente para los clones.");
            return;
        }
        
        const selectedGenetic = genetics.find(g => g.id === formState.geneticsId);
        if(!selectedGenetic) return;
        
        const [year, month, day] = formState.creationDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dateCode = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        
        const batchId = editingBatch?.id || `${selectedGenetic.code}-${dateCode}-${formState.type === 'clone' ? 'C' : 'S'}-${getInitials(currentUser.username)}`;
        const batchName = `${selectedGenetic.name} ${formState.type === 'clone' ? 'Clones' : 'Semillas'} ${formState.creationDate}`;
        
        const initialCount = parseInt(formState.initialPlantCount, 10);
        const rootedCount = formState.rootedPlantCount ? parseInt(formState.rootedPlantCount, 10) : undefined;
        
        const sourceIsMotherPlant = motherPlants.some(p => p.id === formState.sourceLocationId);

        const newBatch: PlantBatch = {
            id: batchId, name: batchName,
            geneticsId: formState.geneticsId, creationDate: date.toISOString(),
            initialPlantCount: initialCount, rootedPlantCount: rootedCount,
            availablePlantCount: editingBatch?.availablePlantCount ?? 0,
            sourceLocationId: formState.sourceLocationId,
            type: formState.type, status: editingBatch?.status || PlantBatchStatus.GERMINATION_ROOTING,
            creatorId: editingBatch?.creatorId || currentUser.id, logEntries: editingBatch?.logEntries || [],
        };
        
        savePlantBatch(newBatch, sourceIsMotherPlant ? formState.sourceLocationId : undefined);
        handleCancelEdit();
    };
    
    const handleDelete = (batch: PlantBatch) => {
        showConfirmation(`¿Seguro que quieres eliminar el lote "${batch.name}"?`, () => {
            const success = deletePlantBatch(batch.id);
            if(success && editingBatch?.id === batch.id){
                handleCancelEdit();
            }
        });
    }

    const handleMoveToPreVeg = (batch: PlantBatch) => {
        if (!batch.rootedPlantCount || batch.rootedPlantCount <= 0) {
            alert("Primero debes registrar el número de plantas enraizadas.");
            return;
        }
        showConfirmation(`¿Mover este lote a Pre-Vegetación con ${batch.rootedPlantCount} plantas disponibles?`, () => {
            savePlantBatch({
                ...batch, status: PlantBatchStatus.PRE_VEGETATION,
                availablePlantCount: batch.rootedPlantCount || 0
            });
        });
    };

    const visibleBatches = useMemo(() => {
        let filteredBatches = plantBatches;

        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            // Admin sees all
        } else if (currentUser.locationId) {
            filteredBatches = plantBatches.filter(batch => 
                batch.sourceLocationId === currentUser.locationId || batch.creatorId === currentUser.id
            );
        } else {
             filteredBatches = [];
        }

        if (!showDepleted) {
            return filteredBatches.filter(b => b.status !== PlantBatchStatus.DEPLETED);
        }

        return filteredBatches;
    }, [plantBatches, currentUser, showDepleted]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Gestión de Lotes de Plantas</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1" ref={formRef}>
                    <Card>
                        <h2 className="text-xl font-semibold text-emerald-500 mb-4">{editingBatch ? `Editar Lote: ${editingBatch.name}` : 'Crear Nuevo Lote'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Genética</label>
                                <select name="geneticsId" value={formState.geneticsId} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required disabled={!!editingBatch}>
                                    <option value="">Seleccionar genética...</option>
                                    {genetics.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
                                <select name="type" value={formState.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" disabled={!!editingBatch}>
                                    <option value="clone">Clon</option>
                                    <option value="seed">Semilla</option>
                                </select>
                            </div>
                            {formState.type === 'clone' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Fuente de Clones</label>
                                    <select name="sourceLocationId" value={formState.sourceLocationId} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required={formState.type === 'clone'} disabled={!!editingBatch}>
                                        <option value="">Seleccionar fuente...</option>
                                        <optgroup label="Plantas Madre">
                                            {motherPlants.filter(p=>!p.isArchived).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </optgroup>
                                        <optgroup label="Cuartos">
                                            {sourceRooms.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </optgroup>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nº de Semillas/Clones Iniciales</label>
                                <input type="number" name="initialPlantCount" value={formState.initialPlantCount} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required disabled={!!editingBatch} />
                            </div>
                            {editingBatch && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nº de Plantas Enraizadas</label>
                                <input type="number" name="rootedPlantCount" value={formState.rootedPlantCount} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" placeholder="Añadir al terminar germinación" />
                            </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Fecha de Creación</label>
                                <input type="date" name="creationDate" value={formState.creationDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required disabled={!!editingBatch} />
                            </div>
                            <div className="flex gap-2 pt-2">
                                {editingBatch && <button type="button" onClick={handleCancelEdit} className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md">Cancelar</button>}
                                <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">{editingBatch ? 'Guardar Cambios' : 'Crear Lote'}</button>
                            </div>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-emerald-500">Lotes Existentes</h2>
                            <label className="flex items-center text-sm text-gray-400">
                                <input type="checkbox" checked={showDepleted} onChange={e => setShowDepleted(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                                <span className="ml-2">Mostrar lotes agotados</span>
                            </label>
                        </div>
                        <div className="overflow-x-auto max-h-[70vh]">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre / Genética</th>
                                        <th scope="col" className="px-6 py-3">Plantas (Ini/Enr/Disp)</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleBatches.map(batch => {
                                        const genetic = genetics.find(g => g.id === batch.geneticsId);
                                        return (
                                        <tr key={batch.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {batch.name}
                                                <span className="block text-xs text-gray-400">{genetic?.name}</span>
                                            </td>
                                            <td className="px-6 py-4">{`${batch.initialPlantCount} / ${batch.rootedPlantCount ?? 'N/A'} / ${batch.availablePlantCount}`}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-600 text-white">{batch.status}</span></td>
                                            <td className="px-6 py-4 flex flex-col gap-2 items-start">
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={() => handleEditClick(batch)} className="text-emerald-400 hover:underline text-xs">Editar</button>
                                                    <button onClick={() => handleDelete(batch)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                                </div>
                                                {batch.status === PlantBatchStatus.GERMINATION_ROOTING && (
                                                    <button onClick={() => handleLogEntry(batch.id)} className="text-xs font-bold py-1 px-2 rounded bg-gray-600 hover:bg-gray-500 text-white">Registrar Cuidados</button>
                                                )}
                                                {batch.status === PlantBatchStatus.GERMINATION_ROOTING && batch.rootedPlantCount && batch.rootedPlantCount > 0 && (
                                                    <button onClick={() => handleMoveToPreVeg(batch)} className="text-xs font-bold py-1 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Mover a Pre-Veg</button>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BatchManagement;