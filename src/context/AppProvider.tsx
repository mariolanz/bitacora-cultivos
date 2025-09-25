import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useSessionStorage from '../hooks/useSessionStorage';
import { User, Crop, PlantBatch, Location, InventoryItem, Formula, FormulaSchedule, Genetics, Notification, Expense, UserRole, Task, Announcement, PlantBatchStatus, LogEntry, MaintenanceLog, MotherPlant } from '../types';
import * as D from '../constants';
import { getStageInfo, getFormulaForWeek, getParentLocationId } from '../services/nutritionService';

// Importar hooks de Supabase
import { useSupabaseCrops } from '../hooks/useSupabaseCrops';
import { useSupabasePlantBatches } from '../hooks/useSupabasePlantBatches';
import { useSupabaseMotherPlants } from '../hooks/useSupabaseMotherPlants';
import { useSupabaseInventory } from '../hooks/useSupabaseInventory';
import { useSupabaseFormulas } from '../hooks/useSupabaseFormulas';
import { useSupabaseExpenses } from '../hooks/useSupabaseExpenses';
import { useSupabaseMaintenanceLogs } from '../hooks/useSupabaseMaintenanceLogs';
import { useSupabaseGenetics } from '../hooks/useSupabaseGenetics';
import { useSupabaseLocations } from '../hooks/useSupabaseLocations';
import { useSupabaseTasks } from '../hooks/useSupabaseTasks';
import { useSupabaseNotifications } from '../hooks/useSupabaseNotifications';
import { useSupabaseAnnouncements } from '../hooks/useSupabaseAnnouncements';

// ... (resto de interfaces y contextos igual que antes)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usuarios y roles siguen en local/session storage
  const [users, setUsers] = React.useState<User[]>(D.USERS);
  const [currentUser, setCurrentUser] = useSessionStorage<User>('currentUser', null);
  const [activeRole, setActiveRole] = useSessionStorage<UserRole | null>('activeRole', null);

  // Entidades en Supabase
  const { crops: allCrops, saveCrop, deleteCrop } = useSupabaseCrops();
  const { plantBatches, savePlantBatch, deletePlantBatch } = useSupabasePlantBatches();
  const { motherPlants, saveMotherPlant, deleteMotherPlant } = useSupabaseMotherPlants();
  const { inventory, saveInventoryItem, deleteInventoryItem } = useSupabaseInventory();
  const { formulas, saveFormula, deleteFormula } = useSupabaseFormulas();
  const { expenses, saveExpense, deleteExpense } = useSupabaseExpenses();
  const { maintenanceLogs, saveMaintenanceLog } = useSupabaseMaintenanceLogs();
  const { genetics, saveGenetic, deleteGenetic } = useSupabaseGenetics();
  const { locations, saveLocation, deleteLocation } = useSupabaseLocations();
  const { tasks, saveTask, deleteTask } = useSupabaseTasks();
  const { notifications, addNotification, markAsRead } = useSupabaseNotifications(currentUser?.id);
  const { announcements, addAnnouncement, markAnnouncementAsRead } = useSupabaseAnnouncements(currentUser?.locationId);

  // Confirmación local (puede quedarse igual)
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });

  // Value objects para los contextos
  const cropValue = {
    allCrops,
    saveCrop: async (crop) => {
      if (typeof saveCrop === 'function') {
        const result = await saveCrop(crop);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteCrop: async (id) => {
      if (typeof deleteCrop === 'function') {
        const result = await deleteCrop(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const plantBatchValue = {
    plantBatches,
    savePlantBatch: async (batch) => {
      if (typeof savePlantBatch === 'function') {
        const result = await savePlantBatch(batch);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deletePlantBatch: async (id) => {
      if (typeof deletePlantBatch === 'function') {
        const result = await deletePlantBatch(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const motherPlantValue = {
    motherPlants,
    saveMotherPlant: async (plant) => {
      if (typeof saveMotherPlant === 'function') {
        const result = await saveMotherPlant(plant);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteMotherPlant: async (id) => {
      if (typeof deleteMotherPlant === 'function') {
        const result = await deleteMotherPlant(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const inventoryValue = {
    inventory,
    saveInventoryItem: async (item) => {
      if (typeof saveInventoryItem === 'function') {
        const result = await saveInventoryItem(item);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteInventoryItem: async (id) => {
      if (typeof deleteInventoryItem === 'function') {
        const result = await deleteInventoryItem(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const formulaValue = {
    formulas,
    saveFormula: async (formula) => {
      if (typeof saveFormula === 'function') {
        const result = await saveFormula(formula);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteFormula: async (id) => {
      if (typeof deleteFormula === 'function') {
        const result = await deleteFormula(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const expenseValue = {
    expenses,
    saveExpense: async (expense) => {
      if (typeof saveExpense === 'function') {
        const result = await saveExpense(expense);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteExpense: async (id) => {
      if (typeof deleteExpense === 'function') {
        const result = await deleteExpense(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const maintenanceLogValue = {
    maintenanceLogs,
    saveMaintenanceLog: async (log) => {
      if (typeof saveMaintenanceLog === 'function') {
        const result = await saveMaintenanceLog(log);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const geneticsValue = {
    genetics,
    saveGenetic: async (genetic) => {
      if (typeof saveGenetic === 'function') {
        const result = await saveGenetic(genetic);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteGenetic: async (id) => {
      if (typeof deleteGenetic === 'function') {
        const result = await deleteGenetic(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const locationValue = {
    locations,
    saveLocation: async (location) => {
      if (typeof saveLocation === 'function') {
        const result = await saveLocation(location);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteLocation: async (id) => {
      if (typeof deleteLocation === 'function') {
        const result = await deleteLocation(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const taskValue = {
    tasks,
    saveTask: async (task) => {
      if (typeof saveTask === 'function') {
        const result = await saveTask(task);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    deleteTask: async (id) => {
      if (typeof deleteTask === 'function') {
        const result = await deleteTask(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    completeTaskForCrop: () => {},
    completeMaintenanceTask: () => {}
  };
  const notificationValue = {
    notifications,
    addNotification: async (notification) => {
      if (typeof addNotification === 'function') {
        const result = await addNotification(notification);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    markAsRead: async (id) => {
      if (typeof markAsRead === 'function') {
        const result = await markAsRead(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    unreadCount: notifications.filter(n => !n.read).length
  };
  const announcementValue = {
    announcements,
    addAnnouncement: async (announcement) => {
      if (typeof addAnnouncement === 'function') {
        const result = await addAnnouncement(announcement);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    },
    markAnnouncementAsRead: async (id) => {
      if (typeof markAnnouncementAsRead === 'function') {
        const result = await markAnnouncementAsRead(id);
        if (result && typeof result === 'object' && 'error' in result) return result;
      }
      return { error: undefined };
    }
  };
  const confirmationValue = { showConfirmation: (message: string, onConfirm: () => void) => setConfirmation({ isOpen: true, message, onConfirm }) };

  return (
    <AuthContext.Provider value={{ users, currentUser, login: () => null, logout: () => {}, createUser: () => {}, deleteUser: () => {}, saveUser: () => {}, activeRole, setActiveRole }}>
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
                                        <button onClick={() => setConfirmation({ isOpen: false, message: '', onConfirm: null })} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700">Cancelar</button>
                                        <button onClick={() => { confirmation.onConfirm && confirmation.onConfirm(); setConfirmation({ isOpen: false, message: '', onConfirm: null }); }} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Confirmar</button>
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
    </AuthContext.Provider>
  );
};