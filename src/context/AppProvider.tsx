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
  const { genetics } = useSupabaseGenetics();
  const { locations } = useSupabaseLocations();
  const { tasks } = useSupabaseTasks();
  const { notifications, addNotification, markAsRead } = useSupabaseNotifications(currentUser?.id);
  const { announcements, addAnnouncement, markAnnouncementAsRead } = useSupabaseAnnouncements(currentUser?.locationId);

  // Confirmación local (puede quedarse igual)
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });

  // Value objects para los contextos
  const cropValue = { allCrops, saveCrop, deleteCrop };
  const plantBatchValue = { plantBatches, savePlantBatch, deletePlantBatch };
  const motherPlantValue = { motherPlants, saveMotherPlant, deleteMotherPlant };
  const inventoryValue = { inventory, saveInventoryItem, deleteInventoryItem };
  const formulaValue = { formulas, saveFormula, deleteFormula };
  // --- FIX: Asegura que saveExpense y deleteExpense siempre retornen { error }
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
  const maintenanceLogValue = { maintenanceLogs, saveMaintenanceLog };
  const geneticsValue = { genetics, saveGenetic: () => {}, deleteGenetic: () => {} }; // Puedes implementar saveGenetic/deleteGenetic si lo necesitas
  const locationValue = { locations, saveLocation: () => {}, deleteLocation: () => {} }; // Puedes implementar saveLocation/deleteLocation si lo necesitas
  const taskValue = { tasks, saveTask: () => {}, deleteTask: () => {}, completeTaskForCrop: () => {}, completeMaintenanceTask: () => {} };
  const notificationValue = { notifications, addNotification, markAsRead, unreadCount: notifications.filter(n => !n.read).length };
  const announcementValue = { announcements, addAnnouncement, markAnnouncementAsRead };
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