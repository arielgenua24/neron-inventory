/**
 * Servicio de almacenamiento usando localStorage
 * Abstracción para fácil migración futura a Supabase/Firebase
 */

import { Database, Client } from './types';

const STORAGE_KEY = 'neron-inventory-db';

/**
 * Obtener la base de datos completa desde localStorage
 */
export const getDatabase = (): Database => {
    if (typeof window === 'undefined') {
        return { clients: [], lastUpdated: new Date().toISOString() };
    }

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return { clients: [], lastUpdated: new Date().toISOString() };
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading database:', error);
        return { clients: [], lastUpdated: new Date().toISOString() };
    }
};

/**
 * Guardar la base de datos completa en localStorage
 */
export const saveDatabase = (database: Database): void => {
    if (typeof window === 'undefined') return;

    try {
        database.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    } catch (error) {
        console.error('Error saving database:', error);
        throw new Error('No se pudo guardar los datos');
    }
};

/**
 * Obtener todos los clientes
 */
export const getAllClients = (): Client[] => {
    const db = getDatabase();
    return db.clients;
};

/**
 * Obtener un cliente por ID
 */
export const getClientById = (id: string): Client | undefined => {
    const db = getDatabase();
    return db.clients.find(client => client.id === id);
};

/**
 * Crear un nuevo cliente
 */
export const createClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const db = getDatabase();

    const newClient: Client = {
        ...client,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employees: client.employees || []
    };

    db.clients.push(newClient);
    saveDatabase(db);

    return newClient;
};

/**
 * Actualizar un cliente existente
 */
export const updateClient = (id: string, updates: Partial<Client>): Client | null => {
    const db = getDatabase();
    const index = db.clients.findIndex(client => client.id === id);

    if (index === -1) return null;

    db.clients[index] = {
        ...db.clients[index],
        ...updates,
        id, // Preservar el ID
        updatedAt: new Date().toISOString()
    };

    saveDatabase(db);
    return db.clients[index];
};

/**
 * Eliminar un cliente
 */
export const deleteClient = (id: string): boolean => {
    const db = getDatabase();
    const index = db.clients.findIndex(client => client.id === id);

    if (index === -1) return false;

    db.clients.splice(index, 1);
    saveDatabase(db);

    return true;
};

/**
 * Agregar un empleado a un cliente
 */
export const addEmployeeToClient = (
    clientId: string,
    employee: Omit<Client['employees'][0], 'id' | 'createdAt' | 'updatedAt'>
): Client | null => {
    const db = getDatabase();
    const client = db.clients.find(c => c.id === clientId);

    if (!client) return null;

    const newEmployee = {
        ...employee,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    client.employees.push(newEmployee);
    client.updatedAt = new Date().toISOString();

    saveDatabase(db);
    return client;
};

/**
 * Actualizar un empleado de un cliente
 */
export const updateEmployee = (
    clientId: string,
    employeeId: string,
    updates: Partial<Client['employees'][0]>
): Client | null => {
    const db = getDatabase();
    const client = db.clients.find(c => c.id === clientId);

    if (!client) return null;

    const employeeIndex = client.employees.findIndex(e => e.id === employeeId);
    if (employeeIndex === -1) return null;

    client.employees[employeeIndex] = {
        ...client.employees[employeeIndex],
        ...updates,
        id: employeeId, // Preservar el ID
        updatedAt: new Date().toISOString()
    };

    client.updatedAt = new Date().toISOString();
    saveDatabase(db);

    return client;
};

/**
 * Eliminar un empleado de un cliente
 */
export const deleteEmployee = (clientId: string, employeeId: string): boolean => {
    const db = getDatabase();
    const client = db.clients.find(c => c.id === clientId);

    if (!client) return false;

    const employeeIndex = client.employees.findIndex(e => e.id === employeeId);
    if (employeeIndex === -1) return false;

    client.employees.splice(employeeIndex, 1);
    client.updatedAt = new Date().toISOString();

    saveDatabase(db);
    return true;
};

/**
 * Generar un ID único
 */
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Limpiar toda la base de datos (útil para desarrollo)
 */
export const clearDatabase = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
};
