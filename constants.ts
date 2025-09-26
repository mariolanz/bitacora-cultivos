import { User, UserRole, Crop, CropStage, Genetics, Location, PlantBatch, LogEntry, Formula, FormulaSchedule, InventoryItem, PlantBatchStatus, Task, Expense, InventoryCategory, MotherPlant, TrimmingSession, Equipment } from './types';

// Todos los datos dummy se dejan vacíos para que la app use solo Supabase
export const USERS: User[] = [];
export const GENETICS: Genetics[] = [];
export const LOCATIONS: Location[] = [];
export const MOTHER_PLANTS: MotherPlant[] = [];
export const PLANT_BATCHES: PlantBatch[] = [];
export const CROPS: Crop[] = [];
export const INVENTORY_CATEGORIES: InventoryCategory[] = [
    'Nutriente Base',
    'Suplemento/Bioestimulante',
    'Microorganismos/Biológicos',
    'Control de Plagas/Enfermedades',
    'Sustrato',
    'Herramientas y Equipo',
    'Refacciones',
    'Limpieza y Sanitización',
    'Otro'
];
export const INVENTORY_ITEMS: InventoryItem[] = [];
export const FORMULAS: Formula[] = [];
export const FORMULA_SCHEDULE: FormulaSchedule = {};
export const STAGES = [
  CropStage.CLONING,
  CropStage.PRE_VEGETATION,
  CropStage.VEGETATION,
  CropStage.FLOWERING,
  CropStage.DRYING_CURING,
  CropStage.HARVESTED,
];
export const TASKS: Task[] = [];
export const FOLIAR_PRODUCTS: { name: string; dose: string }[] = [];
export const SUPPLEMENT_PRODUCTS: { name: string; dose: string }[] = [];
export const PLANT_HEALTH_OPTIONS: { [category: string]: string[] } = {};
export const EXPENSES: Expense[] = [];
export const TRIMMING_SESSIONS: TrimmingSession[] = [];
export const EQUIPMENT: Equipment[] = [];