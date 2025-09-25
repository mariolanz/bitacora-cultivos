

import { User, UserRole, Crop, CropStage, Genetics, Location, PlantBatch, LogEntry, Formula, FormulaSchedule, InventoryItem, PlantBatchStatus, Task, Expense, InventoryCategory, MotherPlant, TrimmingSession, Equipment } from './types';

export const USERS: User[] = [
  { id: 'user-luis-b', username: 'LUIS B', password: 'LUBBana420', roles: [UserRole.ADMIN, UserRole.GROWER], locationId: 'TODAS' },
  { id: 'user-lumza', username: 'LUMZA', password: 'LZBana420', roles: [UserRole.GROWER], locationId: 'loc-mc' },
  { id: 'user-luis-t', username: 'LUIS T', password: 'LUBana420', roles: [UserRole.GROWER], locationId: 'loc-mc' },
  { id: 'user-fermin', username: 'FERMIN', password: 'FEBana420', roles: [UserRole.GROWER], locationId: 'loc-ll' },
  { id: 'user-cristian', username: 'CRISTIAN', password: 'CRBana420', roles: [UserRole.GROWER, UserRole.MAINTENANCE], locationId: 'loc-ll', maintenanceLocationIds: ['TODAS'] },
  { id: 'user-tomy', username: 'TOMY', password: 'TOBana420', roles: [UserRole.GROWER, UserRole.TRIMMER], locationId: 'loc-ll' },
  { id: 'user-dayana', username: 'DAYANA', password: 'DABana420', roles: [UserRole.GROWER], locationId: 'loc-ss' },
  { id: 'user-arturo', username: 'ARTURO', password: 'ARBana420', roles: [UserRole.GROWER, UserRole.MAINTENANCE], locationId: 'loc-ss', maintenanceLocationIds: ['loc-ss'] },
  { id: 'user-eduardo', username: 'EDUARDO', password: 'EDBana420', roles: [UserRole.GROWER], locationId: 'loc-br' },
  { id: 'user-gustavo', username: 'GUSTAVO', password: 'GUBana420', roles: [UserRole.GROWER], locationId: 'loc-br' },
  { id: 'user-paco', username: 'PACO', password: 'PABana420', roles: [UserRole.GROWER], locationId: 'loc-br' },
  { id: 'user-deysi', username: 'DEYSI', password: 'DEBana420', roles: [UserRole.TRIMMER, UserRole.MAINTENANCE], locationId: 'TODAS', maintenanceLocationIds: ['TODAS'] },
  { id: 'user-sebastian', username: 'SEBASTIAN', password: 'SEBana420', roles: [UserRole.TRIMMER, UserRole.MAINTENANCE], locationId: 'TODAS', maintenanceLocationIds: ['TODAS'] },
];

export const GENETICS: Genetics[] = [
  { id: 'gen-1', name: 'Bannana punch', code: 'B' },
  { id: 'gen-28', name: 'Banna x BL', code: 'BXBL' },
  { id: 'gen-2', name: 'Bloodsport', code: 'BS' },
  { id: 'gen-3', name: 'Big detroit energy', code: 'BDE' },
  { id: 'gen-4', name: 'Cali cookies', code: 'CC' },
  { id: 'gen-5', name: 'Champaña', code: 'CH' },
  { id: 'gen-6', name: 'Candy Store Rbx', code: 'CS' },
  { id: 'gen-7', name: 'Divoce Cake', code: 'DC' },
  { id: 'gen-8', name: 'End Game', code: 'EG' },
  { id: 'gen-9', name: 'Forbiben apple', code: 'FA' },
  { id: 'gen-10', name: 'Gelato', code: 'G' },
  { id: 'gen-11', name: 'GMO x Zoobie Kush', code: 'GMO' },
  { id: 'gen-12', name: 'Hindu kush', code: 'HK' },
  { id: 'gen-13', name: 'Jelly Breath', code: 'JB' },
  { id: 'gen-14', name: 'Kit pampoe', code: 'KP' },
  { id: 'gen-15', name: 'Lemon berry candy', code: 'LBC' },
  { id: 'gen-16', name: 'Limonada mango', code: 'LM' },
  { id: 'gen-17', name: 'Lemon up', code: 'LU' },
  { id: 'gen-29', name: 'Mango', code: 'MG' },
  { id: 'gen-18', name: 'Nanamichi', code: 'NN' },
  { id: 'gen-19', name: 'Purple Zkittlez', code: 'PZ' },
  { id: 'gen-20', name: 'Rufius', code: 'R' },
  { id: 'gen-21', name: 'Red whine runtz', code: 'RWR' },
  { id: 'gen-22', name: 'Strowberry candy', code: 'SBC' },
  { id: 'gen-23', name: 'Strawberry OG Cookies', code: 'SBOG' },
  { id: 'gen-24', name: 'Slammichi', code: 'SLAM' },
  { id: 'gen-25', name: 'Sugar michi', code: 'SU' },
  { id: 'gen-26', name: 'White fire', code: 'WF' },
  { id: 'gen-27', name: 'VHO', code: 'VHO' },
  { id: 'gen-30', name: 'Limonada mango', code: 'SLM' },
];

export const LOCATIONS: Location[] = [
    // Main Locations
    { id: 'loc-mc', name: 'MC' },
    { id: 'loc-ll', name: 'LL' },
    { id: 'loc-ss', name: 'SS' },
    { id: 'loc-br', name: 'BR' },
    
    // Rooms for MC
    { id: 'room-mcprev', name: 'MCPREV', parentId: 'loc-mc', type: 'VEGETACION' },
    { id: 'room-mc-madres', name: 'MC PLANTAS MADRE', parentId: 'loc-mc', type: 'VEGETACION' },
    { id: 'room-mc1', name: 'MC1', parentId: 'loc-mc', type: 'ciclo completo' },
    { id: 'room-mc2', name: 'MC2', parentId: 'loc-mc', type: 'ciclo completo' },
    { id: 'room-mc3', name: 'MC3', parentId: 'loc-mc', type: 'ciclo completo' },
    { id: 'room-mc4', name: 'MC4', parentId: 'loc-mc', type: 'ciclo completo' },
    { id: 'room-mc5', name: 'MC5', parentId: 'loc-mc', type: 'ciclo completo' },

    // Rooms for LL
    { id: 'room-llveg', name: 'LLVEG', parentId: 'loc-ll', type: 'VEGETACION' },
    { id: 'room-llprev', name: 'LLPREV', parentId: 'loc-ll', type: 'VEGETACION' },
    { id: 'room-ll-madres', name: 'LL PLANTAS MADRE', parentId: 'loc-ll', type: 'VEGETACION' },
    { id: 'room-ll1', name: 'LL1', parentId: 'loc-ll', type: 'FLORACION' },
    { id: 'room-ll2', name: 'LL2', parentId: 'loc-ll', type: 'FLORACION' },
    { id: 'room-ll3', name: 'LL3', parentId: 'loc-ll', type: 'FLORACION' },
    
    // Rooms for SS
    { id: 'room-ss1', name: 'SS1', parentId: 'loc-ss', type: 'ciclo completo' },
    { id: 'room-ss2', name: 'SS2', parentId: 'loc-ss', type: 'ciclo completo' },
    
    // Rooms for BR
    { id: 'room-br1', name: 'BR1', parentId: 'loc-br', type: 'ciclo completo' },
    { id: 'room-br2', name: 'BR2', parentId: 'loc-br', type: 'ciclo completo' },
    { id: 'room-br3', name: 'BR3', parentId: 'loc-br', type: 'ciclo completo' },
    { id: 'room-br4', name: 'BR4', parentId: 'loc-br', type: 'ciclo completo' },
    { id: 'room-br5', name: 'BR5', parentId: 'loc-br', type: 'ciclo completo' },
];

export const MOTHER_PLANTS: MotherPlant[] = [
  // MC Plants
  { id: 'mp-b-mc-1', name: 'B #1 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-b-mc-2', name: 'B #2 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-b-mc-3', name: 'B #3 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-b-mc-4', name: 'B #4 (MC)', geneticsId: 'gen-1', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-bs-mc-1', name: 'BS #1 (MC)', geneticsId: 'gen-2', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-fa-mc-1', name: 'FA #1 (MC)', geneticsId: 'gen-9', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-fa-mc-2', name: 'FA #2 (MC)', geneticsId: 'gen-9', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-hk-mc-1', name: 'HK #1 (MC)', geneticsId: 'gen-12', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-hk-mc-2', name: 'HK #2 (MC)', geneticsId: 'gen-12', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-hk-mc-3', name: 'HK #3 (MC)', geneticsId: 'gen-12', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-jb-mc-1', name: 'JB #1 (MC)', geneticsId: 'gen-13', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-jb-mc-2', name: 'JB #2 (MC)', geneticsId: 'gen-13', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-lbc-mc-1', name: 'LBC #1 (MC)', geneticsId: 'gen-15', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-lbc-mc-2', name: 'LBC #2 (MC)', geneticsId: 'gen-15', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-lu-mc-1', name: 'LU #1 (MC)', geneticsId: 'gen-17', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-nn-mc-1', name: 'NN #1 (MC)', geneticsId: 'gen-18', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-nn-mc-2', name: 'NN #2 (MC)', geneticsId: 'gen-18', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-nn-mc-3', name: 'NN #3 (MC)', geneticsId: 'gen-18', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-pz-mc-1', name: 'PZ #1 (MC)', geneticsId: 'gen-19', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-pz-mc-2', name: 'PZ #2 (MC)', geneticsId: 'gen-19', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-r-mc-1', name: 'R #1 (MC)', geneticsId: 'gen-20', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-r-mc-2', name: 'R #2 (MC)', geneticsId: 'gen-20', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-sbog-mc-1', name: 'SBOG #1 (MC)', geneticsId: 'gen-23', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-su-mc-1', name: 'SU #1 (MC)', geneticsId: 'gen-25', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-su-mc-2', name: 'SU #2 (MC)', geneticsId: 'gen-25', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-vho-mc-1', name: 'VHO #1 (MC)', geneticsId: 'gen-27', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-vho-mc-2', name: 'VHO #2 (MC)', geneticsId: 'gen-27', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-wf-mc-1', name: 'WF #1 (MC)', geneticsId: 'gen-26', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  { id: 'mp-wf-mc-2', name: 'WF #2 (MC)', geneticsId: 'gen-26', locationId: 'room-mc-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
  // LL Plants
  { id: 'mp-hk-ll-1', name: 'HK #1 (LL)', geneticsId: 'gen-12', locationId: 'room-ll-madres', sowingDate: '2025-06-01T06:00:00.000Z', cloneCount: 0, logEntries: [] },
];

export const PLANT_BATCHES: PlantBatch[] = [
    { id: 'SBOG-250714C-LU', name: 'SBOG Clones 2025-07-14', geneticsId: 'gen-23', creationDate: '2025-07-14T06:00:00.000Z', initialPlantCount: 85, rootedPlantCount: 85, availablePlantCount: 0, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'NN-250714C-LU', name: 'NN Clones 2025-07-14', geneticsId: 'gen-18', creationDate: '2025-07-14T06:00:00.000Z', initialPlantCount: 43, rootedPlantCount: 43, availablePlantCount: 0, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'CS-250714C-LU', name: 'CS Clones 2025-07-14', geneticsId: 'gen-6', creationDate: '2025-07-14T06:00:00.000Z', initialPlantCount: 4, rootedPlantCount: 4, availablePlantCount: 0, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'CH-250714C-LU', name: 'CH Clones 2025-07-14', geneticsId: 'gen-5', creationDate: '2025-07-14T06:00:00.000Z', initialPlantCount: 30, rootedPlantCount: 30, availablePlantCount: 0, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'B-250825C-LU', name: 'B Clones 2025-08-25', geneticsId: 'gen-1', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 41, rootedPlantCount: 41, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'BDE-250825C-LU', name: 'BDE Clones 2025-08-25', geneticsId: 'gen-3', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 2, rootedPlantCount: 2, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'FA-250825C-LU', name: 'FA Clones 2025-08-25', geneticsId: 'gen-9', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 6, rootedPlantCount: 6, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'HK-250825C-LU', name: 'HK Clones 2025-08-25', geneticsId: 'gen-12', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 20, rootedPlantCount: 20, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'LBC-250825C-LU', name: 'LBC Clones 2025-08-25', geneticsId: 'gen-15', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 10, rootedPlantCount: 10, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'LU-250825C-LU', name: 'LU Clones 2025-08-25', geneticsId: 'gen-17', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 7, rootedPlantCount: 7, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'NN-250825C-LU', name: 'NN Clones 2025-08-25', geneticsId: 'gen-18', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 25, rootedPlantCount: 25, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'PZ-250825C-LU', name: 'PZ Clones 2025-08-25', geneticsId: 'gen-19', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 25, rootedPlantCount: 25, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'R-250825C-LU', name: 'R Clones 2025-08-25', geneticsId: 'gen-20', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 8, rootedPlantCount: 8, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'SBOG-250825C-LU', name: 'SBOG Clones 2025-08-25', geneticsId: 'gen-23', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 14, rootedPlantCount: 14, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'SLAM-250825C-LU', name: 'SLAM Clones 2025-08-25', geneticsId: 'gen-24', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 16, rootedPlantCount: 16, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'SU-250825C-LU', name: 'SU Clones 2025-08-25', geneticsId: 'gen-25', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 15, rootedPlantCount: 15, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'VHO-250825C-LU', name: 'VHO Clones 2025-08-25', geneticsId: 'gen-27', creationDate: '2025-08-25T06:00:00.000Z', initialPlantCount: 22, rootedPlantCount: 22, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'B-250707C-LU', name: 'B Clones 2025-07-07', geneticsId: 'gen-1', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 7, rootedPlantCount: 7, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'BDE-250707C-LU', name: 'BDE Clones 2025-07-07', geneticsId: 'gen-3', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 4, rootedPlantCount: 4, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'FA-250707C-LU', name: 'FA Clones 2025-07-07', geneticsId: 'gen-9', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 3, rootedPlantCount: 3, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'HK-250707C-LU', name: 'HK Clones 2025-07-07', geneticsId: 'gen-12', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 2, rootedPlantCount: 2, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'PZ-250707C-LU', name: 'PZ Clones 2025-07-07', geneticsId: 'gen-19', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 2, rootedPlantCount: 2, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'R-250707C-LU', name: 'R Clones 2025-07-07', geneticsId: 'gen-20', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 4, rootedPlantCount: 4, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'SLAM-250707C-LU', name: 'SLAM Clones 2025-07-07', geneticsId: 'gen-24', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 6, rootedPlantCount: 6, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'WF-250707C-LU', name: 'WF Clones 2025-07-07', geneticsId: 'gen-26', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 4, rootedPlantCount: 4, availablePlantCount: 0, sourceLocationId: 'loc-mc', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-lumza', logEntries: [] },
    { id: 'HK-250804C-FE', name: 'HK Clones 2025-08-04', geneticsId: 'gen-12', creationDate: '2025-08-04T06:00:00.000Z', initialPlantCount: 40, rootedPlantCount: 40, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'HK-250818C-FE', name: 'HK Clones 2025-08-18', geneticsId: 'gen-12', creationDate: '2025-08-18T06:00:00.000Z', initialPlantCount: 30, rootedPlantCount: 30, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'RWR-250630C-FE', name: 'RWR Clones 2025-06-30', geneticsId: 'gen-21', creationDate: '2025-06-30T06:00:00.000Z', initialPlantCount: 17, rootedPlantCount: 17, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'CH-250630C-FE', name: 'CH Clones 2025-06-30', geneticsId: 'gen-5', creationDate: '2025-06-30T06:00:00.000Z', initialPlantCount: 12, rootedPlantCount: 12, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'RWR-250721C-FE', name: 'RWR Clones 2025-07-21', geneticsId: 'gen-21', creationDate: '2025-07-21T06:00:00.000Z', initialPlantCount: 6, rootedPlantCount: 6, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'CH-250721C-FE', name: 'CH Clones 2025-07-21', geneticsId: 'gen-5', creationDate: '2025-07-21T06:00:00.000Z', initialPlantCount: 6, rootedPlantCount: 6, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'KP-250721C-FE', name: 'KP Clones 2025-07-21', geneticsId: 'gen-14', creationDate: '2025-07-21T06:00:00.000Z', initialPlantCount: 3, rootedPlantCount: 3, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'SU-250721C-FE', name: 'SU Clones 2025-07-21', geneticsId: 'gen-25', creationDate: '2025-07-21T06:00:00.000Z', initialPlantCount: 4, rootedPlantCount: 4, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'SLM-250721C-FE', name: 'SLM Clones 2025-07-21', geneticsId: 'gen-30', creationDate: '2025-07-21T06:00:00.000Z', initialPlantCount: 1, rootedPlantCount: 1, availablePlantCount: 0, sourceLocationId: 'loc-ll', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'R-250707C-FE', name: 'R Clones 2025-07-07', geneticsId: 'gen-20', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 12, rootedPlantCount: 12, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'MG-250707C-FE', name: 'MG Clones 2025-07-07', geneticsId: 'gen-29', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 13, rootedPlantCount: 13, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'B-250707C-FE', name: 'B Clones 2025-07-07', geneticsId: 'gen-1', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 9, rootedPlantCount: 9, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'FA-250707C-FE', name: 'FA Clones 2025-07-07', geneticsId: 'gen-9', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 3, rootedPlantCount: 3, availablePlantCount: 1, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.IN_USE, creatorId: 'user-fermin', logEntries: [] },
    { id: 'BS-250707C-FE', name: 'BS Clones 2025-07-07', geneticsId: 'gen-2', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 3, rootedPlantCount: 3, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'BXBL-250707C-FE', name: 'BXBL Clones 2025-07-07', geneticsId: 'gen-28', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 23, rootedPlantCount: 23, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'SU-250707C-FE', name: 'SU Clones 2025-07-07', geneticsId: 'gen-25', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 15, rootedPlantCount: 15, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'SBOG-250707C-FE', name: 'SBOG Clones 2025-07-07', geneticsId: 'gen-23', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 9, rootedPlantCount: 9, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'KP-250707C-FE', name: 'KP Clones 2025-07-07', geneticsId: 'gen-14', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 6, rootedPlantCount: 6, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'HK-250707C-FE', name: 'HK Clones 2025-07-07', geneticsId: 'gen-12', creationDate: '2025-07-07T06:00:00.000Z', initialPlantCount: 9, rootedPlantCount: 9, availablePlantCount: 0, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.DEPLETED, creatorId: 'user-fermin', logEntries: [] },
    { id: 'KP-250922C-LUB', name: 'KP Clones 2025-09-22', geneticsId: 'gen-14', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 38, availablePlantCount: 38, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'BXBL-250922C-LUB', name: 'BXBL Clones 2025-09-22', geneticsId: 'gen-28', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 38, availablePlantCount: 38, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'SU-250922C-LUB', name: 'SU Clones 2025-09-22', geneticsId: 'gen-25', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 76, availablePlantCount: 76, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'B-250922C-LUB', name: 'B Clones 2025-09-22', geneticsId: 'gen-1', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 35, availablePlantCount: 35, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'SBOG-250922C-LUB', name: 'SBOG Clones 2025-09-22', geneticsId: 'gen-23', creationDate: '2025-09-22T06:00:00.000Z', initialPlantCount: 67, availablePlantCount: 67, sourceLocationId: 'loc-ss', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-luis-b', logEntries: [] },
    { id: 'NN-250915C-GU', name: 'NN Clones 2025-09-15', geneticsId: 'gen-18', creationDate: '2025-09-15T06:00:00.000Z', initialPlantCount: 190, availablePlantCount: 190, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-gustavo', logEntries: [] },
    { id: 'CH-250915C-GU', name: 'CH Clones 2025-09-15', geneticsId: 'gen-5', creationDate: '2025-09-15T06:00:00.000Z', initialPlantCount: 38, availablePlantCount: 38, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-gustavo', logEntries: [] },
    { id: 'SBOG-250915C-GU', name: 'SBOG Clones 2025-09-15', geneticsId: 'gen-23', creationDate: '2025-09-15T06:00:00.000Z', initialPlantCount: 152, availablePlantCount: 152, sourceLocationId: 'loc-br', type: 'clone', status: PlantBatchStatus.GERMINATION_ROOTING, creatorId: 'user-gustavo', logEntries: [] }
];

export const CROPS: Crop[] = [
    // BR Location - CORRECTED
    { id: 'crop-br1-1', geneticsId: 'gen-23', locationId: 'room-br1', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-22T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 42 }, { batchId: 'NN-250714C-LU', count: 2 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br2-1', geneticsId: 'gen-23', locationId: 'room-br2', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-18T06:00:00.000Z', flowerDate: '2025-09-08T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 43 }, { batchId: 'NN-250714C-LU', count: 13 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br3-1', geneticsId: 'gen-6', locationId: 'room-br3', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-22T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 4 }, { batchId: 'CS-250714C-LU', count: 11 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br4-1', geneticsId: 'gen-5', locationId: 'room-br4', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 5 }, { batchId: 'CH-250714C-LU', count: 19 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-br5-1', geneticsId: 'gen-23', locationId: 'room-br5', ownerId: 'user-lumza', cloningDate: '2025-07-14T06:00:00.000Z', preVegDate: '2025-08-04T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'SBOG-250714C-LU', count: 12 }, { batchId: 'CH-250714C-LU', count: 11 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    
    // MC Location - CORRECTED
    { id: 'crop-mcprev-1', geneticsId: 'gen-1', locationId: 'room-mcprev', ownerId: 'user-lumza', cloningDate: '2025-08-25T06:00:00.000Z', preVegDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'B-250825C-LU', count: 41 }, { batchId: 'FA-250825C-LU', count: 6 }, { batchId: 'LBC-250825C-LU', count: 10 }, { batchId: 'NN-250825C-LU', count: 20 }, { batchId: 'PZ-250825C-LU', count: 25 }, { batchId: 'R-250825C-LU', count: 8 }, { batchId: 'SBOG-250825C-LU', count: 14 }, { batchId: 'SLAM-250825C-LU', count: 16 }, { batchId: 'SU-250825C-LU', count: 15 }, { batchId: 'VHO-250825C-LU', count: 22 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-mc1-1', geneticsId: 'gen-1', locationId: 'room-mc1', ownerId: 'user-lumza', cloningDate: '2025-07-07T06:00:00.000Z', preVegDate: '2025-07-28T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'B-250707C-LU', count: 7 }, { batchId: 'BDE-250707C-LU', count: 4 }, { batchId: 'FA-250707C-LU', count: 3 }, { batchId: 'HK-250707C-LU', count: 2 }, { batchId: 'PZ-250707C-LU', count: 2 }, { batchId: 'R-250707C-LU', count: 4 }, { batchId: 'SLAM-250707C-LU', count: 6 }, { batchId: 'WF-250707C-LU', count: 4 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    
    // LL Location - VERIFIED
    { id: 'crop-llveg-1', geneticsId: 'gen-12', locationId: 'room-llveg', ownerId: 'user-fermin', cloningDate: '2025-08-04T06:00:00.000Z', preVegDate: '2025-08-18T06:00:00.000Z', vegDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'HK-250804C-FE', count: 40 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-llprev-1', geneticsId: 'gen-12', locationId: 'room-llprev', ownerId: 'user-fermin', cloningDate: '2025-08-18T06:00:00.000Z', preVegDate: '2025-09-08T06:00:00.000Z', plantCounts: [{ batchId: 'HK-250818C-FE', count: 30 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-ll1-1', geneticsId: 'gen-21', locationId: 'room-ll1', ownerId: 'user-fermin', cloningDate: '2025-06-30T06:00:00.000Z', preVegDate: '2025-07-21T06:00:00.000Z', vegDate: '2025-08-11T06:00:00.000Z', flowerDate: '2025-09-01T06:00:00.000Z', plantCounts: [{ batchId: 'RWR-250630C-FE', count: 17 }, { batchId: 'CH-250630C-FE', count: 12 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-ll3-1', geneticsId: 'gen-21', locationId: 'room-ll3', ownerId: 'user-fermin', cloningDate: '2025-07-21T06:00:00.000Z', preVegDate: '2025-08-11T06:00:00.000Z', vegDate: '2025-09-01T06:00:00.000Z', flowerDate: '2025-09-25T06:00:00.000Z', plantCounts: [{ batchId: 'RWR-250721C-FE', count: 6 }, { batchId: 'CH-250721C-FE', count: 6 }, { batchId: 'KP-250721C-FE', count: 3 }, { batchId: 'SU-250721C-FE', count: 4 }, { batchId: 'SLM-250721C-FE', count: 1 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    
    // SS Location - CORRECTED
    { id: 'crop-ss1-1', geneticsId: 'gen-20', locationId: 'room-ss1', ownerId: 'user-fermin', cloningDate: '2025-07-07T06:00:00.000Z', preVegDate: '2025-07-28T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-15T06:00:00.000Z', plantCounts: [{ batchId: 'R-250707C-FE', count: 12 }, { batchId: 'HK-250707C-FE', count: 9 }, { batchId: 'MG-250707C-FE', count: 13 }, { batchId: 'B-250707C-FE', count: 9 }, { batchId: 'FA-250707C-FE', count: 1 }, { batchId: 'BS-250707C-FE', count: 3 }], logEntries: [], lightHours: { veg: 18, flower: 12 } },
    { id: 'crop-ss2-1', geneticsId: 'gen-28', locationId: 'room-ss2', ownerId: 'user-fermin', cloningDate: '2025-07-07T06:00:00.000Z', preVegDate: '2025-07-28T06:00:00.000Z', vegDate: '2025-08-25T06:00:00.000Z', flowerDate: '2025-09-22T06:00:00.000Z', plantCounts: [{ batchId: 'BXBL-250707C-FE', count: 23 }, { batchId: 'SU-250707C-FE', count: 15 }, { batchId: 'SBOG-250707C-FE', count: 9 }, { batchId: 'KP-250707C-FE', count: 6 }, { batchId: 'FA-250707C-FE', count: 1 }], logEntries: [], lightHours: { veg: 18, flower: 12 } }
];

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

const createCultivoInventoryForLocation = (locationId: string): InventoryItem[] => [
    { id: `inv-yc-${locationId}`, name: 'Yara Calcinit', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sm-${locationId}`, name: 'Sulfato de Magnesio', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-ui-${locationId}`, name: 'ULTRASOL Inicial', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-ud-${locationId}`, name: 'ULTRASOL Desarrollo', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-bo-${locationId}`, name: 'Boro', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-uc-${locationId}`, name: 'ULTRASOL Crecimiento', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-up-${locationId}`, name: 'ULTRASOL Produccion', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-mkp-${locationId}`, name: 'MKP', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-cc-${locationId}`, name: 'Cloruro de Calcio', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-mg-${locationId}`, name: 'Magnesio', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-me-${locationId}`, name: 'Microelementos', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sp-${locationId}`, name: 'Sulfato de Potasio', category: 'Nutriente Base', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-coco-${locationId}`, name: 'Coco Coir', category: 'Sustrato', inventoryType: 'Cultivo', unit: 'L', purchaseUnit: 'bloque', purchaseUnitConversion: 60, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-melaza-${locationId}`, name: 'Melaza', category: 'Suplemento/Bioestimulante', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-tricodermas-${locationId}`, name: 'Tricodermas', category: 'Microorganismos/Biológicos', inventoryType: 'Cultivo', unit: 'g', purchaseUnit: 'kg', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-aminoacidos-${locationId}`, name: 'Aminoacidos', category: 'Suplemento/Bioestimulante', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-anibac-${locationId}`, name: 'Anibac con cobre', category: 'Control de Plagas/Enfermedades', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-bacillus-${locationId}`, name: 'Bacillus subtilis', category: 'Microorganismos/Biológicos', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-rootex-${locationId}`, name: 'Rootex', category: 'Suplemento/Bioestimulante', inventoryType: 'Cultivo', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
];

const createMaintenanceInventoryForLocation = (locationId: string): InventoryItem[] => [
    { id: `inv-filtro-ac-carbon-${locationId}`, name: 'Filtro de carbón activado (AC)', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, description: 'Filtro para aire acondicionado Mirage 2 Ton. Modelo XYZ.', partNumber: 'AC-F-12345', supplier: 'Grainger', minStockLevel: 2 },
    { id: `inv-filtro-deshu-${locationId}`, name: 'Filtro para deshumidificador', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-foam-cleaner-${locationId}`, name: 'Foam cleaner para serpentines', category: 'Limpieza y Sanitización', inventoryType: 'Mantenimiento', unit: 'lata', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, minStockLevel: 5 },
    { id: `inv-sol-cal-ph7-${locationId}`, name: 'Solución calibración pH 7', category: 'Herramientas y Equipo', inventoryType: 'Mantenimiento', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sol-cal-ph4-${locationId}`, name: 'Solución calibración pH 4', category: 'Herramientas y Equipo', inventoryType: 'Mantenimiento', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-sol-cal-ec-${locationId}`, name: 'Solución calibración EC', category: 'Herramientas y Equipo', inventoryType: 'Mantenimiento', unit: 'ml', purchaseUnit: 'L', purchaseUnitConversion: 1000, purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-lampara-uv-${locationId}`, name: 'Lámpara UV para filtro de agua', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0 },
    { id: `inv-filtro-sedimentos-${locationId}`, name: 'Cartucho de filtro de sedimentos', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, description: 'Cartucho estándar de 10 pulgadas, 5 micras.', minStockLevel: 4 },
    { id: `inv-filtro-carbon-${locationId}`, name: 'Cartucho de filtro de carbón', category: 'Refacciones', inventoryType: 'Mantenimiento', unit: 'pieza', purchases: [], currentStock: 0, locationId, averageCostPerUnit: 0, description: 'Cartucho estándar de 10 pulgadas, carbón activado.', minStockLevel: 4 },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
    ...createCultivoInventoryForLocation('loc-ss'), ...createMaintenanceInventoryForLocation('loc-ss'),
    ...createCultivoInventoryForLocation('loc-mc'), ...createMaintenanceInventoryForLocation('loc-mc'),
    ...createCultivoInventoryForLocation('loc-ll'), ...createMaintenanceInventoryForLocation('loc-ll'),
    ...createCultivoInventoryForLocation('loc-br'), ...createMaintenanceInventoryForLocation('loc-br'),
];


export const FORMULAS: Formula[] = [
     { id: 'form-cloning1', name: 'Clonación Semana 1 (Rootex)', nutrients: [
        { inventoryItemId: 'inv-rootex', amountPerLiter: 1 },
    ]},
    { id: 'form-cloning2-3', name: 'Clonación Semanas 2-3', nutrients: [
        { inventoryItemId: 'inv-tricodermas', amountPerLiter: 1 },
        { inventoryItemId: 'inv-ui', amountPerLiter: 1 },
    ]},
    { id: 'form-preveg1', name: 'Pre-Veg Semana 1', nutrients: [
        { inventoryItemId: 'inv-yc', amountPerLiter: 0.825 },
        { inventoryItemId: 'inv-sm', amountPerLiter: 0.425 },
        { inventoryItemId: 'inv-ui', amountPerLiter: 1.0 },
    ]},
    { id: 'form-preveg2-4', name: 'Pre-Veg Semanas 2-4', nutrients: [
        { inventoryItemId: 'inv-yc', amountPerLiter: 0.825 },
        { inventoryItemId: 'inv-sm', amountPerLiter: 0.425 },
        { inventoryItemId: 'inv-ud', amountPerLiter: 1.0 },
    ]},
    { id: 'form-veg', name: 'Vegetación', nutrients: [
        { inventoryItemId: 'inv-yc', amountPerLiter: 0.825 },
        { inventoryItemId: 'inv-sm', amountPerLiter: 0.425 },
        { inventoryItemId: 'inv-ud', amountPerLiter: 1.0 },
    ]},
    { id: 'form-flora1-3', name: 'Floración Semanas 1-3', nutrients: [
        { inventoryItemId: 'inv-yc', amountPerLiter: 0.5 },
        { inventoryItemId: 'inv-sm', amountPerLiter: 0.25 },
        { inventoryItemId: 'inv-bo', amountPerLiter: 0.025 },
        { inventoryItemId: 'inv-uc', amountPerLiter: 1.75 },
    ]},
    { id: 'form-flora4-7', name: 'Floración Semanas 4-7', nutrients: [
        { inventoryItemId: 'inv-yc', amountPerLiter: 0.5 },
        { inventoryItemId: 'inv-sm', amountPerLiter: 0.25 },
        { inventoryItemId: 'inv-bo', amountPerLiter: 0.025 },
        { inventoryItemId: 'inv-up', amountPerLiter: 1.6 },
        { inventoryItemId: 'inv-mkp', amountPerLiter: 0.4 },
    ]},
    { id: 'form-flora8', name: 'Floración Semana 8', nutrients: [
        { inventoryItemId: 'inv-cc', amountPerLiter: 0.5 },
        { inventoryItemId: 'inv-mg', amountPerLiter: 0.25 },
        { inventoryItemId: 'inv-bo', amountPerLiter: 0.025 },
        { inventoryItemId: 'inv-me', amountPerLiter: 0.2 },
        { inventoryItemId: 'inv-sp', amountPerLiter: 1.16 },
        { inventoryItemId: 'inv-mkp', amountPerLiter: 0.84 },
    ]},
    { id: 'form-flush', name: 'Flush (Solo Agua)', nutrients: []},
];


export const FORMULA_SCHEDULE: FormulaSchedule = {
    [CropStage.CLONING]: {
        1: 'form-cloning1',
        2: 'form-cloning2-3',
        3: 'form-cloning2-3',
    },
    [CropStage.VEGETATION]: {
        1: 'form-preveg1',
        2: 'form-preveg2-4',
        3: 'form-preveg2-4',
        4: 'form-preveg2-4',
        5: 'form-veg', // Assuming regular veg starts after week 4
        6: 'form-veg',
    },
    [CropStage.FLOWERING]: {
        1: 'form-flora1-3',
        2: 'form-flora1-3',
        3: 'form-flora1-3',
        4: 'form-flora4-7',
        5: 'form-flora4-7',
        6: 'form-flora4-7',
        7: 'form-flora4-7',
        8: 'form-flora8',
        9: 'form-flush',
        10: 'form-flush',
    }
};

export const STAGES = [
  CropStage.CLONING,
  CropStage.PRE_VEGETATION,
  CropStage.VEGETATION,
  CropStage.FLOWERING,
  CropStage.DRYING_CURING,
  CropStage.HARVESTED,
];

export const TASKS: Task[] = [
    // --- Tareas de Cultivador ---
    { id: 'task-c-1', title: 'Aplicación foliar', description: 'Aplicar foliares según la semana y fórmula.', recurrenceType: 'weekly', dayOfWeek: 1, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Lunes
    { id: 'task-c-1-jueves', title: 'Aplicación foliar', description: 'Aplicar foliares según la semana y fórmula.', recurrenceType: 'weekly', dayOfWeek: 4, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Jueves
    { id: 'task-c-2', title: 'Revisión de plagas', description: 'Inspeccionar detalladamente las plantas en busca de plagas o enfermedades.', recurrenceType: 'weekly', dayOfWeek: 3, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Miércoles
    { id: 'task-c-3', title: 'Defoliación y LST', description: 'Realizar defoliación y entrenamiento de bajo estrés si es necesario.', recurrenceType: 'weekly', dayOfWeek: 5, assigneeRoles: [UserRole.GROWER], locationId: 'all' }, // Viernes
    
    // --- Tareas de Mantenimiento ---
    // HVAC
    { id: 'task-m-ac-filter', title: 'Limpieza de filtros de Aires Acondicionados', recurrenceType: 'weekly', dayOfWeek: 2, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Agua', 'Jabón', 'Cepillo suave'], 
        sop: { 
            title: 'Procedimiento de Limpieza de Filtros de AC', 
            steps: [
                'Apagar la unidad de AC desde el breaker.', 'Remover la cubierta frontal del AC.', 'Extraer los filtros con cuidado.',
                'Lavar los filtros con agua a baja presión y jabón neutro.', 'Dejar secar completamente a la sombra.',
                'Volver a colocar los filtros y la cubierta.', 'Restablecer la energía.'
            ]
        } 
    },
    { id: 'task-m-deshu-filter', title: 'Limpieza de filtro de Deshumidificadores', recurrenceType: 'weekly', dayOfWeek: 2, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Deshumidificadores', requiredTools: ['Agua', 'Jabón', 'Cepillo suave'] },
    { id: 'task-m-ac-serpentin', title: 'Limpieza de serpentín (AC)', recurrenceType: 'monthly', dayOfMonth: 15, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Aspiradora', 'Agua'], requiredParts: [{ inventoryItemId: 'inv-foam-cleaner', quantity: 1 }] },
    { id: 'task-m-deshu-serpentin', title: 'Limpieza de serpentín (Deshumidificador)', recurrenceType: 'bimonthly', dayOfMonth: 15, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Deshumidificadores', requiredTools: ['Aspiradora'], requiredParts: [{ inventoryItemId: 'inv-foam-cleaner', quantity: 1 }] },
    { id: 'task-m-ac-drain', title: 'Revisión y limpieza de drenaje (AC)', recurrenceType: 'monthly', dayOfMonth: 5, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Agua', 'Alambre guía flexible'] },
    { id: 'task-m-ac-pressure', title: 'Revisión de presión de refrigerante', recurrenceType: 'quarterly', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Aires Acondicionados', requiredTools: ['Manómetros para R-410a'] },
    
    // Riego y Agua
    { id: 'task-m-water-filter', title: 'Limpiar filtros de línea de riego', recurrenceType: 'weekly', dayOfWeek: 4, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Sistema de riego', requiredTools: ['Agua a presión', 'Cepillo'] },
    { id: 'task-m-tinacos', title: 'Limpieza de tinacos/depósitos', recurrenceType: 'monthly', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Depósitos de nutrientes', requiredTools: ['Cepillo', 'Cloro/Desinfectante', 'Agua'] },
    { id: 'task-m-humidifiers', title: 'Limpieza de humidificadores', description: 'Limpiar depósito y membranas.', recurrenceType: 'weekly', dayOfWeek: 4, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'HVAC', equipmentType: 'Humidificadores', requiredTools: ['Vinagre blanco', 'Agua', 'Cepillo pequeño'] },
    { id: 'task-m-dosing-pumps', title: 'Calibrar bombas dosificadoras', recurrenceType: 'monthly', dayOfMonth: 10, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Bombas dosificadoras', requiredTools: ['Probeta graduada', 'Cronómetro'] },
    { id: 'task-m-water-cartridges', title: 'Cambio de cartuchos de filtro de agua', recurrenceType: 'semiannually', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Riego', equipmentType: 'Filtro de Agua', requiredTools: ['Llave para portafiltro'], requiredParts: [{ inventoryItemId: 'inv-filtro-sedimentos', quantity: 1 }, { inventoryItemId: 'inv-filtro-carbon', quantity: 1 }] },
    { id: 'task-m-uv-lamp', title: 'Cambio de lámpara UV', recurrenceType: 'semiannually', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Iluminación', equipmentType: 'Filtro de Agua', requiredTools: ['Guantes'], requiredParts: [{ inventoryItemId: 'inv-lampara-uv', quantity: 1 }] },
    
    // Sensores
    { id: 'task-m-sensors-ph-ec', title: 'Calibrar medidores pH/EC', recurrenceType: 'weekly', dayOfWeek: 3, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Sensores', equipmentType: 'Medidores Bluelab', requiredParts: [{ inventoryItemId: 'inv-sol-cal-ph7', quantity: 0.05 }, { inventoryItemId: 'inv-sol-cal-ph4', quantity: 0.05 }, { inventoryItemId: 'inv-sol-cal-ec', quantity: 0.05 }],
        sop: {
            title: 'Procedimiento de Calibración de Medidores Bluelab',
            steps: [
                'Limpiar el electrodo con agua destilada.',
                'Sumergir en solución de calibración pH 7.',
                'Esperar a que la lectura se estabilice y presionar "Cal".',
                'Enjuagar el electrodo con agua destilada.',
                'Sumergir en solución de calibración pH 4.',
                'Esperar a que la lectura se estabilice y presionar "Cal".',
                'Enjuagar y repetir el proceso para EC con la solución correspondiente.'
            ]
        }
    },
    { id: 'task-m-sensors-temp-hum', title: 'Verificar sensores Temp/Humedad', recurrenceType: 'quarterly', dayOfMonth: 10, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Sensores', equipmentType: 'Sensores Ambientales', requiredTools: ['Termohigrómetro calibrado de referencia'] },
    { id: 'task-m-sensors-co2', title: 'Verificar sensor de CO2', recurrenceType: 'semiannually', dayOfMonth: 15, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Sensores', equipmentType: 'Sensor de CO2', requiredTools: ['Medidor de CO2 calibrado de referencia'] },

    // Iluminación y Ventilación
    { id: 'task-m-lights-cleaning', title: 'Limpieza de Lámparas/reflectores', recurrenceType: 'monthly', dayOfMonth: 20, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Iluminación', equipmentType: 'Lámparas', requiredTools: ['Paño de microfibra', 'Alcohol isopropílico'] },
    { id: 'task-m-electrical', title: 'Verificar conexiones eléctricas', recurrenceType: 'quarterly', dayOfMonth: 1, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'General', equipmentType: 'Tableros eléctricos', requiredTools: ['Multímetro (opcional)'] },
    { id: 'task-m-fans', title: 'Limpieza de ventiladores', description: 'Limpiar aspas y rejillas.', recurrenceType: 'monthly', dayOfMonth: 25, assigneeRoles: [UserRole.MAINTENANCE], locationId: 'all', category: 'Ventilación', equipmentType: 'Ventiladores', requiredTools: ['Paño húmedo', 'Desarmador'] },
];

export const FOLIAR_PRODUCTS: { name: string; dose: string }[] = [
  { name: 'Aminoacidos', dose: '2.5 ml/L' },
  { name: 'Aceite de neem', dose: '10 ml/L' },
  { name: 'Anibac con cobre', dose: '2 ml/L' },
  { name: 'Ferfomax', dose: '15 ml/L' },
  { name: 'Bacillus subtilis', dose: '4 ml/L' },
];

export const SUPPLEMENT_PRODUCTS: { name: string; dose: string }[] = [
  { name: 'Aminoacidos', dose: '2.5 ml/L' },
  { name: 'Anibac con cobre', dose: '2 ml/L' },
  { name: 'Bacillus subtilis', dose: '4 ml/L' },
  { name: 'Tricodermas', dose: '1 ml/L' },
  { name: 'Te de microorganismos', dose: '10 ml/L' },
];

export const PLANT_HEALTH_OPTIONS: { [category: string]: string[] } = {
  'Estado Positivo': [
    'Crecimiento vigoroso',
    'Color verde intenso',
    'Sin signos de estrés',
    'Producción de resina alta',
    'Desarrollo de flores denso',
    'Sistema radicular sano',
  ],
  'Plagas Comunes': [
    'Araña roja',
    'Mosca blanca',
    'Trips',
    'Pulgones',
    'Cochinilla',
    'Minadores de hojas',
    'Orugas',
  ],
  'Enfermedades y Hongos': [
    'Oídio',
    'Mildiu',
    'Botrytis (Moho gris)',
    'Pythium (Pudrición de raíz)',
    'Fusarium',
    'Roya',
    'Septoria',
  ],
  'Deficiencias Nutricionales': [
    'Deficiencia de Nitrógeno (N)',
    'Deficiencia de Fósforo (P)',
    'Deficiencia de Potasio (K)',
    'Deficiencia de Calcio (Ca)',
    'Deficiencia de Magnesio (Mg)',
    'Deficiencia de Azufre (S)',
    'Deficiencia de Hierro (Fe)',
    'Deficiencia de Manganeso (Mn)',
    'Deficiencia de Zinc (Zn)',
  ],
  'Otros Problemas': [
    'Estrés por calor',
    'Estrés por frío',
    'Exceso de riego',
    'Falta de riego',
    'Quemaduras por luz',
    'Bloqueo de nutrientes (pH)',
  ],
};

export const EXPENSES: Expense[] = [];

export const TRIMMING_SESSIONS: TrimmingSession[] = [];
export const EQUIPMENT: Equipment[] = [];