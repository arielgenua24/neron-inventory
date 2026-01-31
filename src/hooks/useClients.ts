/**
 * Custom hook para manejar clientes y empleados
 * Proporciona una interfaz reactiva para todas las operaciones
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client, Employee, MonthKey } from '@/lib/types';
import {
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
    addEmployeeToClient,
    updateEmployee,
    deleteEmployee
} from '@/lib/storage-firestore';
import {
    setHonorarioForMonth,
    setPaidStatusForMonth
} from '@/lib/honorarios-logic';

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar clientes al montar el componente
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllClients();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Crear un nuevo cliente
    const addClient = useCallback(async (
        clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'employees'>
    ) => {
        try {
            const newClient = await createClient({ ...clientData, employees: [] });
            setClients(prev => [...prev, newClient]);
            return newClient;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }, []);

    // Actualizar un cliente
    const modifyClient = useCallback(async (id: string, updates: Partial<Client>) => {
        try {
            const updated = await updateClient(id, updates);
            if (updated) {
                setClients(prev =>
                    prev.map(client => client.id === id ? updated : client)
                );
            }
            return updated;
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    }, []);

    // Eliminar un cliente
    const removeClient = useCallback(async (id: string) => {
        try {
            const success = await deleteClient(id);
            if (success) {
                setClients(prev => prev.filter(client => client.id !== id));
            }
            return success;
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }, []);

    // Actualizar honorario de un cliente
    const updateClientHonorario = useCallback((
        clientId: string,
        year: number,
        month: MonthKey,
        amount: number,
        paid: boolean = false
    ) => {
        try {
            const client = clients.find(c => c.id === clientId);
            if (!client) return null;

            const updatedRecords = setHonorarioForMonth(
                client.monthlyRecords,
                year,
                month,
                amount,
                paid
            );

            return modifyClient(clientId, { monthlyRecords: updatedRecords });
        } catch (error) {
            console.error('Error updating client honorario:', error);
            throw error;
        }
    }, [clients, modifyClient]);

    // Actualizar estado de pago de un cliente
    const updateClientPaidStatus = useCallback((
        clientId: string,
        year: number,
        month: MonthKey,
        paid: boolean
    ) => {
        try {
            const client = clients.find(c => c.id === clientId);
            if (!client) return null;

            const updatedRecords = setPaidStatusForMonth(
                client.monthlyRecords,
                year,
                month,
                paid
            );

            return modifyClient(clientId, { monthlyRecords: updatedRecords });
        } catch (error) {
            console.error('Error updating paid status:', error);
            throw error;
        }
    }, [clients, modifyClient]);

    // Agregar empleado a un cliente
    const addEmployee = useCallback(async (
        clientId: string,
        employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        try {
            const updated = await addEmployeeToClient(clientId, employeeData);
            if (updated) {
                setClients(prev =>
                    prev.map(client => client.id === clientId ? updated : client)
                );
            }
            return updated;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    }, []);

    // Actualizar empleado
    const modifyEmployee = useCallback(async (
        clientId: string,
        employeeId: string,
        updates: Partial<Employee>
    ) => {
        try {
            const updated = await updateEmployee(clientId, employeeId, updates);
            if (updated) {
                setClients(prev =>
                    prev.map(client => client.id === clientId ? updated : client)
                );
            }
            return updated;
        } catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    }, []);

    // Eliminar empleado
    const removeEmployee = useCallback(async (clientId: string, employeeId: string) => {
        try {
            const success = await deleteEmployee(clientId, employeeId);
            if (success) {
                await loadClients(); // Recargar para reflejar cambios
            }
            return success;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }, [loadClients]);

    // Actualizar honorario de un empleado
    const updateEmployeeHonorario = useCallback((
        clientId: string,
        employeeId: string,
        year: number,
        month: MonthKey,
        amount: number,
        paid: boolean = false
    ) => {
        try {
            const client = clients.find(c => c.id === clientId);
            if (!client) return null;

            const employee = client.employees.find(e => e.id === employeeId);
            if (!employee) return null;

            const updatedRecords = setHonorarioForMonth(
                employee.monthlyRecords,
                year,
                month,
                amount,
                paid
            );

            return modifyEmployee(clientId, employeeId, { monthlyRecords: updatedRecords });
        } catch (error) {
            console.error('Error updating employee honorario:', error);
            throw error;
        }
    }, [clients, modifyEmployee]);

    // Actualizar estado de pago de un empleado
    const updateEmployeePaidStatus = useCallback((
        clientId: string,
        employeeId: string,
        year: number,
        month: MonthKey,
        paid: boolean
    ) => {
        try {
            const client = clients.find(c => c.id === clientId);
            if (!client) return null;

            const employee = client.employees.find(e => e.id === employeeId);
            if (!employee) return null;

            const updatedRecords = setPaidStatusForMonth(
                employee.monthlyRecords,
                year,
                month,
                paid
            );

            return modifyEmployee(clientId, employeeId, { monthlyRecords: updatedRecords });
        } catch (error) {
            console.error('Error updating employee paid status:', error);
            throw error;
        }
    }, [clients, modifyEmployee]);

    // Actualizar tareas de un cliente
    const updateClientTasks = useCallback((clientId: string, tasks: string) => {
        return modifyClient(clientId, { tasks });
    }, [modifyClient]);

    return {
        clients,
        isLoading,
        loadClients,
        addClient,
        modifyClient,
        removeClient,
        updateClientHonorario,
        updateClientPaidStatus,
        addEmployee,
        modifyEmployee,
        removeEmployee,
        updateEmployeeHonorario,
        updateEmployeePaidStatus,
        updateClientTasks
    };
};
