/**
 * Servicio de almacenamiento usando Firestore
 * Implementa la misma interfaz que storage.ts para fácil migración
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    writeBatch,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Database, Client } from './types';

// Cache en memoria para mejor performance (similar al comportamiento de localStorage)
let clientsCache: Client[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5000; // 5 segundos

/**
 * Obtener la base de datos completa desde Firestore
 */
export const getDatabase = async (): Promise<Database> => {
    if (typeof window === 'undefined') {
        return { clients: [], lastUpdated: new Date().toISOString() };
    }

    // Usar cache si es reciente
    const now = Date.now();
    if (clientsCache && (now - lastFetchTime) < CACHE_DURATION) {
        return {
            clients: clientsCache,
            lastUpdated: new Date(lastFetchTime).toISOString()
        };
    }

    try {
        const clientsRef = collection(db, 'clients');
        const snapshot = await getDocs(clientsRef);

        const clients: Client[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Convertir Timestamps de Firestore a strings ISO
            clients.push({
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                employees: data.employees?.map((emp: any) => ({
                    ...emp,
                    createdAt: emp.createdAt?.toDate?.()?.toISOString() || emp.createdAt,
                    updatedAt: emp.updatedAt?.toDate?.()?.toISOString() || emp.updatedAt,
                })) || []
            } as Client);
        });

        // Actualizar cache
        clientsCache = clients;
        lastFetchTime = now;

        return {
            clients,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error loading database from Firestore:', error);
        // Fallback a cache si existe
        if (clientsCache) {
            return {
                clients: clientsCache,
                lastUpdated: new Date(lastFetchTime).toISOString()
            };
        }
        return { clients: [], lastUpdated: new Date().toISOString() };
    }
};

/**
 * Guardar la base de datos completa en Firestore
 * Nota: Esta función guarda todos los clientes. Para updates individuales, usar updateClient
 */
export const saveDatabase = async (database: Database): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
        const batch = writeBatch(db);

        // Guardar cada cliente como documento
        database.clients.forEach((client) => {
            const clientRef = doc(db, 'clients', client.id);
            batch.set(clientRef, {
                ...client,
                updatedAt: Timestamp.now()
            });
        });

        await batch.commit();

        // Actualizar cache
        clientsCache = database.clients;
        lastFetchTime = Date.now();
    } catch (error) {
        console.error('Error saving database to Firestore:', error);
        throw new Error('No se pudo guardar los datos en Firestore');
    }
};

/**
 * Obtener todos los clientes
 */
export const getAllClients = async (): Promise<Client[]> => {
    const db = await getDatabase();
    return db.clients;
};

/**
 * Obtener un cliente por ID
 */
export const getClientById = async (id: string): Promise<Client | undefined> => {
    try {
        const clientRef = doc(db, 'clients', id);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
            const data = clientSnap.data();
            return {
                ...data,
                id: clientSnap.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                employees: data.employees?.map((emp: any) => ({
                    ...emp,
                    createdAt: emp.createdAt?.toDate?.()?.toISOString() || emp.createdAt,
                    updatedAt: emp.updatedAt?.toDate?.()?.toISOString() || emp.updatedAt,
                })) || []
            } as Client;
        }

        return undefined;
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        return undefined;
    }
};

/**
 * Crear un nuevo cliente
 */
export const createClient = async (
    client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Client> => {
    try {
        const id = generateId();
        const now = Timestamp.now();

        const newClient: Client = {
            ...client,
            id,
            createdAt: now.toDate().toISOString(),
            updatedAt: now.toDate().toISOString(),
            employees: client.employees || []
        };

        const clientRef = doc(db, 'clients', id);
        await setDoc(clientRef, {
            ...newClient,
            createdAt: now,
            updatedAt: now
        });

        // Invalidar cache
        clientsCache = null;

        return newClient;
    } catch (error) {
        console.error('Error creating client:', error);
        throw error;
    }
};

/**
 * Actualizar un cliente existente
 */
export const updateClient = async (
    id: string,
    updates: Partial<Client>
): Promise<Client | null> => {
    try {
        const clientRef = doc(db, 'clients', id);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) return null;

        const currentData = clientSnap.data();
        const updatedClient = {
            ...currentData,
            ...updates,
            id, // Preservar el ID
            updatedAt: Timestamp.now()
        };

        await setDoc(clientRef, updatedClient);

        // Invalidar cache
        clientsCache = null;

        return {
            ...updatedClient,
            createdAt: updatedClient.createdAt?.toDate?.()?.toISOString() || updatedClient.createdAt,
            updatedAt: updatedClient.updatedAt.toDate().toISOString(),
            employees: updatedClient.employees?.map((emp: any) => ({
                ...emp,
                createdAt: emp.createdAt?.toDate?.()?.toISOString() || emp.createdAt,
                updatedAt: emp.updatedAt?.toDate?.()?.toISOString() || emp.updatedAt,
            })) || []
        } as Client;
    } catch (error) {
        console.error('Error updating client:', error);
        throw error;
    }
};

/**
 * Eliminar un cliente
 */
export const deleteClient = async (id: string): Promise<boolean> => {
    try {
        const clientRef = doc(db, 'clients', id);
        await deleteDoc(clientRef);

        // Invalidar cache
        clientsCache = null;

        return true;
    } catch (error) {
        console.error('Error deleting client:', error);
        return false;
    }
};

/**
 * Agregar un empleado a un cliente
 */
export const addEmployeeToClient = async (
    clientId: string,
    employee: Omit<Client['employees'][0], 'id' | 'createdAt' | 'updatedAt'>
): Promise<Client | null> => {
    try {
        const clientRef = doc(db, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) return null;

        const client = clientSnap.data() as Client;

        const newEmployee = {
            ...employee,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedEmployees = [...(client.employees || []), newEmployee];

        await setDoc(clientRef, {
            ...client,
            employees: updatedEmployees,
            updatedAt: Timestamp.now()
        });

        // Invalidar cache
        clientsCache = null;

        return {
            ...client,
            employees: updatedEmployees,
            updatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error adding employee:', error);
        return null;
    }
};

/**
 * Actualizar un empleado de un cliente
 */
export const updateEmployee = async (
    clientId: string,
    employeeId: string,
    updates: Partial<Client['employees'][0]>
): Promise<Client | null> => {
    try {
        const clientRef = doc(db, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) return null;

        const client = clientSnap.data() as Client;

        const employeeIndex = client.employees?.findIndex(e => e.id === employeeId);
        if (employeeIndex === undefined || employeeIndex === -1) return null;

        const updatedEmployees = [...(client.employees || [])];
        updatedEmployees[employeeIndex] = {
            ...updatedEmployees[employeeIndex],
            ...updates,
            id: employeeId, // Preservar el ID
            updatedAt: new Date().toISOString()
        };

        await setDoc(clientRef, {
            ...client,
            employees: updatedEmployees,
            updatedAt: Timestamp.now()
        });

        // Invalidar cache
        clientsCache = null;

        return {
            ...client,
            employees: updatedEmployees,
            updatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error updating employee:', error);
        return null;
    }
};

/**
 * Eliminar un empleado de un cliente
 */
export const deleteEmployee = async (
    clientId: string,
    employeeId: string
): Promise<boolean> => {
    try {
        const clientRef = doc(db, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) return false;

        const client = clientSnap.data() as Client;

        const updatedEmployees = client.employees?.filter(e => e.id !== employeeId) || [];

        await setDoc(clientRef, {
            ...client,
            employees: updatedEmployees,
            updatedAt: Timestamp.now()
        });

        // Invalidar cache
        clientsCache = null;

        return true;
    } catch (error) {
        console.error('Error deleting employee:', error);
        return false;
    }
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
export const clearDatabase = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
        const clientsRef = collection(db, 'clients');
        const snapshot = await getDocs(clientsRef);

        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        // Limpiar cache
        clientsCache = null;
    } catch (error) {
        console.error('Error clearing database:', error);
    }
};

/**
 * Invalidar cache manualmente (útil después de operaciones externas)
 */
export const invalidateCache = (): void => {
    clientsCache = null;
    lastFetchTime = 0;
};
