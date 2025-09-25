
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import useSessionStorage from '../hooks/useSessionStorage';
import { User, Crop, PlantBatch, Location, InventoryItem, Formula, FormulaSchedule, Genetics, Notification, Expense, UserRole, Task, Announcement, PlantBatchStatus, LogEntry, MaintenanceLog, MotherPlant } from '../types';
import * as D from '../constants';
import { getStageInfo, getFormulaForWeek, getParentLocationId } from '../services/nutritionService';


// --- Type Definitions for Contexts ---

interface AuthContextType {
  users: User[];
  currentUser: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  createUser: (user: Omit<User, 'id' | 'roles'>) => void;
  deleteUser: (userId: string) => void;
  saveUser: (user: User) => void;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
}
interface CropContextType {
  allCrops: Crop[];
  activeCropId: string | null;
  activeCrop: Crop | null;
  saveCrop: (crop: Crop) => void;
  deleteCrop: (cropId: string) => void;
  setActiveCropId: (id: string | null) => void;
  archiveCrop: (cropId: string) => void;
  restoreCrop: (cropId: string) => void;
}
interface PlantBatchContextType {
  plantBatches: PlantBatch[];
  activeBatchId: string | null;
  activeBatch: PlantBatch | null;
  savePlantBatch: (batch: PlantBatch, sourceMotherPlantId?: string) => void;
  deletePlantBatch: (batchId: string) => boolean;
  setActiveBatchId: (id: string | null) => void;
}
interface MotherPlantContextType {
  motherPlants: MotherPlant[];
  activeMotherPlantId: string | null;
  activeMotherPlant: MotherPlant | null;
  saveMotherPlant: (plant: MotherPlant) => void;
  deleteMotherPlant: (plantId: string) => void;
  setActiveMotherPlantId: (id: string | null) => void;
  archiveMotherPlant: (plantId: string) => void;
  restoreMotherPlant: (plantId: string) => void;
  saveLogForAllActiveMotherPlants: (logEntry: Omit<LogEntry, 'id'>) => void;
}
interface GeneticsContextType {
  genetics: Genetics[];
  saveGenetic: (genetic: Genetics) => void;
  deleteGenetic: (geneticId: string) => void;
}
interface LocationContextType {
  locations: Location[];
  saveLocation: (location: Location) => void;
  deleteLocation: (locationId: string) => void;
}
interface TaskContextType {
    tasks: Task[];
    saveTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    completeTaskForCrop: (taskId: string, cropId: string, userId: string) => void;
    completeMaintenanceTask: (task: Task, userId: string, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[]) => void;
}
interface MaintenanceLogContextType {
  maintenanceLogs: MaintenanceLog[];
}
interface InventoryContextType {
    inventory: InventoryItem[];
    saveInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (itemId: string) => void;
    addPurchaseToItem: (itemId: string, purchaseQuantity: number, totalCost: number) => void;
}
interface FormulaContextType {
    formulas: Formula[];
    formulaSchedule: FormulaSchedule;
    saveFormula: (formula: Formula) => void;
    deleteFormula: (formulaId: string) => void;
}
interface ExpenseContextType {
    expenses: Expense[];
    saveExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
}
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: Notification['type']) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}
interface AnnouncementContextType {
  announcements: Announcement[];
  addAnnouncement: (message: string, locationId?: string) => void;
  markAnnouncementAsRead: (id: string) => void;
}
interface ConfirmationContextType {
  showConfirmation: (message: string, onConfirm: () => void) => void;
}
interface AppDataContextType {
    exportFullBackup: () => void;
    importFullBackup: (jsonData: string) => void;
    exportNewRecords: () => void;
    importAndMergeRecords: (jsonData: string) => void;
}

// --- Context Creation ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CropContext = createContext<CropContextType | undefined>(undefined);
const PlantBatchContext = createContext<PlantBatchContextType | undefined>(undefined);
const MotherPlantContext = createContext<MotherPlantContextType | undefined>(undefined);
const GeneticsContext = createContext<GeneticsContextType | undefined>(undefined);
const LocationContext = createContext<LocationContextType | undefined>(undefined);
const TaskContext = createContext<TaskContextType | undefined>(undefined);
const MaintenanceLogContext = createContext<MaintenanceLogContextType | undefined>(undefined);
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);
const FormulaContext = createContext<FormulaContextType | undefined>(undefined);
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);
const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// --- Hooks for Consuming Contexts ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
export const useCrops = () => {
  const context = useContext(CropContext);
  if (!context) throw new Error("useCrops must be used within a CropProvider");
  return context;
}
export const usePlantBatches = () => {
  const context = useContext(PlantBatchContext);
  if (!context) throw new Error("usePlantBatches must be used within a PlantBatchProvider");
  return context;
}
export const useMotherPlants = () => {
  const context = useContext(MotherPlantContext);
  if (!context) throw new Error("useMotherPlants must be used within a MotherPlantProvider");
  return context;
}
export const useGenetics = () => {
  const context = useContext(GeneticsContext);
  if (!context) throw new Error("useGenetics must be used within a GeneticsProvider");
  return context;
}
export const useLocations = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocations must be used within a LocationProvider");
  return context;
}
export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error("useTasks must be used within a TaskProvider");
    return context;
}
export const useMaintenanceLogs = () => {
    const context = useContext(MaintenanceLogContext);
    if (!context) throw new Error("useMaintenanceLogs must be used within a MaintenanceLogProvider");
    return context;
}
export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error("useInventory must be used within an InventoryProvider");
    return context;
}
export const useFormulas = () => {
    const context = useContext(FormulaContext);
    if (!context) throw new Error("useFormulas must be used within a FormulaProvider");
    return context;
}
export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) throw new Error("useExpenses must be used within an ExpenseProvider");
    return context;
}
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};
export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error("useAnnouncements must be used within an AnnouncementProvider");
  return context;
};
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("useConfirmation must be used within a ConfirmationProvider");
  return context;
};
export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error("useAppData must be used within an AppProvider");
    return context;
}

// --- Combined Provider Component ---
interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State Initializations ---
  const [users, setUsers] = useLocalStorage<User[]>('users', D.USERS);
  const [currentUser, setCurrentUser] = useSessionStorage<User>('currentUser', null);
  const [activeRole, setActiveRole] = useSessionStorage<UserRole | null>('activeRole', null);
  const [allCrops, setAllCrops] = useLocalStorage<Crop[]>('crops', D.CROPS);
  const [activeCropId, setActiveCropId] = useSessionStorage<string | null>('activeCropId', null);
  const [plantBatches, setPlantBatches] = useLocalStorage<PlantBatch[]>('plantBatches', D.PLANT_BATCHES);
  const [activeBatchId, setActiveBatchId] = useSessionStorage<string | null>('activeBatchId', null);
  const [motherPlants, setMotherPlants] = useLocalStorage<MotherPlant[]>('motherPlants', D.MOTHER_PLANTS);
  const [activeMotherPlantId, setActiveMotherPlantId] = useSessionStorage<string | null>('activeMotherPlantId', null);
  const [genetics, setGenetics] = useLocalStorage<Genetics[]>('genetics', D.GENETICS);
  const [locations, setLocations] = useLocalStorage<Location[]>('locations', D.LOCATIONS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', D.TASKS);
  const [maintenanceLogs, setMaintenanceLogs] = useLocalStorage<MaintenanceLog[]>('maintenanceLogs', []);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', D.INVENTORY_ITEMS);
  const [formulas, setFormulas] = useLocalStorage<Formula[]>('formulas', D.FORMULAS);
  const [formulaSchedule, setFormulaSchedule] = useLocalStorage<FormulaSchedule>('formulaSchedule', D.FORMULA_SCHEDULE);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', D.EXPENSES);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('announcements', []);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, message: '', onConfirm: null });
  
  // --- Generic CRUD Logic ---
  const createSave = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (item: T) => {
    setter(prev => {
      const index = prev.findIndex(i => i.id === item.id);
      if (index > -1) {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      }
      return [...prev, item];
    });
  };

  const createDelete = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: string) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  // --- Auth Logic ---
  const login = (username: string, password: string): User | null => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    setActiveCropId(null);
    setActiveBatchId(null);
    setActiveMotherPlantId(null);
  };
  const createUser = (user: Omit<User, 'id' | 'roles'>) => {
    const newUser: User = { ...user, id: `user-${Date.now()}`, roles: [UserRole.GROWER] };
    setUsers(prev => [...prev, newUser]);
  };
  const deleteUser = (userId: string) => {
      if (currentUser?.id === userId) {
          alert("No puedes eliminarte a ti mismo.");
          return;
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
  };
  const saveUser = createSave(setUsers);

  // --- Notification and Announcement Logic ---
    const addNotification = (message: string, type: Notification['type'] = 'info') => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const unreadCount = notifications.filter(n => !n.read).length;

    const addAnnouncement = (message: string, locationId?: string) => {
        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            message,
            createdAt: new Date().toISOString(),
            read: false,
            locationId: locationId || undefined,
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
    };

    const markAnnouncementAsRead = (id: string) => {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

  // --- Confirmation Logic ---
  const showConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, message, onConfirm });
  };
  const handleConfirm = () => {
    if (confirmation.onConfirm) confirmation.onConfirm();
    setConfirmation({ isOpen: false, message: '', onConfirm: null });
  };
  const handleCancel = () => {
    setConfirmation({ isOpen: false, message: '', onConfirm: null });
  };

  // --- Data Management Logic ---
    const exportFullBackup = () => {
        try {
            const appState = {
                users, allCrops, plantBatches, motherPlants, genetics, locations, tasks, inventory, formulas, formulaSchedule, expenses, notifications, announcements, maintenanceLogs
            };
            const jsonString = JSON.stringify(appState, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `torus-ac-backup-completo-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("¡Exportación de respaldo completo finalizada!");
        } catch (error) {
            console.error("Error exporting app state:", error);
            alert("Error al exportar los datos.");
        }
    };

    const importFullBackup = (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);
            if (!data.users || !data.allCrops) {
                throw new Error("El archivo JSON no tiene el formato esperado para un respaldo completo.");
            }
            setUsers(data.users ?? D.USERS);
            setAllCrops(data.allCrops ?? D.CROPS);
            setPlantBatches(data.plantBatches ?? D.PLANT_BATCHES);
            setMotherPlants(data.motherPlants ?? D.MOTHER_PLANTS);
            setGenetics(data.genetics ?? D.GENETICS);
            setLocations(data.locations ?? D.LOCATIONS);
            setTasks(data.tasks ?? D.TASKS);
            setInventory(data.inventory ?? D.INVENTORY_ITEMS);
            setFormulas(data.formulas ?? D.FORMULAS);
            setFormulaSchedule(data.formulaSchedule ?? D.FORMULA_SCHEDULE);
            setExpenses(data.expenses ?? D.EXPENSES);
            setNotifications(data.notifications ?? []);
            setAnnouncements(data.announcements ?? []);
            setMaintenanceLogs(data.maintenanceLogs ?? []);
            alert("¡Restauración completada! La página se recargará.");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error("Error importing app state:", error);
            alert(`Error al importar los datos: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const exportNewRecords = () => {
        try {
            const lastExportTimestamp = localStorage.getItem('lastExportTimestamp');
            const now = new Date();
            const lastExportDate = lastExportTimestamp ? new Date(lastExportTimestamp) : new Date(0);

            const newLogEntriesByCrop: { cropId: string, logs: LogEntry[] }[] = [];
            allCrops.forEach(crop => {
                const newLogs = crop.logEntries.filter(log => new Date(log.date) > lastExportDate);
                if (newLogs.length > 0) newLogEntriesByCrop.push({ cropId: crop.id, logs: newLogs });
            });

            const newExpenses = expenses.filter(exp => new Date(exp.date) > lastExportDate);
            const newPlantBatches = plantBatches.filter(b => new Date(b.creationDate) > lastExportDate);
            const newMaintenanceLogs = maintenanceLogs.filter(log => new Date(log.completedAt) > lastExportDate);
            
            const exportData = {
                dataType: 'TorusAC_IncrementalExport',
                exportedBy: currentUser?.username,
                exportedAt: now.toISOString(),
                data: { newLogEntriesByCrop, newExpenses, newPlantBatches, newMaintenanceLogs }
            };

            if (newLogEntriesByCrop.length === 0 && newExpenses.length === 0 && newPlantBatches.length === 0 && newMaintenanceLogs.length === 0) {
                alert("No hay nuevos registros para exportar desde la última vez.");
                return;
            }

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `torus-ac-registros-${currentUser?.username}-${now.toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            localStorage.setItem('lastExportTimestamp', now.toISOString());
            alert("Exportación de nuevos registros completada.");
        } catch (error) {
            console.error("Error exporting new records:", error);
            alert("Error al exportar nuevos registros.");
        }
    };

    const importAndMergeRecords = (jsonData: string) => {
        try {
            const importData = JSON.parse(jsonData);
            if (importData.dataType !== 'TorusAC_IncrementalExport') {
                throw new Error("El archivo no es una exportación de registros válida.");
            }

            // Merge log entries
            setAllCrops(prevCrops => {
                const newCrops = JSON.parse(JSON.stringify(prevCrops)); // Deep copy
                importData.data.newLogEntriesByCrop?.forEach((cropLogs: { cropId: string; logs: LogEntry[] }) => {
                    const cropIndex = newCrops.findIndex((c: Crop) => c.id === cropLogs.cropId);
                    if (cropIndex !== -1) {
                        const existingLogIds = new Set(newCrops[cropIndex].logEntries.map((l: LogEntry) => l.id));
                        const uniqueNewLogs = cropLogs.logs.filter(l => !existingLogIds.has(l.id));
                        newCrops[cropIndex].logEntries.push(...uniqueNewLogs);
                    }
                });
                return newCrops;
            });

            // Merge expenses
            setExpenses(prev => {
                const existingIds = new Set(prev.map(e => e.id));
                const uniqueNew = importData.data.newExpenses?.filter((e: Expense) => !existingIds.has(e.id)) || [];
                return [...prev, ...uniqueNew];
            });

            // Merge plant batches
            setPlantBatches(prev => {
                const existingIds = new Set(prev.map(b => b.id));
                const uniqueNew = importData.data.newPlantBatches?.filter((b: PlantBatch) => !existingIds.has(b.id)) || [];
                return [...prev, ...uniqueNew];
            });

            // Merge maintenance logs
            setMaintenanceLogs(prev => {
                const existingIds = new Set(prev.map(l => l.id));
                const uniqueNew = importData.data.newMaintenanceLogs?.filter((l: MaintenanceLog) => !existingIds.has(l.id)) || [];
                return [...prev, ...uniqueNew];
            });
            
            alert(`Registros de "${importData.exportedBy}" combinados exitosamente.`);
        } catch (error) {
            console.error("Error merging records:", error);
            alert(`Error al combinar los registros: ${error instanceof Error ? error.message : String(error)}`);
        }
    };


  // --- Context-Specific Logic ---
  const saveCrop = (crop: Crop) => {
        const oldCrop = allCrops.find(c => c.id === crop.id);
        const oldLogIds = oldCrop ? new Set(oldCrop.logEntries.map(l => l.id)) : new Set();
        const newLogEntries = crop.logEntries.filter(log => !oldLogIds.has(log.id));
        const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;
        
        if (!oldCrop) { // This is a new crop
            let batchLogs: LogEntry[] = [];
            crop.plantCounts.forEach(pc => {
                const batch = plantBatches.find(b => b.id === pc.batchId);
                if (batch && batch.logEntries) {
                    batchLogs = [...batchLogs, ...batch.logEntries];
                }
            });
            batchLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            crop.logEntries = [...batchLogs, ...crop.logEntries];
        }


        newLogEntries.forEach(log => {
            if (log.irrigation && !log.irrigation.cost && log.irrigation.volume > 0) {
                const stageInfo = getStageInfo(crop, new Date(log.date));
                const formulaTemplate = getFormulaForWeek(stageInfo.stage, stageInfo.weekInStage, formulaSchedule, formulas);
                if (formulaTemplate) {
                    const parentLocationId = getParentLocationId(crop.locationId, locations);
                    if (parentLocationId) {
                        let totalCost = 0;
                        formulaTemplate.nutrients.forEach(nutrient => {
                            const locationSpecificItemId = `${nutrient.inventoryItemId}-${parentLocationId}`;
                            const inventoryItem = inventory.find(i => i.id === locationSpecificItemId);
                            if (inventoryItem && inventoryItem.averageCostPerUnit > 0) {
                                const amountUsed = nutrient.amountPerLiter * log.irrigation!.volume;
                                totalCost += amountUsed * inventoryItem.averageCostPerUnit;
                            }
                        });
                        log.irrigation!.cost = totalCost;
                    }
                }
            }
            if (log.irrigation) {
                const ph = log.irrigation.ph;
                if (ph < 5.8 || ph > 6.2) {
                    addNotification(`Alerta de pH en "${cropName}": ${ph} está fuera del rango ideal (5.8-6.2).`, 'warning');
                }
                if (log.irrigation.ppmOut && log.irrigation.ppm && log.irrigation.ppmOut > log.irrigation.ppm * 1.25) {
                    addNotification(`PPM de salida alto en "${cropName}": ${log.irrigation.ppmOut}. Considera lavado de raíz o suplementos.`, 'warning');
                }
            }
            if (log.plantHealth && log.plantHealth.length > 0) {
                const isProblem = log.plantHealth.some(status => !D.PLANT_HEALTH_OPTIONS['Estado Positivo'].includes(status));
                if (isProblem) {
                    addNotification(`¡Atención! Problema de salud en "${cropName}": ${log.plantHealth.join(', ')}`, 'warning');
                }
            }
        });

        setAllCrops(prev => {
            const index = prev.findIndex(c => c.id === crop.id);
            if (index > -1) {
                const newCrops = [...prev];
                newCrops[index] = crop;
                return newCrops;
            }
            return [...prev, crop];
        });
    };

  const deleteCrop = (cropId: string) => {
    setAllCrops(prev => prev.filter(c => c.id !== cropId));
    if (activeCropId === cropId) setActiveCropId(null);
  };

  const archiveCrop = (cropId: string) => {
    setAllCrops(prev => prev.map(c => c.id === cropId ? { ...c, isArchived: true } : c));
  };

  const restoreCrop = (cropId: string) => {
    setAllCrops(prev => prev.map(c => c.id === cropId ? { ...c, isArchived: false } : c));
  };

  const activeCrop = allCrops.find(c => c.id === activeCropId && !c.isArchived) || null;
  const activeBatch = plantBatches.find(b => b.id === activeBatchId) || null;
  const activeMotherPlant = motherPlants.find(p => p.id === activeMotherPlantId) || null;
  
  const savePlantBatch = (batch: PlantBatch, sourceMotherPlantId?: string) => {
    const oldBatch = plantBatches.find(b => b.id === batch.id);

    if (!oldBatch && sourceMotherPlantId && sourceMotherPlantId.startsWith('mp-')) {
        setMotherPlants(prevPlants => {
            const plantIndex = prevPlants.findIndex(p => p.id === sourceMotherPlantId);
            if (plantIndex > -1) {
                const updatedPlants = [...prevPlants];
                const plantToUpdate = { ...updatedPlants[plantIndex] };
                plantToUpdate.cloneCount += batch.initialPlantCount;
                updatedPlants[plantIndex] = plantToUpdate;
                return updatedPlants;
            }
            return prevPlants;
        });
    }

    if(oldBatch && batch.logEntries.length > oldBatch.logEntries.length){
        const newLog = batch.logEntries[batch.logEntries.length-1];
        if (newLog.irrigation) {
            const ph = newLog.irrigation.ph;
            if (ph < 5.8 || ph > 6.2) {
                addNotification(`Alerta de pH en Lote "${batch.name}": ${ph} está fuera del rango ideal (5.8-6.2).`, 'warning');
            }
        }
    }
    createSave(setPlantBatches)(batch);
  };

  const deletePlantBatch = (batchId: string): boolean => {
    const batch = plantBatches.find(b => b.id === batchId);
    if (batch && (batch.status === PlantBatchStatus.IN_USE || batch.status === PlantBatchStatus.DEPLETED)) {
      alert("No se puede eliminar el lote: se está utilizando o se ha utilizado en un cultivo. Primero archiva el cultivo asociado.");
      return false;
    }
    setPlantBatches(prev => prev.filter(b => b.id !== batchId));
    return true;
  };
  
  const saveMotherPlant = createSave(setMotherPlants);
  const deleteMotherPlant = createDelete(setMotherPlants);
  const archiveMotherPlant = (plantId: string) => {
    setMotherPlants(prev => prev.map(p => p.id === plantId ? { ...p, isArchived: true } : p));
  };
  const restoreMotherPlant = (plantId: string) => {
    setMotherPlants(prev => prev.map(p => p.id === plantId ? { ...p, isArchived: false } : p));
  };
  const saveLogForAllActiveMotherPlants = useCallback((logEntry: Omit<LogEntry, 'id'>) => {
    setMotherPlants(prevPlants => {
        return prevPlants.map(plant => {
            if (!plant.isArchived) {
                const newLog = {...logEntry, id: `log-${plant.id}-${Date.now()}`};
                return {
                    ...plant,
                    logEntries: [...plant.logEntries, newLog]
                };
            }
            return plant;
        });
    });
  }, [setMotherPlants]);

  
  const saveGenetic = createSave(setGenetics);
  const deleteGenetic = createDelete(setGenetics);

  const saveLocation = createSave(setLocations);
  const deleteLocation = (locationId: string) => {
    const locationToDelete = locations.find(l => l.id === locationId);
    if (!locationToDelete) return;

    const hasChildren = !locationToDelete.parentId && locations.some(l => l.parentId === locationId);
    if (hasChildren) {
        alert("No se puede eliminar una ubicación principal que tiene cuartos asignados. Primero elimina o reasigna los cuartos.");
        return;
    }

    const isRoomInUse = allCrops.some(c => c.locationId === locationId) || motherPlants.some(m => m.locationId === locationId);
    if(isRoomInUse) {
        alert("No se puede eliminar un cuarto que está siendo utilizado por un cultivo o planta madre. Archiva o elimina el cultivo primero.");
        return;
    }

    showConfirmation(`¿Estás seguro de que quieres eliminar "${locationToDelete.name}"?`, () => {
        setLocations(prev => prev.filter(l => l.id !== locationId));
        setExpenses(prev => prev.filter(e => e.locationId !== locationId));
    });
  };

  const saveTask = createSave(setTasks);
  const deleteTask = createDelete(setTasks);
  const completeTaskForCrop = (taskId: string, cropId: string, userId: string) => {
        const cropToUpdate = allCrops.find(c => c.id === cropId);
        const task = tasks.find(t => t.id === taskId);
        const user = users.find(u => u.id === userId);

        if (!cropToUpdate || !task || !user) {
            console.error("No se pudo completar la tarea: cultivo, tarea o usuario no encontrado.");
            return;
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        const logEntries = [...cropToUpdate.logEntries];
        let todayLog = logEntries.find(log => log.date.startsWith(todayStr));
        
        const completedTaskEntry = {
            taskId: task.id,
            taskTitle: task.title,
            completedBy: user.username,
            completedAt: new Date().toISOString(),
        };

        if (todayLog) {
            todayLog.completedTasks = [...(todayLog.completedTasks || []), completedTaskEntry];
        } else {
            todayLog = {
                id: `log-${Date.now()}`,
                date: new Date().toISOString(),
                completedTasks: [completedTaskEntry],
                notes: `Tarea completada: ${task.title}`
            };
            logEntries.push(todayLog);
        }
        
        saveCrop({ ...cropToUpdate, logEntries });
    };

    const completeMaintenanceTask = (task: Task, userId: string, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[]) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newLog: MaintenanceLog = {
            id: `mlog-${Date.now()}`,
            taskId: task.id,
            taskTitle: task.title,
            userId: user.id,
            userUsername: user.username,
            locationId: task.locationId,
            completedAt: new Date().toISOString(),
            notes,
            photoEvidence: photo,
            partsUsed
        };

        setMaintenanceLogs(prev => [...prev, newLog]);
        addNotification(`Tarea de mantenimiento "${task.title}" completada.`);

        // Deduct from inventory
        setInventory(prevInv => {
            const newInv = [...prevInv];
            partsUsed.forEach(part => {
                const itemIndex = newInv.findIndex(i => i.id.startsWith(part.inventoryItemId) && i.locationId === task.locationId);
                if (itemIndex > -1) {
                    newInv[itemIndex] = { ...newInv[itemIndex], currentStock: newInv[itemIndex].currentStock - part.quantity };
                }
            });
            return newInv;
        });
    };
  
  const saveInventoryItem = createSave(setInventory);
  const deleteInventoryItem = createDelete(setInventory);
  const addPurchaseToItem = (itemId: string, purchaseQuantity: number, totalCost: number) => {
    setInventory(prev => {
        const index = prev.findIndex(i => i.id === itemId);
        if (index === -1) return prev;
        
        const newItems = [...prev];
        const item = { ...newItems[index] };

        const conversionFactor = item.purchaseUnitConversion || 1;
        const quantityInStockUnits = purchaseQuantity * conversionFactor;

        const newPurchase = { 
            date: new Date().toISOString(), 
            quantity: quantityInStockUnits,
            totalCost: totalCost 
        };
        item.purchases = [...item.purchases, newPurchase];
        
        const totalQuantityInStock = item.purchases.reduce((acc, p) => acc + p.quantity, 0);
        const totalCostSum = item.purchases.reduce((acc, p) => acc + p.totalCost, 0);
        
        item.currentStock = totalQuantityInStock;
        item.averageCostPerUnit = totalQuantityInStock > 0 ? parseFloat((totalCostSum / totalQuantityInStock).toPrecision(5)) : 0;
        
        newItems[index] = item;
        return newItems;
    });
  };

  const saveFormula = createSave(setFormulas);
  const deleteFormula = createDelete(setFormulas);

  const saveExpense = createSave(setExpenses);
  const deleteExpense = createDelete(setExpenses);

  // --- Value Objects for Providers ---
  const authValue = { users, currentUser, login, logout, createUser, deleteUser, saveUser, activeRole, setActiveRole };
  const cropValue = { allCrops, activeCropId, activeCrop, saveCrop, deleteCrop, setActiveCropId, archiveCrop, restoreCrop };
  const plantBatchValue = { plantBatches, activeBatchId, activeBatch, savePlantBatch, deletePlantBatch, setActiveBatchId };
  const motherPlantValue = { motherPlants, activeMotherPlantId, activeMotherPlant, saveMotherPlant, deleteMotherPlant, setActiveMotherPlantId, archiveMotherPlant, restoreMotherPlant, saveLogForAllActiveMotherPlants };
  const geneticsValue = { genetics, saveGenetic, deleteGenetic };
  const locationValue = { locations, saveLocation, deleteLocation };
  const taskValue = { tasks, saveTask, deleteTask, completeTaskForCrop, completeMaintenanceTask };
  const maintenanceLogValue = { maintenanceLogs };
  const inventoryValue = { inventory, saveInventoryItem, deleteInventoryItem, addPurchaseToItem };
  const formulaValue = { formulas, formulaSchedule, saveFormula, deleteFormula };
  const expenseValue = { expenses, saveExpense, deleteExpense };
  const notificationValue = { notifications, addNotification, markAsRead, unreadCount };
  const announcementValue = { announcements, addAnnouncement, markAnnouncementAsRead };
  const confirmationValue = { showConfirmation };
  const appDataValue = { exportFullBackup, importFullBackup, exportNewRecords, importAndMergeRecords };

  return (
    <AuthContext.Provider value={authValue}>
      <AppDataContext.Provider value={appDataValue}>
        <CropContext.Provider value={cropValue}>
            <PlantBatchContext.Provider value={plantBatchValue}>
              <MotherPlantContext.Provider value={motherPlantValue}>
                <GeneticsContext.Provider value={geneticsValue}>
                    <LocationContext.Provider value={locationValue}>
                        <TaskContext.Provider value={taskValue}>
                            <MaintenanceLogContext.Provider value={maintenanceLogValue}>
                                <InventoryContext.Provider value={inventoryValue}>
                                    <FormulaContext.Provider value={formulaValue}>
                                        <ExpenseContext.Provider value={expenseValue}>
                                            <NotificationContext.Provider value={notificationValue}>
                                                <AnnouncementContext.Provider value={announcementValue}>
                                                    <ConfirmationContext.Provider value={confirmationValue}>
                                                        {children}
                                                        {confirmation.isOpen && (
                                                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                                                                <div className="bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm mx-auto">
                                                                    <h3 className="text-lg font-bold mb-4">Confirmar Acción</h3>
                                                                    <p className="text-gray-300 mb-6">{confirmation.message}</p>
                                                                    <div className="flex justify-end gap-4">
                                                                        <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700">Cancelar</button>
                                                                        <button onClick={handleConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Confirmar</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </ConfirmationContext.Provider>
                                                </AnnouncementContext.Provider>
                                            </NotificationContext.Provider>
                                        </ExpenseContext.Provider>
                                    </FormulaContext.Provider>
                                </InventoryContext.Provider>
                            </MaintenanceLogContext.Provider>
                        </TaskContext.Provider>
                    </LocationContext.Provider>
                </GeneticsContext.Provider>
              </MotherPlantContext.Provider>
            </PlantBatchContext.Provider>
        </CropContext.Provider>
      </AppDataContext.Provider>
    </AuthContext.Provider>
  );
};
