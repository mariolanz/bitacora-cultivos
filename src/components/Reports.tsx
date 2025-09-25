
import React, { useState, useMemo } from 'react';
import { useCrops, useExpenses, useLocations, usePlantBatches, useGenetics } from '../context/AppProvider';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import { HarvestPrediction, Crop } from '../types';
import { predictHarvestYield } from '../services/geminiService';
import { getParentLocationId, getStageInfo } from '../services/nutritionService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CropStatusCard: React.FC<{ crop: Crop }> = ({ crop }) => {
    const { plantBatches } = usePlantBatches();
    const { genetics } = useGenetics();
    
    const stageInfo = getStageInfo(crop);
    
    const batchDetails = useMemo(() => {
        return crop.plantCounts.map(pc => {
            const batch = plantBatches.find(b => b.id === pc.batchId);
            return {
                id: pc.batchId,
                count: pc.count,
                geneticName: genetics.find(g => g.id === batch?.geneticsId)?.name || 'Desconocida'
            };
        });
    }, [crop, plantBatches, genetics]);

    const totalPlants = crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0);

    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Estado Actual del Cultivo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Etapa</p>
                    <p className="text-2xl font-bold text-white">{stageInfo.stage}</p>
                </div>
                 <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Semana / Día</p>
                    <p className="text-2xl font-bold text-white">{stageInfo.weekInStage} / {stageInfo.dayOfWeekInStage}</p>
                </div>
                 <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Días Totales</p>
                    <p className="text-2xl font-bold text-white">{stageInfo.totalDays}</p>
                </div>
                 <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">Nº de Plantas</p>
                    <p className="text-2xl font-bold text-white">{totalPlants}</p>
                </div>
            </div>
             <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-300">Lotes en Cultivo</h3>
                <ul className="text-sm text-gray-400 list-disc list-inside mt-1">
                    {batchDetails.map(bd => (
                         <li key={bd.id}>{bd.id} ({bd.geneticName}): {bd.count} plantas</li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};

const ToggleButton: React.FC<{ label: string; color: string; isActive: boolean; onClick: () => void }> = ({ label, color, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${isActive ? `${color} text-white` : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
        {label}
    </button>
);


const Reports: React.FC = () => {
  const { allCrops, activeCrop } = useCrops();
  const { expenses } = useExpenses();
  const { locations } = useLocations();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<HarvestPrediction | null>(null);
  const [error, setError] = useState('');
  
  const [selectedCropId, setSelectedCropId] = useState<string | null>(activeCrop?.id || null);
  const reportCrop = useMemo(() => allCrops.find(c => c.id === selectedCropId), [allCrops, selectedCropId]);

  const [visibleLines, setVisibleLines] = useState({
    temp: true,
    leafTemp: true,
    humidity: true,
    vpd: true,
  });

  const handleToggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const cropName = useMemo(() => {
    if (!reportCrop) return '';
    const location = locations.find(l => l.id === reportCrop.locationId);
    return location?.name || reportCrop.id;
  }, [reportCrop, locations]);


  const handlePredict = async () => {
      if (!reportCrop) return;
      setIsLoading(true);
      setError('');
      setPrediction(null);
      try {
          const result = await predictHarvestYield(reportCrop);
          setPrediction(result);
      } catch (err) {
          setError('No se pudo obtener la predicción.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleExportCSV = () => {
      if (!reportCrop || reportCrop.logEntries.length === 0) return;

      const headers = "Fecha,Temp,Temp_Hoja,Humedad,VPD,CO2,pH_Entrada,PPM_Entrada,Volumen,Costo_Riego,pH_Salida,PPM_Salida,Salud_Planta,Notas\n";
      const rows = reportCrop.logEntries.map(log => {
          const date = new Date(log.date).toLocaleString();
          const notes = `"${log.notes?.replace(/"/g, '""') || ''}"`;
          return [
              date,
              log.environmental?.temp ?? '', log.environmental?.leafTemp ?? '', log.environmental?.humidity ?? '', log.environmental?.vpd ?? '', log.environmental?.co2 ?? '',
              log.irrigation?.ph ?? '', log.irrigation?.ppm ?? '', log.irrigation?.volume ?? '', log.irrigation?.cost?.toFixed(2) ?? '0.00', log.irrigation?.phOut ?? '', log.irrigation?.ppmOut ?? '',
              log.plantHealth?.join('; ') || '',
              notes
          ].join(',');
      }).join('\n');
      
      const csvContent = headers + rows;
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${cropName}_log.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const costAnalysis = useMemo(() => {
    if (!reportCrop) return null;

    const nutrientCost = reportCrop.logEntries.reduce((acc, log) => acc + (log.irrigation?.cost || 0), 0);
    
    const parentLocationId = getParentLocationId(reportCrop.locationId, locations);
    const generalExpenses = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            const startDate = new Date(reportCrop.cloningDate);
            const endDate = reportCrop.harvestDate ? new Date(reportCrop.harvestDate) : new Date();
            return e.locationId === parentLocationId && expenseDate >= startDate && expenseDate <= endDate;
        })
        .reduce((acc, e) => acc + e.amount, 0);

    const totalCost = nutrientCost + generalExpenses;
    const dryWeight = reportCrop.harvestData?.totalDryWeight || 0;
    const costPerGram = dryWeight > 0 ? totalCost / dryWeight : 0;

    return { nutrientCost, generalExpenses, totalCost, costPerGram, dryWeight };

  }, [reportCrop, expenses, locations]);


  const chartData = reportCrop?.logEntries.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    Temperatura: log.environmental?.temp,
    Temp_Hoja: log.environmental?.leafTemp,
    Humedad: log.environmental?.humidity,
    VPD: log.environmental?.vpd,
    pH_In: log.irrigation?.ph,
    pH_Out: log.irrigation?.phOut,
    PPM_In: log.irrigation?.ppm,
    PPM_Out: log.irrigation?.ppmOut,
  })) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-white truncate">Reportes {cropName && `para ${cropName}`}</h1>
        <div className="flex items-center gap-4">
          <select 
            value={selectedCropId || ''} 
            onChange={e => setSelectedCropId(e.target.value)} 
            className="w-full sm:w-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
              <option value="">Seleccionar un cultivo...</option>
              {allCrops.filter(c => !c.isArchived).map(crop => (
                  <option key={crop.id} value={crop.id}>
                      {locations.find(l => l.id === crop.locationId)?.name || crop.id}
                  </option>
              ))}
          </select>
          <button
              onClick={handleExportCSV}
              disabled={!reportCrop || reportCrop.logEntries.length === 0}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-md transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
              Exportar a CSV
          </button>
        </div>
      </div>
      
      {!reportCrop ? (
         <Card><p className="text-center text-gray-400">Por favor, selecciona un cultivo de la lista para ver los reportes.</p></Card>
      ) : (
      <>
        <CropStatusCard crop={reportCrop} />
        
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                  <h2 className="text-xl font-semibold mb-4 text-emerald-500">Análisis de Costos</h2>
                  {costAnalysis ? (
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-gray-400">Costo de Nutrientes:</span>
                              <span className="font-bold text-white">${costAnalysis.nutrientCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-gray-400">Gastos Generales (Luz, Renta, etc.):</span>
                              <span className="font-bold text-white">${costAnalysis.generalExpenses.toFixed(2)}</span>
                          </div>
                          <hr className="border-gray-600" />
                          <div className="flex justify-between items-center text-lg">
                              <span className="text-gray-300">Costo Total del Cultivo:</span>
                              <span className="font-bold text-emerald-400">${costAnalysis.totalCost.toFixed(2)}</span>
                          </div>
                          <hr className="border-gray-600" />
                           {costAnalysis.dryWeight > 0 ? (
                              <div className="text-center bg-gray-900/50 p-4 rounded-lg">
                                  <p className="text-gray-400 text-sm">Costo por Gramo Producido</p>
                                  <p className="text-3xl font-bold text-emerald-500">${costAnalysis.costPerGram.toFixed(3)}</p>
                                  <p className="text-xs text-gray-500">(Basado en {costAnalysis.dryWeight}g de peso seco)</p>
                              </div>
                           ) : (
                               <p className="text-center text-gray-500 p-4">Registra el peso seco en la sección de "Cosecha" para calcular el costo por gramo.</p>
                           )}
                      </div>
                  ) : <p className="text-gray-500">Calculando costos...</p>}
              </Card>
              <Card>
                  <h2 className="text-xl font-semibold mb-4 text-emerald-500">Predicción de Cosecha con IA</h2>
                  <div className="flex flex-col gap-4">
                      <button
                          onClick={handlePredict}
                          disabled={isLoading}
                          className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors disabled:bg-gray-500"
                      >
                          {isLoading ? 'Prediciendo...' : 'Predecir Cosecha'}
                      </button>
                      <div className="flex-1">
                          {isLoading && <Spinner />}
                          {error && <p className="text-red-500">{error}</p>}
                          {prediction && (
                              <div className="space-y-2 bg-gray-700 p-4 rounded-md">
                                  <p><strong className="text-white">Rango de Cosecha:</strong> {prediction.yield_range}</p>
                                  <p><strong className="text-white">Razonamiento:</strong> {prediction.reasoning}</p>
                                  <p><strong className="text-white">Confianza:</strong> {prediction.confidence_level}</p>
                              </div>
                          )}
                      </div>
                  </div>
              </Card>
          </div>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-emerald-500">Condiciones Ambientales</h2>
          <div className="flex justify-center flex-wrap gap-2 mb-4">
              <ToggleButton label="Temp. Ambiente" color="bg-red-500" isActive={visibleLines.temp} onClick={() => handleToggleLine('temp')} />
              <ToggleButton label="Temp. Hoja" color="bg-orange-500" isActive={visibleLines.leafTemp} onClick={() => handleToggleLine('leafTemp')} />
              <ToggleButton label="Humedad" color="bg-blue-500" isActive={visibleLines.humidity} onClick={() => handleToggleLine('humidity')} />
              <ToggleButton label="VPD" color="bg-yellow-500" isActive={visibleLines.vpd} onClick={() => handleToggleLine('vpd')} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="date" stroke="#A0AEC0" />
              <YAxis yAxisId="temp" stroke="#F56565" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#F56565' }} />
              <YAxis yAxisId="hum" orientation="right" stroke="#4299E1" label={{ value: '%', angle: -90, position: 'insideRight', fill: '#4299E1' }} />
              <YAxis yAxisId="vpd" orientation="right" stroke="#ECC94B" label={{ value: 'kPa', angle: -90, position: 'insideRight', fill: '#ECC94B' }} domain={[0, 'auto']} style={{ transform: 'translateX(50px)' }} />
              <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
              <Legend />
              {visibleLines.temp && <Line yAxisId="temp" type="monotone" dataKey="Temperatura" stroke="#F56565" name="Temp. Ambiente" dot={false} />}
              {visibleLines.leafTemp && <Line yAxisId="temp" type="monotone" dataKey="Temp_Hoja" stroke="#ED8936" name="Temp. Hoja" dot={false} />}
              {visibleLines.humidity && <Line yAxisId="hum" type="monotone" dataKey="Humedad" stroke="#4299E1" dot={false} />}
              {visibleLines.vpd && <Line yAxisId="vpd" type="monotone" dataKey="VPD" stroke="#ECC94B" name="VPD (kPa)" dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-emerald-500">Análisis de PPM</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="date" stroke="#A0AEC0" />
                    <YAxis stroke="#A0AEC0" />
                    <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                    <Legend />
                    <Bar dataKey="PPM_In" fill="#667EEA" name="PPM Entrada" />
                    <Bar dataKey="PPM_Out" fill="#ED64A6" name="PPM Salida" />
                </BarChart>
            </ResponsiveContainer>
          </Card>
           <Card>
            <h2 className="text-xl font-semibold mb-4 text-emerald-500">Análisis de pH</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" />
                <YAxis domain={[5, 8]} stroke="#A0AEC0" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                <Legend />
                <Line type="monotone" dataKey="pH_In" stroke="#ED8936" name="pH Entrada" dot={false} />
                <Line type="monotone" dataKey="pH_Out" stroke="#4FD1C5" name="pH Salida" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </>
      )}

    </div>
  );
};

export default Reports;