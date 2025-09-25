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

  // Las siguientes entidades pueden seguir en localStorage o migrarse después:
  const [genetics, setGenetics] = React.useState<Genetics[]>(D.GENETICS);
  const [locations, setLocations] = React.useState<Location[]>(D.LOCATIONS);
  const [tasks, setTasks] = React.useState<Task[]>(D.TASKS);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });

  // ... (resto de lógica de usuarios, roles, confirmaciones, etc. igual que antes)

  // Métodos CRUD para Supabase (ya están en los hooks)
  // Ejemplo de uso en componentes:
  // const { crops, saveCrop, deleteCrop } = useSupabaseCrops();

  // El resto de métodos (notificaciones, anuncios, confirmaciones, etc.) igual que antes

  // Value objects para los contextos (solo muestro crops como ejemplo, repite para los demás)
  const cropValue = { allCrops, saveCrop, deleteCrop /* ...otros métodos si los necesitas */ };
  const plantBatchValue = { plantBatches, savePlantBatch, deletePlantBatch };
  const motherPlantValue = { motherPlants, saveMotherPlant, deleteMotherPlant };
  const inventoryValue = { inventory, saveInventoryItem, deleteInventoryItem };
  const formulaValue = { formulas, saveFormula, deleteFormula };
  const expenseValue = { expenses, saveExpense, deleteExpense };
  const maintenanceLogValue = { maintenanceLogs, saveMaintenanceLog };

  // ... (resto de value objects igual que antes)

  return (
    <AuthContext.Provider value={{ users, currentUser, login: () => null, logout: () => {}, createUser: () => {}, deleteUser: () => {}, saveUser: () => {}, activeRole, setActiveRole }}>
      <CropContext.Provider value={cropValue}>
        <PlantBatchContext.Provider value={plantBatchValue}>
          <MotherPlantContext.Provider value={motherPlantValue}>
            <GeneticsContext.Provider value={{ genetics, saveGenetic: () => {}, deleteGenetic: () => {} }}>
              <LocationContext.Provider value={{ locations, saveLocation: () => {}, deleteLocation: () => {} }}>
                <TaskContext.Provider value={{ tasks, saveTask: () => {}, deleteTask: () => {}, completeTaskForCrop: () => {}, completeMaintenanceTask: () => {} }}>
                  <MaintenanceLogContext.Provider value={maintenanceLogValue}>
                    <InventoryContext.Provider value={inventoryValue}>
                      <FormulaContext.Provider value={formulaValue}>
                        <ExpenseContext.Provider value={expenseValue}>
                          <NotificationContext.Provider value={{ notifications, addNotification: () => {}, markAsRead: () => {}, unreadCount: 0 }}>
                            <AnnouncementContext.Provider value={{ announcements, addAnnouncement: () => {}, markAnnouncementAsRead: () => {} }}>
                              <ConfirmationContext.Provider value={{ showConfirmation: () => {} }}>
                                {children}
                                {/* ...modal de confirmación igual que antes */}
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