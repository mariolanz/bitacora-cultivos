
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { useAuth, useLocations, useGenetics, useConfirmation, useInventory, useFormulas, useTasks, useAnnouncements, useAppData, useEquipment } from '../context/AppProvider';
import { UserRole, InventoryItem, User, Location, Genetics, Task, Formula, InventoryCategory, InventoryType, Equipment } from '../types';
import { INVENTORY_CATEGORIES } from '../constants';
import { Navigate } from 'react-router-dom';

const UserManagement: React.FC = () => {
    const { users, deleteUser, saveUser, currentUser } = useAuth();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const initialFormState = { roles: [] as UserRole[], locationId: '', maintenanceLocationIds: [] as string[], password: '' };
    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        if (editingUser) {
            setForm({
                roles: editingUser.roles,
                locationId: editingUser.locationId || '',
                maintenanceLocationIds: editingUser.maintenanceLocationIds || [],
                password: ''
            });
        }
    }, [editingUser]);

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    const handleDelete = (userId: string, username: string) => {
        showConfirmation(`¿Seguro que quieres eliminar al usuario "${username}"?`, () => deleteUser(userId));
    }

    const handleRoleChange = (role: UserRole) => {
        setForm(prev => {
            const newRoles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles: newRoles };
        });
    };
    
    const handleMaintenanceLocationChange = (locationId: string) => {
        setForm(prev => {
            const newLocations = prev.maintenanceLocationIds.includes(locationId)
                ? prev.maintenanceLocationIds.filter(id => id !== locationId)
                : [...prev.maintenanceLocationIds, locationId];
            return { ...prev, maintenanceLocationIds: newLocations };
        });
    }

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const updatedUser: User = {
            ...editingUser,
            roles: form.roles,
            locationId: form.locationId || undefined,
            maintenanceLocationIds: form.maintenanceLocationIds.length > 0 ? form.maintenanceLocationIds : undefined,
        };
        if (form.password) {
            updatedUser.password = form.password;
        }

        saveUser(updatedUser);
        setEditingUser(null);
    };
    
    return (
        <>
            <Card>
                <h2 className="text-xl font-semibold text-emerald-500 mb-4">Gestión de Usuarios</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Usuario</th><th scope="col" className="px-6 py-3">Roles</th>
                                <th scope="col" className="px-6 py-3">Ubicación Cultivo</th>
                                <th scope="col" className="px-6 py-3">Ubicación Mant.</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-gray-800 border-b border-gray-700">
                                    <td className="px-6 py-4">{user.username}</td>
                                    <td className="px-6 py-4">{user.roles.join(', ')}</td>
                                    <td className="px-6 py-4">{locations.find(l => l.id === user.locationId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{user.maintenanceLocationIds?.join(', ') || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => setEditingUser(user)} className="text-emerald-400 hover:underline mr-4">Editar</button>
                                        <button disabled={currentUser?.id === user.id} onClick={() => handleDelete(user.id, user.username)} className="text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg relative">
                        <button onClick={() => setEditingUser(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl" aria-label="Cerrar">&times;</button>
                        <h3 className="text-lg font-bold mb-4 text-white">Editar Usuario: {editingUser.username}</h3>
                        <form onSubmit={handleSaveUser} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-400">Roles</label>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                {Object.values(UserRole).map(role => (
                                    <label key={role} className="flex items-center">
                                        <input type="checkbox" checked={form.roles.includes(role)} onChange={() => handleRoleChange(role)} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                                        <span className="ml-2 text-gray-300">{role}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Ubicación de Cultivo/Trimeado Principal</label>
                                <select value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                                    <option value="">Ninguna</option>
                                    <option value="TODAS">TODAS</option>
                                    {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400">Ubicaciones de Mantenimiento</label>
                                 <div className="mt-2 p-2 bg-gray-900/50 rounded-md grid grid-cols-2 gap-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={form.maintenanceLocationIds.includes('TODAS')} onChange={() => handleMaintenanceLocationChange('TODAS')} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                                        <span className="ml-2 text-gray-300">TODAS</span>
                                    </label>
                                    {parentLocations.map(loc => (
                                        <label key={loc.id} className="flex items-center">
                                            <input type="checkbox" checked={form.maintenanceLocationIds.includes(loc.id)} onChange={() => handleMaintenanceLocationChange(loc.id)} className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-emerald-600 focus:ring-emerald-500 rounded" />
                                            <span className="ml-2 text-gray-300">{loc.name}</span>
                                        </label>
                                    ))}
                                 </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Nueva Contraseña (opcional)</label>
                                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" placeholder="Dejar en blanco para no cambiar" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">Guardar Cambios</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}

const LocationManagement: React.FC = () => {
    const { locations, saveLocation, deleteLocation } = useLocations();
    const initialFormState = { id: null as string | null, name: '', parentId: '', type: 'ciclo completo' as Location['type'] };
    const [form, setForm] = useState(initialFormState);
    
    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);
    const rooms = useMemo(() => locations.filter(l => l.parentId), [locations]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        const locationData: Location = {
            id: form.id || `loc-${form.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            name: form.name,
            parentId: form.parentId || undefined,
            type: form.parentId ? form.type : undefined,
        };
        saveLocation(locationData);
        setForm(initialFormState);
    }
    
    const handleEdit = (location: Location) => {
        setForm({
            id: location.id,
            name: location.name,
            parentId: location.parentId || '',
            type: location.type || 'ciclo completo'
        });
    }

    const handleCancel = () => {
        setForm(initialFormState);
    }

    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Gestión de Ubicaciones y Cuartos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-4 bg-gray-700 p-4 rounded-lg self-start">
                    <h3 className="font-bold text-white">{form.id ? 'Editar' : 'Añadir Nuevo'}</h3>
                    <div>
                        <label className="text-sm text-gray-400">Nombre</label>
                        <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ej: SS o SS1" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Ubicación Principal (Padre)</label>
                        <select value={form.parentId} onChange={e => setForm(p => ({...p, parentId: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md">
                            <option value="">Ninguna (Es una Ubicación Principal)</option>
                            {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                    {form.parentId && (
                        <div>
                             <label className="text-sm text-gray-400">Tipo de Cuarto</label>
                             <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value as Location['type']}))} className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md">
                                <option value="ciclo completo">Ciclo Completo</option>
                                <option value="VEGETACION">Solo Vegetación</option>
                                <option value="FLORACION">Solo Floración</option>
                             </select>
                        </div>
                    )}
                     <div className="flex gap-2 pt-2">
                        <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">{form.id ? 'Guardar' : 'Crear'}</button>
                        {form.id && <button type="button" onClick={handleCancel} className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md">Cancelar</button>}
                    </div>
                </form>

                <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto space-y-4">
                    {parentLocations.map(parent => (
                        <div key={parent.id} className="p-3 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-white">{parent.name}</h4>
                                <div className="space-x-3">
                                    <button onClick={() => handleEdit(parent)} className="text-emerald-400 hover:underline text-xs">Editar</button>
                                    <button onClick={() => deleteLocation(parent.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                </div>
                            </div>
                            <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-700">
                                {rooms.filter(r => r.parentId === parent.id).map(room => (
                                     <div key={room.id} className="flex justify-between items-center p-2 rounded bg-gray-800">
                                         <div>
                                            <p className="text-gray-300">{room.name}</p>
                                            <p className="text-xs text-gray-500">{room.type}</p>
                                         </div>
                                         <div className="space-x-3">
                                            <button onClick={() => handleEdit(room)} className="text-emerald-400 hover:underline text-xs">Editar</button>
                                            <button onClick={() => deleteLocation(room.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                         </div>
                                     </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

const GeneticsManagement: React.FC = () => {
    const { genetics, saveGenetic, deleteGenetic } = useGenetics();
    const { showConfirmation } = useConfirmation();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenetic, setEditingGenetic] = useState<Genetics | null>(null);
    const [form, setForm] = useState({ name: '', code: '', description: '' });

    useEffect(() => {
        if (editingGenetic) {
            setForm({
                name: editingGenetic.name,
                code: editingGenetic.code,
                description: editingGenetic.description || ''
            });
        } else {
            setForm({ name: '', code: '', description: '' });
        }
    }, [editingGenetic]);
    
    const handleOpenModal = (genetic: Genetics | null) => {
        setEditingGenetic(genetic);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGenetic(null); // Also clear the editing state
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.code) return;
        saveGenetic({
            id: editingGenetic?.id || `gen-${Date.now()}`,
            name: form.name,
            code: form.code,
            description: form.description
        });
        handleCloseModal();
    };

    const handleDelete = (id: string, name: string) => {
        showConfirmation(`¿Seguro que quieres eliminar la genética "${name}"?`, () => deleteGenetic(id));
    };
    
    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-emerald-500">Librería de Genéticas</h2>
                    <button onClick={() => handleOpenModal(null)} className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">
                        + Añadir Genética
                    </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    <ul>
                        {genetics.map(gen => (
                            <li key={gen.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-700">
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{gen.name} ({gen.code})</p>
                                    {gen.description && <p className="text-xs text-gray-400 truncate">{gen.description}</p>}
                                </div>
                                <div className="space-x-3 ml-4">
                                    <button onClick={() => handleOpenModal(gen)} className="text-emerald-400 text-xs hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(gen.id, gen.name)} className="text-red-500 text-xs hover:underline">Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg relative">
                        <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl" aria-label="Cerrar">&times;</button>
                        <h3 className="text-lg font-bold mb-4 text-white">{editingGenetic ? 'Editar Genética' : 'Crear Genética'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="text-sm">Nombre</label><input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required /></div>
                            <div><label className="text-sm">Código</label><input type="text" value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" required /></div>
                            <div><label className="text-sm">Observaciones</label><textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={4} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" /></div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">{editingGenetic ? 'Guardar Cambios' : 'Crear'}</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}

const InventoryManagement: React.FC = () => {
    const { inventory, saveInventoryItem, deleteInventoryItem, addPurchaseToItem } = useInventory();
    const { currentUser } = useAuth();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();

    const [selectedLocationId, setSelectedLocationId] = useState(currentUser?.locationId || 'loc-ss');
    const [activeInventoryType, setActiveInventoryType] = useState<InventoryType>('Cultivo');
    
    const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);

    // State for Purchase Modal
    const [purchaseForm, setPurchaseForm] = useState({ itemId: '', purchaseQuantity: '', totalCost: '' });
    
    // State for Create/Edit Item Modal
    const emptyItem: Omit<InventoryItem, 'id' | 'purchases' | 'currentStock' | 'averageCostPerUnit'> = { name: '', category: 'Nutriente Base', inventoryType: activeInventoryType, unit: 'g', locationId: selectedLocationId };
    const [itemForm, setItemForm] = useState<Omit<InventoryItem, 'id' | 'purchases' | 'currentStock' | 'averageCostPerUnit'>>(emptyItem);

    useEffect(() => {
        if(editingItem) setItemForm(editingItem)
        else setItemForm({ ...emptyItem, inventoryType: activeInventoryType, locationId: selectedLocationId });
    }, [editingItem, activeInventoryType, selectedLocationId])

    const filteredInventory = useMemo(() => {
        return inventory.filter(i => i.locationId === selectedLocationId && i.inventoryType === activeInventoryType);
    }, [inventory, selectedLocationId, activeInventoryType]);

    const handleRegisterPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        const { itemId, purchaseQuantity, totalCost } = purchaseForm;
        addPurchaseToItem(itemId, parseFloat(purchaseQuantity), parseFloat(totalCost));
        setPurchaseModalOpen(false);
        setPurchaseForm({ itemId: '', purchaseQuantity: '', totalCost: '' });
    };
    
    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        const conversion = itemForm.purchaseUnitConversion ? parseFloat(String(itemForm.purchaseUnitConversion)) : undefined;
        const minStock = itemForm.minStockLevel ? parseFloat(String(itemForm.minStockLevel)) : undefined;

        const itemToSave: InventoryItem = {
            id: editingItem?.id || `inv-${itemForm.name.toLowerCase().replace(/\s/g, '')}-${itemForm.locationId}`,
            ...itemForm,
            purchaseUnitConversion: conversion,
            minStockLevel: minStock,
            purchases: editingItem?.purchases || [],
            currentStock: editingItem?.currentStock || 0,
            averageCostPerUnit: editingItem?.averageCostPerUnit || 0,
        };
        
        saveInventoryItem(itemToSave);
        setEditingItem(null);
    };

    const handleDelete = (item: InventoryItem) => {
        showConfirmation(`¿Estás seguro que quieres eliminar "${item.name}"? Esta acción no se puede deshacer.`, () => {
            deleteInventoryItem(item.id);
        });
    }

    const selectedPurchaseItem = useMemo(() => inventory.find(i => i.id === purchaseForm.itemId), [purchaseForm.itemId, inventory]);

    return (
        <>
        <Card>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-xl font-semibold text-emerald-500">Gestión de Inventario</h2>
                 <div className="flex gap-2">
                    {currentUser?.roles.includes(UserRole.ADMIN) && (
                        <select value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                            {locations.filter(l => !l.parentId).map(loc => (<option key={loc.id} value={loc.id}>Ubicación: {loc.name}</option>))}
                        </select>
                    )}
                    <button onClick={() => setEditingItem(emptyItem as InventoryItem)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md text-sm">+ Añadir Artículo</button>
                    <button onClick={() => setPurchaseModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">Registrar Nueva Compra</button>
                 </div>
            </div>

            <div className="mb-4 border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveInventoryType('Cultivo')} className={`${ activeInventoryType === 'Cultivo' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}>Inventario de Cultivo</button>
                    <button onClick={() => setActiveInventoryType('Mantenimiento')} className={`${ activeInventoryType === 'Mantenimiento' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}>Inventario de Mantenimiento</button>
                </nav>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3">Artículo</th>
                            <th scope="col" className="px-4 py-3">Categoría</th>
                            <th scope="col" className="px-4 py-3">Stock Actual</th>
                            <th scope="col" className="px-4 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.map(item => (
                            <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-4 py-2 font-medium text-white">
                                    <button onClick={() => setHistoryItem(item)} className="text-left hover:text-emerald-400 hover:underline">
                                        {item.name}
                                    </button>
                                </td>
                                <td className="px-4 py-2 text-gray-400">{item.category}</td>
                                <td className="px-4 py-2">{item.currentStock.toFixed(2)} {item.unit}</td>
                                <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                                    <button onClick={() => setEditingItem(item)} className="text-emerald-400 hover:underline text-xs">Editar</button>
                                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>

        {historyItem && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md relative">
                    <button onClick={() => setHistoryItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" aria-label="Cerrar">&times;</button>
                    <h3 className="text-lg font-bold mb-4 text-white">Historial de Compras: {historyItem.name}</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {historyItem.purchases.length > 0 ? historyItem.purchases.slice().reverse().map((p, i) => (
                            <div key={i} className="bg-gray-700 p-3 rounded text-sm">
                                <p><strong>Fecha:</strong> {new Date(p.date).toLocaleDateString()}</p>
                                <p><strong>Cantidad:</strong> {p.quantity.toFixed(2)} {historyItem.unit}</p>
                                <p><strong>Costo Total:</strong> ${p.totalCost.toFixed(2)}</p>
                            </div>
                        )) : <p className="text-gray-500 text-center py-4">No hay compras registradas.</p>}
                    </div>
                </Card>
            </div>
        )}

        {editingItem && (
             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                 <Card className="w-full max-w-lg relative">
                      <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Cerrar">&times;</button>
                      <h3 className="text-lg font-bold mb-4 text-white">{editingItem.id ? 'Editar' : 'Crear'} Artículo</h3>
                      <form onSubmit={handleSaveItem} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                          <div><label className="text-sm text-gray-400">Nombre</label><input type="text" value={itemForm.name} onChange={e => setItemForm(p => ({...p, name: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" required /></div>
                          <div><label className="text-sm text-gray-400">Categoría</label><select value={itemForm.category} onChange={e => setItemForm(p => ({...p, category: e.target.value as InventoryCategory}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md">{INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                           <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm text-gray-400">Unidad Stock</label><input type="text" placeholder="g, ml, pza" value={itemForm.unit} onChange={e => setItemForm(p => ({...p, unit: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" required /></div>
                            <div><label className="text-sm text-gray-400">Unidad Compra</label><input type="text" placeholder="kg, L, caja" value={itemForm.purchaseUnit || ''} onChange={e => setItemForm(p => ({...p, purchaseUnit: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" /></div>
                           </div>
                           <div><label className="text-sm text-gray-400">Factor Conversión</label><input type="number" placeholder="1000" value={itemForm.purchaseUnitConversion || ''} onChange={e => setItemForm(p => ({...p, purchaseUnitConversion: parseFloat(e.target.value)}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" /></div>
                           <hr className="border-gray-600"/>
                           <h4 className="text-md font-semibold text-gray-300">Detalles Adicionales</h4>
                           <div><label className="text-sm text-gray-400">Descripción</label><textarea value={itemForm.description || ''} onChange={e => setItemForm(p => ({...p, description: e.target.value}))} rows={2} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"/></div>
                           <div className="grid grid-cols-2 gap-4">
                               <div><label className="text-sm text-gray-400">Nº de Parte</label><input type="text" value={itemForm.partNumber || ''} onChange={e => setItemForm(p => ({...p, partNumber: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" /></div>
                               <div><label className="text-sm text-gray-400">Proveedor</label><input type="text" value={itemForm.supplier || ''} onChange={e => setItemForm(p => ({...p, supplier: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" /></div>
                           </div>
                           <div><label className="text-sm text-gray-400">Nivel Mínimo de Stock</label><input type="number" placeholder="2" value={itemForm.minStockLevel || ''} onChange={e => setItemForm(p => ({...p, minStockLevel: parseFloat(e.target.value)}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" /></div>
                          <button type="submit" className="w-full mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">Guardar Artículo</button>
                      </form>
                 </Card>
            </div>
        )}
        
        {isPurchaseModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                 <Card className="w-full max-w-lg relative">
                      <button onClick={() => setPurchaseModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Cerrar">&times;</button>
                      <h3 className="text-lg font-bold mb-4 text-white">Registrar Compra ({activeInventoryType})</h3>
                      <form onSubmit={handleRegisterPurchase} className="space-y-4">
                          <div><label className="text-sm text-gray-400">Artículo</label><select value={purchaseForm.itemId} onChange={e => setPurchaseForm(p => ({...p, itemId: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" required><option value="">Seleccionar...</option>{filteredInventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                          <div><label className="text-sm text-gray-400">Cantidad Comprada {selectedPurchaseItem?.purchaseUnit ? `(en ${selectedPurchaseItem.purchaseUnit})` : ''}</label><input type="number" step="0.01" value={purchaseForm.purchaseQuantity} onChange={e => setPurchaseForm(p => ({...p, purchaseQuantity: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" required /></div>
                          <div><label className="text-sm text-gray-400">Costo Total ($)</label><input type="number" step="0.01" value={purchaseForm.totalCost} onChange={e => setPurchaseForm(p => ({...p, totalCost: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md" required /></div>
                          <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">Registrar Compra</button>
                      </form>
                 </Card>
            </div>
        )}
        </>
    );
};


const FormulaManagement: React.FC = () => {
    const { formulas, saveFormula, deleteFormula } = useFormulas();
    const { inventory } = useInventory();
    const { showConfirmation } = useConfirmation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
    const [form, setForm] = useState({ id: '', name: '', targetPPM: '', nutrients: [{ inventoryItemId: '', amountPerLiter: '' }] });

    const availableNutrients = useMemo(() => {
        const uniqueNutrients = new Map<string, { id: string; name: string }>();
        inventory
            .filter(item => ['Nutriente Base', 'Suplemento/Bioestimulante'].includes(item.category))
            .forEach(item => {
                const genericId = item.id.split('-').slice(0, 2).join('-');
                if (!uniqueNutrients.has(item.name)) {
                    uniqueNutrients.set(item.name, { id: genericId, name: item.name });
                }
            });
        return Array.from(uniqueNutrients.values());
    }, [inventory]);

    const handleOpenModal = (formula: Formula | null) => {
        setEditingFormula(formula);
        if (formula) {
            setForm({
                id: formula.id,
                name: formula.name,
                targetPPM: formula.targetPPM?.toString() || '',
                nutrients: formula.nutrients.map(n => ({ inventoryItemId: n.inventoryItemId, amountPerLiter: n.amountPerLiter.toString() }))
            });
        } else {
            setForm({ id: '', name: '', targetPPM: '', nutrients: [{ inventoryItemId: '', amountPerLiter: '' }] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNutrientChange = (index: number, field: 'inventoryItemId' | 'amountPerLiter', value: string) => {
        const newNutrients = [...form.nutrients];
        newNutrients[index][field] = value;
        setForm(prev => ({ ...prev, nutrients: newNutrients }));
    };

    const addNutrientRow = () => {
        setForm(prev => ({ ...prev, nutrients: [...prev.nutrients, { inventoryItemId: '', amountPerLiter: '' }] }));
    };

    const removeNutrientRow = (index: number) => {
        setForm(prev => ({ ...prev, nutrients: prev.nutrients.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFormula: Formula = {
            id: editingFormula?.id || `form-${Date.now()}`,
            name: form.name,
            targetPPM: form.targetPPM ? parseFloat(form.targetPPM) : undefined,
            nutrients: form.nutrients
                .filter(n => n.inventoryItemId && n.amountPerLiter)
                .map(n => ({ inventoryItemId: n.inventoryItemId, amountPerLiter: parseFloat(n.amountPerLiter) }))
        };
        saveFormula(finalFormula);
        handleCloseModal();
    };

    const handleDelete = (id: string, name: string) => {
        showConfirmation(`¿Seguro que quieres eliminar la fórmula "${name}"?`, () => deleteFormula(id));
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-emerald-500">Gestión de Fórmulas de Nutrientes</h2>
                    <button onClick={() => handleOpenModal(null)} className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">+ Añadir Fórmula</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {formulas.map(formula => (
                        <div key={formula.id} className="p-3 rounded-md hover:bg-gray-700 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">{formula.name}</p>
                                <p className="text-xs text-gray-400">Nutrientes: {formula.nutrients.length} | PPM: {formula.targetPPM || 'N/A'}</p>
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => handleOpenModal(formula)} className="text-emerald-400 text-sm hover:underline">Editar</button>
                                <button onClick={() => handleDelete(formula.id, formula.name)} className="text-red-500 text-sm hover:underline">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                     <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
                        <h3 className="text-lg font-bold mb-4 text-white">{editingFormula ? 'Editar Fórmula' : 'Crear Fórmula'}</h3>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Nombre de la fórmula" className="w-full px-3 py-2 bg-gray-700 rounded-md" required />
                                <input name="targetPPM" value={form.targetPPM} onChange={handleFormChange} placeholder="PPM Objetivo" type="number" className="w-full px-3 py-2 bg-gray-700 rounded-md" />
                            </div>
                            <h4 className="text-md font-semibold text-gray-300 mb-2">Nutrientes</h4>
                            <div className="space-y-2">
                                {form.nutrients.map((n, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                        <select value={n.inventoryItemId} onChange={e => handleNutrientChange(index, 'inventoryItemId', e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded-md">
                                            <option value="">Seleccionar nutriente...</option>
                                            {availableNutrients.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                        </select>
                                        <input type="number" step="0.001" value={n.amountPerLiter} onChange={e => handleNutrientChange(index, 'amountPerLiter', e.target.value)} placeholder="g/L o ml/L" className="w-32 px-3 py-2 bg-gray-700 rounded-md" />
                                        <button type="button" onClick={() => removeNutrientRow(index)} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addNutrientRow} className="mt-4 text-sm text-emerald-400 hover:underline">+ Añadir Nutriente</button>
                            <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-gray-700">
                                <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-md">Guardar Fórmula</button>
                            </div>
                        </form>
                    </Card>
                 </div>
            )}
        </>
    );
};

const TaskManagement: React.FC = () => {
    const { tasks, saveTask, deleteTask } = useTasks();
    const { showConfirmation } = useConfirmation();
    const { locations } = useLocations();

    const initialForm: Omit<Task, 'id'> = {
        title: '',
        description: '',
        recurrenceType: 'weekly',
        dayOfWeek: 1, // Default Monday
        assigneeRoles: [UserRole.GROWER],
        locationId: 'all'
    };
    const [form, setForm] = useState(initialForm);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || form.assigneeRoles.length === 0) return;
        saveTask({ id: editingTask?.id || `task-${Date.now()}`, ...form });
        setEditingTask(null);
        setForm(initialForm);
    };
    
    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setForm(task);
    };

    const handleCancel = () => {
        setEditingTask(null);
        setForm(initialForm);
    };

    const handleDelete = (id: string, title: string) => {
        showConfirmation(`¿Seguro que quieres eliminar la tarea "${title}"?`, () => deleteTask(id));
    };

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Gestión de Tareas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-4 bg-gray-700 p-4 rounded-lg self-start">
                    <h3 className="font-bold text-white">{editingTask ? 'Editar Tarea' : 'Crear Tarea'}</h3>
                    <input type="text" placeholder="Título" value={form.title} onChange={e => setForm(p=>({...p, title: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" required />
                    <textarea placeholder="Descripción" value={form.description} onChange={e => setForm(p=>({...p, description: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" rows={2}/>
                     <select value={form.recurrenceType} onChange={e => setForm(p=>({...p, recurrenceType: e.target.value as any}))} className="w-full px-3 py-2 bg-gray-800 rounded-md">
                        <option value="weekly">Semanal</option>
                        <option value="daily">Diaria</option>
                        <option value="monthly">Mensual</option>
                        <option value="single">Única vez</option>
                    </select>
                    {form.recurrenceType === 'weekly' && (
                        <select value={form.dayOfWeek} onChange={e => setForm(p=>({...p, dayOfWeek: parseInt(e.target.value)}))} className="w-full px-3 py-2 bg-gray-800 rounded-md">
                            {[1,2,3,4,5,6,0].map(d => <option key={d} value={d}>{['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][d-1] || 'Domingo'}</option>)}
                        </select>
                    )}
                    <select value={form.assigneeRoles[0]} onChange={e => setForm(p=>({...p, assigneeRoles: [e.target.value as UserRole]}))} className="w-full px-3 py-2 bg-gray-800 rounded-md">
                        <option value={UserRole.GROWER}>Cultivador</option>
                        <option value={UserRole.MAINTENANCE}>Mantenimiento</option>
                    </select>
                     <select value={form.locationId} onChange={e => setForm(p=>({...p, locationId: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md">
                        <option value="all">Todas</option>
                        {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-md">{editingTask ? 'Guardar' : 'Crear'}</button>
                        {editingTask && <button type="button" onClick={handleCancel} className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md">Cancelar</button>}
                    </div>
                </form>

                <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto">
                    {tasks.map(task => (
                        <div key={task.id} className="p-3 bg-gray-800 rounded mb-2 flex justify-between items-start">
                           <div>
                                <p className="font-bold text-white">{task.title}</p>
                                <p className="text-xs text-gray-400">{task.assigneeRoles.join(', ')} @ {locations.find(l=>l.id === task.locationId)?.name || 'Todas'}</p>
                           </div>
                           <div className="space-x-2 flex-shrink-0">
                                <button onClick={() => handleEdit(task)} className="text-emerald-400 hover:underline text-xs">Editar</button>
                                <button onClick={() => handleDelete(task.id, task.title)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

const AdminAnnouncements: React.FC = () => {
    const { addAnnouncement } = useAnnouncements();
    const { locations } = useLocations();
    const [message, setMessage] = useState('');
    const [targetLocation, setTargetLocation] = useState('global');

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    const handleSend = () => {
        if (message.trim()) {
            addAnnouncement(message, targetLocation === 'global' ? undefined : targetLocation);
            setMessage('');
            setTargetLocation('global');
            alert('Anuncio enviado.');
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Enviar Anuncio</h2>
            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="w-full p-2 bg-gray-700 rounded-md"
                placeholder="Escribe tu anuncio aquí. Aparecerá en una ventana emergente para los usuarios seleccionados."
            />
            <div className="mt-4">
                <label htmlFor="location-select" className="block text-sm font-medium text-gray-400">Enviar a Ubicación</label>
                <select id="location-select" value={targetLocation} onChange={e => setTargetLocation(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                    <option value="global">Global (Todos los usuarios)</option>
                    {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
            </div>
            <button onClick={handleSend} className="mt-4 w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">
                Enviar Anuncio
            </button>
        </Card>
    );
};

const DataManagement: React.FC = () => {
    const { exportFullBackup, importFullBackup, exportNewRecords, importAndMergeRecords } = useAppData();
    const { currentUser } = useAuth();
    const { showConfirmation } = useConfirmation();
    const backupInputRef = useRef<HTMLInputElement>(null);
    const mergeInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, handler: (data: string) => void, confirmationMessage: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        showConfirmation(confirmationMessage, () => {
            const reader = new FileReader();
            reader.onload = e => {
                if (typeof e.target?.result === 'string') {
                    handler(e.target.result);
                }
            };
            reader.readAsText(file);
        });
        event.target.value = ''; // Reset file input
    };

    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Gestión de Datos y Sincronización</h2>
            
            <input type="file" accept=".json" ref={backupInputRef} onChange={e => handleFileChange(e, importFullBackup, "Restaurar desde un respaldo reemplazará TODOS los datos actuales. Esta acción es irreversible. ¿Continuar?")} className="hidden" />
            <input type="file" accept=".json" ref={mergeInputRef} onChange={e => handleFileChange(e, importAndMergeRecords, "¿Quieres combinar los registros de este archivo con tus datos actuales?")} className="hidden" />

            {isAdmin ? (
                <>
                    <h3 className="text-lg font-bold text-gray-300">Acciones de Administrador</h3>
                    <p className="text-gray-400 mb-4 text-sm">Usa estas acciones para gestionar la base de datos maestra.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={exportFullBackup} className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md">Exportar Respaldo Completo</button>
                        <button onClick={() => backupInputRef.current?.click()} className="py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-md">Restaurar desde Respaldo</button>
                        <button onClick={() => mergeInputRef.current?.click()} className="col-span-1 sm:col-span-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md">Importar y Combinar Registros de Colaborador</button>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-lg font-bold text-gray-300">Acciones de Colaborador</h3>
                    <p className="text-gray-400 mb-4 text-sm">Al final de tu jornada, exporta tus nuevos registros y envíalos al administrador.</p>
                    <button onClick={exportNewRecords} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md">Exportar Nuevos Registros</button>
                </>
            )}
        </Card>
    );
};

const EquipmentManagement: React.FC = () => {
    const { equipment, saveEquipment, deleteEquipment } = useEquipment();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();

    const initialFormState = {
        name: '',
        locationId: '', // main location
        roomId: '', // specific room
        category: 'General' as Equipment['category'],
        purchaseDate: '',
        warrantyEndDate: '',
        lifespanHours: ''
    };

    const [form, setForm] = useState(initialFormState);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    
    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);
    const roomsForSelectedLocation = useMemo(() => {
        if (!form.locationId) return [];
        return locations.filter(l => l.parentId === form.locationId);
    }, [form.locationId, locations]);

    useEffect(() => {
        if (editingEquipment) {
            setForm({
                name: editingEquipment.name,
                locationId: editingEquipment.locationId,
                roomId: editingEquipment.roomId || '',
                category: editingEquipment.category,
                purchaseDate: editingEquipment.purchaseDate?.split('T')[0] || '',
                warrantyEndDate: editingEquipment.warrantyEndDate?.split('T')[0] || '',
                lifespanHours: editingEquipment.lifespanHours?.toString() || ''
            });
        } else {
            setForm(initialFormState);
        }
    }, [editingEquipment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.locationId || !form.category) return;
        
        const eqData: Equipment = {
            id: editingEquipment?.id || `eq-${Date.now()}`,
            name: form.name,
            locationId: form.locationId,
            roomId: form.roomId || undefined,
            category: form.category,
            purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
            warrantyEndDate: form.warrantyEndDate ? new Date(form.warrantyEndDate).toISOString() : undefined,
            lifespanHours: form.lifespanHours ? parseInt(form.lifespanHours) : undefined,
        };
        saveEquipment(eqData);
        handleCancel();
    };

    const handleEdit = (eq: Equipment) => {
        setEditingEquipment(eq);
    };

    const handleCancel = () => {
        setEditingEquipment(null);
        setForm(initialFormState);
    };

    const handleDelete = (eq: Equipment) => {
        showConfirmation(`¿Seguro que quieres eliminar el equipo "${eq.name}"?`, () => deleteEquipment(eq.id));
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-emerald-500 mb-4">Gestión de Equipos</h2>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-4 bg-gray-700 p-4 rounded-lg self-start">
                    <h3 className="font-bold text-white">{editingEquipment ? 'Editar Equipo' : 'Añadir Equipo'}</h3>
                    <input type="text" placeholder="Nombre (ej. AC Cuarto 1)" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" required />
                    <select value={form.locationId} onChange={e => setForm(p => ({...p, locationId: e.target.value, roomId: ''}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" required>
                        <option value="">Ubicación Principal...</option>
                        {parentLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                    {roomsForSelectedLocation.length > 0 && (
                        <select value={form.roomId} onChange={e => setForm(p => ({...p, roomId: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md">
                            <option value="">Cuarto Específico (Opcional)...</option>
                            {roomsForSelectedLocation.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                        </select>
                    )}
                     <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value as Equipment['category']}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" required>
                        {['HVAC', 'Riego', 'Iluminación', 'Sensores', 'General', 'Ventilación'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div><label className="text-xs text-gray-400">Fecha Compra</label><input type="date" value={form.purchaseDate} onChange={e => setForm(p => ({...p, purchaseDate: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" /></div>
                    <div><label className="text-xs text-gray-400">Fin Garantía</label><input type="date" value={form.warrantyEndDate} onChange={e => setForm(p => ({...p, warrantyEndDate: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" /></div>
                    <div><label className="text-xs text-gray-400">Vida Útil (horas)</label><input type="number" placeholder="50000" value={form.lifespanHours} onChange={e => setForm(p => ({...p, lifespanHours: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 rounded-md" /></div>
                    <div className="flex gap-2">
                        {editingEquipment && <button type="button" onClick={handleCancel} className="w-full py-2 px-4 bg-gray-600 rounded-md">Cancelar</button>}
                        <button type="submit" className="w-full py-2 px-4 bg-emerald-600 rounded-md">{editingEquipment ? 'Guardar' : 'Crear'}</button>
                    </div>
                </form>

                 <div className="lg:col-span-2 max-h-[60vh] overflow-y-auto">
                    {equipment.map(eq => (
                        <div key={eq.id} className="p-3 bg-gray-800 rounded mb-2 flex justify-between items-start">
                           <div>
                                <p className="font-bold text-white">{eq.name}</p>
                                <p className="text-xs text-gray-400">{locations.find(l=>l.id === eq.locationId)?.name} {eq.roomId ? `> ${locations.find(l=>l.id === eq.roomId)?.name}` : ''}</p>
                                <p className="text-xs text-gray-500">{eq.category}</p>
                           </div>
                           <div className="space-x-2 flex-shrink-0">
                                <button onClick={() => handleEdit(eq)} className="text-emerald-400 hover:underline text-xs">Editar</button>
                                <button onClick={() => handleDelete(eq)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};


const Settings: React.FC = () => {
    const { currentUser } = useAuth();

    const tabs = useMemo(() => ({
        'data': { label: 'Gestión de Datos', component: <DataManagement />, roles: [UserRole.ADMIN, UserRole.GROWER, UserRole.MAINTENANCE, UserRole.TRIMMER] },
        'inventory': { label: 'Inventario', component: <InventoryManagement />, roles: [UserRole.ADMIN, UserRole.MAINTENANCE] },
        'equipos': { label: 'Equipos', component: <EquipmentManagement />, roles: [UserRole.ADMIN, UserRole.MAINTENANCE] },
        'tasks': { label: 'Tareas', component: <TaskManagement />, roles: [UserRole.ADMIN, UserRole.MAINTENANCE] },
        'formulas': { label: 'Fórmulas', component: <FormulaManagement />, roles: [UserRole.ADMIN] },
        'locations': { label: 'Ubicaciones', component: <LocationManagement />, roles: [UserRole.ADMIN] },
        'genetics': { label: 'Genéticas', component: <GeneticsManagement />, roles: [UserRole.ADMIN] },
        'users': { label: 'Usuarios', component: <UserManagement />, roles: [UserRole.ADMIN] },
        'announcements': { label: 'Anuncios', component: <AdminAnnouncements />, roles: [UserRole.ADMIN] },
    }), []);

    const visibleTabs = useMemo(() => 
        Object.entries(tabs).filter(([, tab]) => 
            currentUser?.roles.some(role => tab.roles.includes(role))
        ), 
    [tabs, currentUser]);

    const [activeTab, setActiveTab] = useState(visibleTabs[0]?.[0] || '');

    useEffect(() => {
        // If the current active tab is no longer visible, switch to the first available one.
        if (!visibleTabs.some(([key]) => key === activeTab)) {
            setActiveTab(visibleTabs[0]?.[0] || '');
        }
    }, [visibleTabs, activeTab]);
    

    if (!currentUser) return <Navigate to="/login" />;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Gestión y Ajustes</h1>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {visibleTabs.map(([key, tab]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`${ activeTab === key ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {tabs[activeTab as keyof typeof tabs]?.component}
            </div>
        </div>
    );
};

export default Settings;
