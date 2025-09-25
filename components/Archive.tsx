import React, { useMemo } from 'react';
import { useCrops, useGenetics, useConfirmation, useLocations } from '../context/AppProvider';
import Card from './ui/Card';

const Archive: React.FC = () => {
    const { allCrops, restoreCrop, deleteCrop } = useCrops();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();

    const archivedCrops = allCrops.filter(crop => crop.isArchived);

    const getCropName = (crop: typeof archivedCrops[0]) => {
        return locations.find(l => l.id === crop.locationId)?.name || crop.id;
    }

    const handleRestore = (cropId: string, cropName: string) => {
        showConfirmation(`¿Estás seguro de que quieres restaurar el cultivo "${cropName}"? Volverá al panel principal.`, () => {
            restoreCrop(cropId);
        });
    };
    
    const handleDelete = (cropId: string, cropName: string) => {
         showConfirmation(`¿Estás seguro de que quieres eliminar PERMANENTEMENTE el cultivo archivado "${cropName}"? Esta acción no se puede deshacer.`, () => {
            deleteCrop(cropId);
        });
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Cultivos Archivados</h1>
            {archivedCrops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedCrops.sort((a,b) => new Date(b.harvestDate || 0).getTime() - new Date(a.harvestDate || 0).getTime()).map(crop => {
                        const genetic = genetics.find(g => g.id === crop.geneticsId);
                        const cropName = getCropName(crop);
                        return (
                            <Card key={crop.id}>
                                <h3 className="text-lg font-bold text-white">{cropName}</h3>
                                <p className="text-sm text-gray-400">{genetic?.name || 'N/A'}</p>
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    <p>Cosechado el: {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</p>
                                    {/* Fix: Use totalDryWeight instead of dryWeight */}
                                    <p>Peso Seco: {crop.harvestData?.totalDryWeight || 0} g</p>
                                </div>
                                <div className="mt-4 flex justify-end gap-4">
                                    <button onClick={() => handleDelete(crop.id, cropName)} className="text-xs text-red-400 hover:text-red-300">Eliminar</button>
                                    <button onClick={() => handleRestore(crop.id, cropName)} className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white">Restaurar</button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <p className="text-center text-gray-500">No hay cultivos archivados.</p>
                </Card>
            )}
        </div>
    );
};

export default Archive;
