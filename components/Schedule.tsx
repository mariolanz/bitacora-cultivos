

import React, { useMemo } from 'react';
import { useCrops, useLocations, useAuth } from '../context/AppProvider';
import { getStageInfo } from '../services/nutritionService';
import Card from './ui/Card';
import { CropStage, UserRole } from '../types';

const stageDisplayMap: Record<CropStage, { abbr: string; color: string }> = {
    [CropStage.CLONING]: { abbr: 'clone', color: 'bg-yellow-800' },
    [CropStage.PRE_VEGETATION]: { abbr: 'pv', color: 'bg-orange-800' },
    [CropStage.VEGETATION]: { abbr: 'v', color: 'bg-sky-800' },
    [CropStage.FLOWERING]: { abbr: 'f', color: 'bg-green-800' },
    [CropStage.DRYING_CURING]: { abbr: 's', color: 'bg-indigo-800' },
    [CropStage.HARVESTED]: { abbr: 'c', color: 'bg-blue-800' },
};

const getWeekStartDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};


const Schedule: React.FC = () => {
    const { allCrops } = useCrops();
    const { locations } = useLocations();
    const { currentUser } = useAuth();

    const crops = useMemo(() => {
        const nonArchived = allCrops.filter(c => !c.isArchived);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return nonArchived;
        }
        if (!currentUser.locationId) return [];

        const userMainLocationId = currentUser.locationId;

        return nonArchived.filter(crop => {
            const room = locations.find(l => l.id === crop.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [allCrops, currentUser, locations]);

    const extendedStageDisplayMap = {
        ...stageDisplayMap,
        TRIMMING: { abbr: 't', color: 'bg-slate-600' },
    };

    const weeks = useMemo(() => {
        const today = new Date();
        const startOfWeek = getWeekStartDate(today);
        const weeksArray: Date[] = [];
        
        // Go back 8 weeks
        for (let i = 8; i > 0; i--) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() - (i * 7));
            weeksArray.push(date);
        }

        // Add current and next 16 weeks
        for (let i = 0; i < 16; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + (i * 7));
            weeksArray.push(date);
        }
        return weeksArray;
    }, []);

    const currentWeekStartString = getWeekStartDate(new Date()).toISOString().split('T')[0];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Cronograma de Cultivos</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 border border-gray-600 sticky left-0 bg-gray-700 z-20 min-w-32">Cultivo</th>
                                {weeks.map(week => {
                                    const weekStart = getWeekStartDate(week).toISOString().split('T')[0];
                                    const isCurrentWeek = weekStart === currentWeekStartString;
                                    return (
                                        <th key={week.toISOString()} className={`p-2 border border-gray-600 min-w-20 ${isCurrentWeek ? 'bg-emerald-800' : ''}`}>
                                            {week.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {crops.map(crop => {
                                const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;
                                return (
                                    <tr key={crop.id} className="odd:bg-gray-800 even:bg-gray-700/50">
                                        <td className="font-semibold p-2 border border-gray-600 sticky left-0 bg-inherit z-10">{cropName}</td>
                                        {weeks.map(week => {
                                            const midOfWeek = new Date(week);
                                            midOfWeek.setDate(midOfWeek.getDate() + 3);

                                            const weekStart = getWeekStartDate(week).toISOString().split('T')[0];
                                            const isCurrentWeek = weekStart === currentWeekStartString;

                                            let text = '';
                                            let color = '';

                                            const isFutureWeek = weekStart > currentWeekStartString;

                                            if (isFutureWeek) {
                                                // Projection Logic for future weeks
                                                if (crop.flowerDate) {
                                                    const flowerDate = new Date(crop.flowerDate);
                                                    if (midOfWeek >= flowerDate) {
                                                        const weeksSinceFlowerStart = Math.floor((midOfWeek.getTime() - flowerDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
                                                        const projectedColor = 'bg-gray-600 text-gray-400';

                                                        if (weeksSinceFlowerStart >= 0 && weeksSinceFlowerStart < 9) { // Flowering weeks 1-9
                                                            text = `${weeksSinceFlowerStart + 1}${stageDisplayMap[CropStage.FLOWERING].abbr}`;
                                                            color = projectedColor;
                                                        } else if (weeksSinceFlowerStart < 11) { // Drying weeks 1-2 (weeks 10, 11)
                                                            const weekInDrying = weeksSinceFlowerStart - 8;
                                                            text = `${weekInDrying}${stageDisplayMap[CropStage.DRYING_CURING].abbr}`;
                                                            color = projectedColor;
                                                        } else if (weeksSinceFlowerStart < 12) { // Trimming week 1 (week 12)
                                                            text = `1${extendedStageDisplayMap.TRIMMING.abbr}`;
                                                            color = projectedColor;
                                                        }
                                                    }
                                                }
                                            } else {
                                                // Logic for past and current weeks
                                                if (midOfWeek < new Date(crop.cloningDate)) {
                                                    // Crop hasn't started, cell remains empty
                                                } else if (crop.flowerDate && midOfWeek >= new Date(crop.flowerDate)) {
                                                    const flowerDate = new Date(crop.flowerDate);
                                                    const weeksSinceFlowerStart = Math.floor((midOfWeek.getTime() - flowerDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

                                                    if (weeksSinceFlowerStart >= 0 && weeksSinceFlowerStart < 9) { // Flowering weeks 1-9
                                                        text = `${weeksSinceFlowerStart + 1}${stageDisplayMap[CropStage.FLOWERING].abbr}`;
                                                        color = `${stageDisplayMap[CropStage.FLOWERING].color} text-white`;
                                                    } else if (weeksSinceFlowerStart < 11) { // Drying weeks 1-2 (weeks 10, 11)
                                                        const weekInDrying = weeksSinceFlowerStart - 8;
                                                        text = `${weekInDrying}${stageDisplayMap[CropStage.DRYING_CURING].abbr}`;
                                                        color = `${stageDisplayMap[CropStage.DRYING_CURING].color} text-white`;
                                                    } else if (weeksSinceFlowerStart < 12) { // Trimming week 1 (week 12)
                                                        text = `1${extendedStageDisplayMap.TRIMMING.abbr}`;
                                                        color = `${extendedStageDisplayMap.TRIMMING.color} text-white`;
                                                    } else { // Harvested
                                                        text = stageDisplayMap[CropStage.HARVESTED].abbr;
                                                        color = `${stageDisplayMap[CropStage.HARVESTED].color} text-white`;
                                                    }
                                                } else {
                                                    // Before flowering or if flower date not set, use standard logic
                                                    const stageInfo = getStageInfo(crop, midOfWeek);
                                                    const displayInfo = stageDisplayMap[stageInfo.stage];
                                                    text = `${stageInfo.weekInStage}${displayInfo.abbr}`;
                                                    color = `${displayInfo.color} text-white`;
                                                }
                                            }

                                            return (
                                                <td key={week.toISOString()} className={`p-2 border border-gray-600 text-center font-bold ${color || ''} ${isCurrentWeek ? 'ring-2 ring-emerald-400 inset-0' : ''}`}>
                                                    {text}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Schedule;