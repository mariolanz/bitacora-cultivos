
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from './ui/Card';
import { useCrops, useFormulas, useInventory, useLocations, usePlantBatches, useAuth, useMotherPlants } from '../context/AppProvider';
import { LogEntry, CropStage, Formula, PlantBatchStatus, Crop, PlantBatch, SensorDataPoint, MotherPlant, Location, UserRole, User } from '../types';
import { useNavigate } from 'react-router-dom';
import { getStageInfo, getFormulaForWeek, getParentLocationId } from '../services/nutritionService';
import { FOLIAR_PRODUCTS, SUPPLEMENT_PRODUCTS, PLANT_HEALTH_OPTIONS } from '../constants';
import CameraModal from './ui/CameraModal';

// Helper component for dynamic number inputs with a slider
const DynamicNumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
  precision?: number;
  unit?: string;
}> = ({ label, value, onChange, step, min, max, precision = 1, unit }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
        onChange(val);
    } else if (e.target.value === '') {
        onChange(min); // or some other default
    }
  };
  
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label} {unit && `(${unit})`}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-thumb:bg-emerald-500"
        />
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value.toFixed(precision)}
          onChange={handleNumberChange}
          className="w-24 text-center px-2 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          style={{ appearance: 'textfield', MozAppearance: 'textfield' }}
        />
      </div>
    </div>
  );
};

const TargetSelector: React.FC<{
    allCrops: Crop[];
    plantBatches: PlantBatch[];
    motherPlants: MotherPlant[];
    locations: Location[];
    currentUser: User | null;
    onSelect: (id: string) => void;
}> = ({ allCrops, plantBatches, motherPlants, locations, currentUser, onSelect }) => {

    const visibleCrops = useMemo(() => {
        const nonArchivedCrops = allCrops.filter(crop => !crop.isArchived);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return nonArchivedCrops;
        }
        if (!currentUser.locationId) return [];
        const userMainLocationId = currentUser.locationId;
        return nonArchivedCrops.filter(crop => {
            const room = locations.find(l => l.id === crop.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [allCrops, currentUser, locations]);

    const visibleBatches = useMemo(() => {
        const germinatingBatches = plantBatches.filter(b => b.status === PlantBatchStatus.GERMINATION_ROOTING);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return germinatingBatches;
        }
        if (!currentUser.locationId) return [];
        const userMainLocationId = currentUser.locationId;
        return germinatingBatches.filter(batch => batch.sourceLocationId === userMainLocationId || batch.creatorId === currentUser.id);
    }, [plantBatches, currentUser]);

    const visibleMotherPlants = useMemo(() => {
        const activeMotherPlants = motherPlants.filter(p => !p.isArchived);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return activeMotherPlants;
        }
        if (!currentUser.locationId) return [];
        const userMainLocationId = currentUser.locationId;
        return activeMotherPlants.filter(plant => {
            const room = locations.find(l => l.id === plant.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [motherPlants, currentUser, locations]);
    
    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Seleccionar Cultivo, Lote o Planta Madre</h2>
            <p className="text-gray-400 mb-4">Elige para qué quieres registrar una nueva entrada.</p>
            <select
                onChange={(e) => onSelect(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
            >
                <option value="" disabled>-- Elige una opción --</option>
                <optgroup label="Acciones Grupales">
                    <option value="log-all-mother-plants">
                        Registrar para Todas las Plantas Madre
                    </option>
                </optgroup>
                <optgroup label="Cultivos Activos">
                    {visibleCrops.map(crop => (
                        <option key={crop.id} value={crop.id}>
                            {locations.find(l => l.id === crop.locationId)?.name || crop.id}
                        </option>
                    ))}
                </optgroup>
                <optgroup label="Lotes en Germinación/Enraizamiento">
                    {visibleBatches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                            Lote: {batch.name}
                        </option>
                    ))}
                </optgroup>
                 <optgroup label="Plantas Madre Individuales">
                    {visibleMotherPlants.map(plant => (
                        <option key={plant.id} value={plant.id}>
                            Planta Madre: {plant.name}
                        </option>
                    ))}
                </optgroup>
            </select>
        </Card>
    );
};


// Main Log component
const Log: React.FC = () => {
  const { allCrops, activeCrop, saveCrop, setActiveCropId } = useCrops();
  const { plantBatches, activeBatch, savePlantBatch, setActiveBatchId } = usePlantBatches();
  const { motherPlants, activeMotherPlant, saveMotherPlant, setActiveMotherPlantId, saveLogForAllActiveMotherPlants } = useMotherPlants();
  const { locations } = useLocations();
  const { currentUser } = useAuth();
  const { formulas, formulaSchedule } = useFormulas();
  const { inventory } = useInventory();
  const navigate = useNavigate();
  const MAX_PHOTOS = 5;
  const topRef = useRef<HTMLDivElement>(null);

  const [isLoggingForAllMothers, setIsLoggingForAllMothers] = useState(false);
  
  const [formulaForWeek, setFormulaForWeek] = useState<Formula | null>(null);
  const [formData, setFormData] = useState({
    temp: 24,
    humidity: 55,
    leafTemp: 22,
    co2: 400,
    ph: 6.0,
    ppm: 700,
    volume: 200,
    phOut: 0,
    ppmOut: 0,
    notes: ''
  });
  
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [isFoliarOpen, setIsFoliarOpen] = useState(false);
  const [selectedFoliar, setSelectedFoliar] = useState<string[]>([]);
  const [foliarVolume, setFoliarVolume] = useState<number>(10);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [vpd, setVpd] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [sensorData, setSensorData] = useState<SensorDataPoint[] | null>(null);
  
  const [irrigationSuggestion, setIrrigationSuggestion] = useState<string | null>(null);
  const [irrigationChoice, setIrrigationChoice] = useState<'nutrients' | 'supplements' | null>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  const loggingTarget = useMemo(() => activeCrop || activeBatch || activeMotherPlant || isLoggingForAllMothers, [activeCrop, activeBatch, activeMotherPlant, isLoggingForAllMothers]);
  const isLoggingForBatch = useMemo(() => !!activeBatch, [activeBatch]);
  const isLoggingForMotherPlant = useMemo(() => !!activeMotherPlant, [activeMotherPlant]);

  const parentLocationId = useMemo(() => {
    if (activeCrop) {
      return getParentLocationId(activeCrop.locationId, locations);
    }
    if (activeBatch) {
      return activeBatch.sourceLocationId;
    }
    if (activeMotherPlant) {
      return getParentLocationId(activeMotherPlant.locationId, locations);
    }
    if (isLoggingForAllMothers && currentUser) {
      return currentUser.locationId !== 'TODAS' ? currentUser.locationId : undefined;
    }
    return undefined;
  }, [activeCrop, activeBatch, activeMotherPlant, isLoggingForAllMothers, locations, currentUser]);

  const targetName = useMemo(() => {
    if (isLoggingForAllMothers) {
        return 'Todas las Plantas Madre';
    }
    if (activeCrop) {
      return locations.find(l => l.id === activeCrop.locationId)?.name || activeCrop.id;
    }
    if (activeBatch) {
      return `Lote: ${activeBatch.name}`;
    }
    if (activeMotherPlant) {
      return `Planta Madre: ${activeMotherPlant.name}`;
    }
    return '';
  }, [activeCrop, activeBatch, activeMotherPlant, locations, isLoggingForAllMothers]);


  const stageInfo = useMemo(() => {
    if (isLoggingForAllMothers) {
        return { stage: CropStage.VEGETATION, weekInStage: 1 };
    }
    if (activeCrop) {
      return getStageInfo(activeCrop);
    }
    if (activeBatch) {
      const days = Math.floor((new Date().getTime() - new Date(activeBatch.creationDate).getTime()) / (1000 * 3600 * 24));
      return {
        stage: CropStage.CLONING,
        weekInStage: Math.floor(days / 7) + 1,
        daysInStage: days,
        dayOfWeekInStage: (days % 7) + 1,
        totalDays: days,
        totalWeek: Math.floor(days / 7) + 1,
        totalDayOfWeek: (days % 7) + 1,
        canTransition: false,
      };
    }
    if (activeMotherPlant) {
      const days = Math.floor((new Date().getTime() - new Date(activeMotherPlant.sowingDate).getTime()) / (1000 * 3600 * 24));
      return {
        stage: CropStage.VEGETATION,
        weekInStage: Math.floor(days / 7) + 1,
        daysInStage: days,
        dayOfWeekInStage: (days % 7) + 1,
        totalDays: days,
        totalWeek: Math.floor(days / 7) + 1,
        totalDayOfWeek: (days % 7) + 1,
        canTransition: false,
      };
    }
    return null;
  }, [activeCrop, activeBatch, activeMotherPlant, isLoggingForAllMothers]);
  
  useEffect(() => {
    if (stageInfo) {
      const formula = getFormulaForWeek(stageInfo.stage, stageInfo.weekInStage, formulaSchedule, formulas);
      setFormulaForWeek(formula);
      
      let defaultPPM = 700;
      if (irrigationChoice === 'nutrients') {
          defaultPPM = formula?.targetPPM ?? (stageInfo.stage === CropStage.FLOWERING ? 1000 : 700);
      } else if (irrigationChoice === 'supplements') {
          defaultPPM = 200; // Low PPM for supplements
      }

      setFormData(prev => ({
          ...prev,
          ph: 6.0,
          ppm: defaultPPM,
          co2: stageInfo.stage === CropStage.FLOWERING ? 1200 : 400,
      }));
    }
  }, [stageInfo, formulas, formulaSchedule, irrigationChoice]);

   useEffect(() => {
    if (activeCrop) {
        const irrigationLogs = activeCrop.logEntries.filter(l => l.irrigation);
        if (irrigationLogs.length > 0) {
            const lastLog = irrigationLogs[irrigationLogs.length - 1];
            if (lastLog.irrigation && lastLog.irrigation.ppmOut && lastLog.irrigation.ppm && lastLog.irrigation.ppmOut > lastLog.irrigation.ppm * 1.25) {
                setIrrigationSuggestion("PPM de salida alto. Se recomienda riego solo con suplementos o agua para lavar raíces.");
                return;
            }

            const lastThreeIrrigations = irrigationLogs.slice(-3);
            const nutrientIrrigationCount = lastThreeIrrigations.filter(l => {
                if (l.irrigation?.type) {
                    return l.irrigation.type === 'nutrients';
                }
                return !l.supplements || l.supplements.length === 0;
            }).length;

            if (nutrientIrrigationCount >= 2) {
                setIrrigationSuggestion("Se recomienda un riego con suplementos para mantener el balance (2 de nutrición, 1 de suplementos).");
            } else {
                 setIrrigationSuggestion("Se recomienda un riego con nutrición según el programa.");
            }
        } else {
            setIrrigationSuggestion("Primer riego del cultivo. Se recomienda empezar con nutrición según el programa.");
        }
    }
  }, [activeCrop]);

  useEffect(() => {
    const calculateSVP = (temp: number) => (0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)));
    const svpLeaf = calculateSVP(formData.leafTemp);
    const avpAir = calculateSVP(formData.temp) * (formData.humidity / 100);
    const calculatedVpd = svpLeaf - avpAir;
    setVpd(parseFloat(Math.max(0, calculatedVpd).toFixed(2)));
  }, [formData.temp, formData.humidity, formData.leafTemp]);

  const phAlert = useMemo(() => {
    const ph = formData.ph;
    if (irrigationChoice && ph > 0 && (ph < 5.8 || ph > 6.2)) {
        return `¡Alerta! El pH está fuera del rango ideal (5.8 - 6.2). Considera usar un ajustador de pH (pH Up/Down) para corregirlo.`;
    }
    return null;
  }, [formData.ph, irrigationChoice]);

  const handleNumericChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({...prev, notes: e.target.value}));
  };

  const handleCheckboxChange = (
    value: string, 
    list: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
  };

  const handleCapture = (dataUrl: string) => {
    if (photos.length < MAX_PHOTOS) {
      setPhotos(prevPhotos => [...prevPhotos, dataUrl]);
    }
    setIsCameraOpen(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSensorFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '' && line.includes(','));
            if (lines.length < 2) throw new Error("CSV inválido o vacío.");

            const detailedData: SensorDataPoint[] = [];
            let temps: number[] = [];
            let hums: number[] = [];
            
            const header = lines[0].toLowerCase().split(',');
            const timeIndex = header.findIndex(h => h.includes('time') || h.includes('fecha'));
            const tempIndex = header.findIndex(h => h.includes('temp'));
            const humIndex = header.findIndex(h => h.includes('hum'));

            if (timeIndex === -1 || tempIndex === -1 || humIndex === -1) {
                throw new Error("No se pudieron encontrar las columnas 'timestamp', 'temperature', y 'humidity' en el CSV.");
            }

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                const timestamp = values[timeIndex];
                const temp = parseFloat(values[tempIndex]);
                const humidity = parseFloat(values[humIndex]);
                if (timestamp && !isNaN(temp) && !isNaN(humidity)) {
                    temps.push(temp);
                    hums.push(humidity);
                    detailedData.push({ timestamp: new Date(timestamp).toISOString(), temperature: temp, humidity: humidity });
                }
            }
            if (temps.length === 0) throw new Error("No se encontraron datos válidos.");

            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;
            const minHum = Math.min(...hums);
            const maxHum = Math.max(...hums);

            const summary = `Resumen de datos del sensor (${detailedData.length} lecturas):\n- Temp: Min ${minTemp.toFixed(1)}°C, Prom ${avgTemp.toFixed(1)}°C, Max ${maxTemp.toFixed(1)}°C\n- Humedad: Min ${minHum.toFixed(0)}%, Prom ${avgHum.toFixed(0)}%, Max ${maxHum.toFixed(0)}%`;
            setFormData(prev => ({
                ...prev,
                notes: `${prev.notes}\n\n${summary}`.trim()
            }));
            setSensorData(detailedData);
            alert("Datos del sensor procesados. El resumen se ha añadido a las notas y los datos detallados se guardarán con esta entrada.");
        } catch (error) {
            setSensorData(null);
            alert(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Formato incorrecto.'}`);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleTargetSelection = (id: string) => {
      setIsLoggingForAllMothers(false);
      setActiveCropId(null);
      setActiveBatchId(null);
      setActiveMotherPlantId(null);
      
      if (id === 'log-all-mother-plants') {
          setIsLoggingForAllMothers(true);
      } else if (id.startsWith('crop-')) {
          setActiveCropId(id);
      } else if (id.startsWith('mp-')) {
          setActiveMotherPlantId(id);
      } else {
          setActiveBatchId(id);
      }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingTarget) return;
    
     if (!irrigationChoice) {
        alert("Por favor, selecciona un tipo de riego antes de guardar.");
        return;
    }
    
    const base64Photos = photos.map(p => p.split(',')[1]);

    const newLogEntry: Omit<LogEntry, 'id'> = {
      date: new Date().toISOString(),
      environmental: {
        temp: formData.temp,
        humidity: formData.humidity,
        leafTemp: formData.leafTemp,
        vpd: vpd,
        co2: formData.co2,
      },
      irrigation: {
        type: irrigationChoice,
        ph: formData.ph,
        ppm: formData.ppm,
        volume: formData.volume,
        phOut: formData.phOut || undefined,
        ppmOut: formData.ppmOut || undefined,
      },
      foliarSpray: FOLIAR_PRODUCTS.filter(p => selectedFoliar.includes(p.name)),
      supplements: irrigationChoice === 'supplements' ? SUPPLEMENT_PRODUCTS.filter(p => selectedSupplements.includes(p.name)) : [],
      plantHealth: selectedHealth,
      notes: formData.notes,
      photos: base64Photos,
      sensorData: sensorData || undefined,
    };
    
    if (isLoggingForAllMothers) {
        saveLogForAllActiveMotherPlants(newLogEntry);
        navigate('/');
        return;
    }

    if (isLoggingForMotherPlant && activeMotherPlant) {
      const updatedPlant = {
        ...activeMotherPlant,
        logEntries: [...activeMotherPlant.logEntries, {...newLogEntry, id: `log-${Date.now()}`}]
      };
      saveMotherPlant(updatedPlant);
      setActiveMotherPlantId(null);
      navigate('/mother-plants');
    } else if (isLoggingForBatch && activeBatch) {
      const updatedBatch = {
        ...activeBatch,
        logEntries: [...activeBatch.logEntries, {...newLogEntry, id: `log-${Date.now()}`}]
      };
      savePlantBatch(updatedBatch);
      setActiveBatchId(null);
      navigate('/batches');
    } else if (activeCrop) {
      const updatedCrop = {
          ...activeCrop,
          logEntries: [...activeCrop.logEntries, {...newLogEntry, id: `log-${Date.now()}`}]
      };
      saveCrop(updatedCrop);
      setActiveCropId(activeCrop.id); // Ensure it stays active
      navigate('/');
    }
  }

  const isSuggestionWarning = irrigationSuggestion?.toLowerCase().includes('ppm de salida alto');

  if (!loggingTarget) {
    return (
        <div ref={topRef}>
            <TargetSelector 
                allCrops={allCrops}
                plantBatches={plantBatches}
                motherPlants={motherPlants}
                locations={locations}
                currentUser={currentUser}
                onSelect={handleTargetSelection}
            />
        </div>
    );
  }

  return (
    <div ref={topRef}>
      <h1 className="text-3xl font-bold mb-6 text-white">Nueva Entrada de Registro para {targetName}</h1>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        <Card>
          <h3 className="text-xl font-semibold text-emerald-500 mb-4">Parámetros Ambientales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <DynamicNumberInput label="Temperatura" unit="°C" value={formData.temp} onChange={(v) => handleNumericChange('temp', v)} step={0.1} min={15} max={35} precision={1} />
            <DynamicNumberInput label="Humedad" unit="%" value={formData.humidity} onChange={(v) => handleNumericChange('humidity', v)} step={1} min={30} max={90} precision={0} />
            <DynamicNumberInput label="Temp. Hoja" unit="°C" value={formData.leafTemp} onChange={(v) => handleNumericChange('leafTemp', v)} step={0.1} min={15} max={35} precision={1} />
            <DynamicNumberInput label="CO2" unit="ppm" value={formData.co2} onChange={(v) => handleNumericChange('co2', v)} step={50} min={300} max={2000} precision={0} />
             <div>
              <label className="block text-sm text-gray-400 mb-1">VPD (calculado)</label>
              <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md font-bold text-white">{vpd.toFixed(2)} kPa</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-emerald-500 mb-4">Datos de Riego</h3>
          
          {irrigationSuggestion && !isLoggingForBatch && (
              <div className={`mb-4 p-3 bg-gray-900/50 rounded-lg border ${isSuggestionWarning ? 'border-yellow-800' : 'border-emerald-800'}`}>
                  <p className={`font-semibold ${isSuggestionWarning ? 'text-yellow-400' : 'text-emerald-400'}`}>Sugerencia del Sistema:</p>
                  <p className="text-sm text-gray-300">{irrigationSuggestion}</p>
              </div>
          )}

          {!irrigationChoice ? (
              <div className="flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => setIrrigationChoice('nutrients')} className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 rounded-md font-bold text-white transition-colors">Riego con Nutrición</button>
                  <button type="button" onClick={() => setIrrigationChoice('supplements')} className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-bold text-white transition-colors">Riego con Suplementos</button>
              </div>
          ) : (
          <>
              <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-lg text-white">
                      Tipo de Riego: <span className={irrigationChoice === 'nutrients' ? 'text-sky-400' : 'text-purple-400'}>
                          {irrigationChoice === 'nutrients' ? 'Nutrición' : 'Suplementos'}
                      </span>
                  </p>
                  <button type="button" onClick={() => setIrrigationChoice(null)} className="text-xs text-gray-400 hover:underline">Cambiar tipo</button>
              </div>
              
              <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-1 font-bold">Volumen Total de Riego (L)</label>
                  <input type="number" step={10} value={formData.volume} onChange={(e) => handleNumericChange('volume', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
              </div>
              
              {irrigationChoice === 'nutrients' && formulaForWeek && (
                <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-gray-300">Fórmula de la Semana: <span className="text-emerald-400">{formulaForWeek.name}</span></h4>
                    {formulaForWeek.nutrients.length > 0 && formData.volume > 0 && (
                        <div className="mt-2">
                             <p className="text-sm text-gray-300 mb-1"><b>Preparación para {formData.volume} L:</b></p>
                            <ul className="text-xs text-gray-400 list-disc list-inside">
                                {formulaForWeek.nutrients.map(n => {
                                    const nutrientItem = inventory.find(item => item.id === `${n.inventoryItemId}-${parentLocationId}`);
                                    const totalAmount = n.amountPerLiter * formData.volume;
                                    return <li key={n.inventoryItemId}>{nutrientItem?.name || n.inventoryItemId}: <b>{totalAmount.toFixed(2)} {nutrientItem?.unit || 'g'}</b></li>
                                })}
                            </ul>
                        </div>
                    )}
                     {formulaForWeek.targetPPM !== undefined && (
                         <p className="text-sm text-gray-300 mt-2"><b>PPM Objetivo:</b> <span className="font-bold text-emerald-400">{formulaForWeek.targetPPM}</span></p>
                     )}
                </div>
              )}
              
              {irrigationChoice === 'supplements' && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-300 mb-2">Seleccionar Suplementos de Riego</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 p-2 bg-gray-900/50 rounded-md">
                        {SUPPLEMENT_PRODUCTS.map(product => {
                            const isSelected = selectedSupplements.includes(product.name);
                            const doseValue = parseFloat(product.dose);
                            const unitMatch = product.dose.match(/([a-zA-Z]+)\/L/);
                            const unit = unitMatch ? unitMatch[1] : '';
                            const totalAmount = (doseValue * formData.volume).toFixed(2);

                            return (
                                <label key={product.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
                                    <div className="flex items-center">
                                        <input type="checkbox" checked={isSelected} onChange={() => handleCheckboxChange(product.name, selectedSupplements, setSelectedSupplements)} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                                        <span className="ml-3 text-gray-300">{product.name} <span className="text-xs text-gray-400">({product.dose})</span></span>
                                    </div>
                                    {isSelected && formData.volume > 0 && (
                                        <span className="font-bold text-emerald-400 ml-2 text-sm">
                                            {totalAmount} {unit}
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <DynamicNumberInput label="pH Entrada" value={formData.ph} onChange={(v) => handleNumericChange('ph', v)} step={0.1} min={5} max={7} precision={1} />
                    {phAlert && (
                        <div className="mt-2 text-xs text-yellow-400 p-2 bg-yellow-900/30 rounded border border-yellow-800">
                            {phAlert}
                        </div>
                    )}
                </div>
                <DynamicNumberInput label="PPM Entrada" value={formData.ppm} onChange={(v) => handleNumericChange('ppm', v)} step={10} min={0} max={2000} precision={0} />
                <DynamicNumberInput label="pH Salida" value={formData.phOut} onChange={(v) => handleNumericChange('phOut', v)} step={0.1} min={0} max={10} precision={1} />
                <DynamicNumberInput label="PPM Salida" value={formData.ppmOut} onChange={(v) => handleNumericChange('ppmOut', v)} step={10} min={0} max={3000} precision={0} />
              </div>
          </>
          )}
        </Card>
        
        <Card>
             <button type="button" onClick={() => setIsFoliarOpen(!isFoliarOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-semibold text-emerald-500">Aplicación Foliar</h3>
                <span className="text-xl transform transition-transform">{isFoliarOpen ? '▲' : '▼'}</span>
            </button>
            {isFoliarOpen && (
                <div className="mt-4">
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-1 font-bold">Volumen Total de Aspersión (L)</label>
                        <input
                            type="number"
                            step={1}
                            value={foliarVolume}
                            onChange={(e) => setFoliarVolume(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                        />
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {FOLIAR_PRODUCTS.map(product => {
                           const isSelected = selectedFoliar.includes(product.name);
                           const doseValue = parseFloat(product.dose);
                           const unitMatch = product.dose.match(/([a-zA-Z]+)\/L/);
                           const unit = unitMatch ? unitMatch[1] : '';
                           const totalAmount = (doseValue * foliarVolume).toFixed(2);
                            return (
                                <label key={product.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
                                    <div className="flex items-center">
                                        <input type="checkbox" checked={isSelected} onChange={() => handleCheckboxChange(product.name, selectedFoliar, setSelectedFoliar)} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                                        <span className="ml-3 text-gray-300">{product.name} <span className="text-xs text-gray-400">({product.dose})</span></span>
                                    </div>
                                    {isSelected && foliarVolume > 0 && (
                                        <span className="font-bold text-emerald-400 ml-2 text-sm">
                                            {totalAmount} {unit}
                                        </span>
                                    )}
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-emerald-500 mb-4">Fotos y Datos de Sensores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Fotos del Día</label>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      disabled={photos.length >= MAX_PHOTOS}
                      className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md transition-colors disabled:opacity-50"
                    >
                      Tomar Foto ({photos.length}/{MAX_PHOTOS})
                    </button>
                    {photos.length >= MAX_PHOTOS && <p className="text-xs text-center text-gray-500 mt-2">Límite de fotos alcanzado.</p>}
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo} alt={`Foto del día ${index + 1}`} className="w-full h-auto rounded-lg object-cover aspect-square" />
                          <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Importar Datos de Sensor (CSV)</label>
                    <p className="text-xs text-gray-500 mb-2">Formato: cabecera con 'timestamp', 'temperature', 'humidity', luego los datos.</p>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleSensorFile}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                </div>
            </div>
        </Card>

        <Card>
            <h3 className="text-xl font-semibold text-emerald-500 mb-4">Salud General y Notas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="max-h-96 overflow-y-auto pr-2">
                  {Object.entries(PLANT_HEALTH_OPTIONS).map(([category, options]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-semibold text-gray-300 border-b border-gray-700 pb-1 mb-2">{category}</h4>
                      <div className="space-y-2">
                        {(options as string[]).map(option => (
                          <label key={option} className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={selectedHealth.includes(option)} onChange={() => handleCheckboxChange(option, selectedHealth, setSelectedHealth)} className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                            <span className="ml-2 text-gray-400 text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Notas Adicionales</h4>
                  <textarea rows={10} value={formData.notes} onChange={handleTextChange} className="w-full h-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" placeholder="Observaciones, defoliaciones, podas, etc."></textarea>
                </div>
            </div>
        </Card>

        <div className="flex justify-end">
          <button type="submit" className="py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors">
            Guardar Entrada
          </button>
        </div>
      </form>
    </div>
  );
};

export default Log;
