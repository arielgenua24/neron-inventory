'use client';

import React, { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { MonthKey, Client, Employee } from '@/lib/types';
import { SearchBar } from '@/components/SearchBar';
import { MonthSelector } from '@/components/MonthSelector';
import { ClientTable } from '@/components/ClientTable';
import { EntityModal } from '@/components/EntityModal';

export default function Home() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const monthKeys: MonthKey[] = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(monthKeys[currentMonthIndex]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const {
    clients,
    isLoading,
    addClient,
    modifyClient,
    removeClient,
    updateClientHonorario,
    updateClientPaidStatus,
    addEmployee,
    modifyEmployee,
    removeEmployee,
    updateEmployeeHonorario,
    updateEmployeePaidStatus
  } = useClients();

  // Handlers para clientes
  const handleAddClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (data: any) => {
    if (editingClient) {
      modifyClient(editingClient.id, data);
    } else {
      addClient({
        ...data,
        monthlyRecords: {}
      });
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente y todos sus empleados?')) {
      removeClient(clientId);
    }
  };

  // Handlers para empleados
  const handleAddEmployee = (clientId: string) => {
    const parentClient = clients.find(c => c.id === clientId);
    if (!parentClient) return;

    setSelectedClientId(clientId);
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    // Buscar el cliente al que pertenece este empleado
    const client = clients.find(c => c.employees.some(e => e.id === employee.id));
    if (client) {
      setSelectedClientId(client.id);
      setEditingEmployee(employee);
      setIsEmployeeModalOpen(true);
    }
  };

  const handleSaveEmployee = (data: any) => {
    if (!selectedClientId) return;

    if (editingEmployee) {
      modifyEmployee(selectedClientId, editingEmployee.id, data);
    } else {
      addEmployee(selectedClientId, {
        ...data,
        monthlyRecords: {}
      });
    }
  };

  const handleDeleteEmployee = (clientId: string, employeeId: string) => {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      removeEmployee(clientId, employeeId);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando...</p>

        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }

          .loader {
            width: 48px;
            height: 48px;
            border: 4px solid var(--secondary);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          p {
            color: var(--muted);
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="main-container">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Nerón Inventory</h1>
          <p className="subtitle">Sistema de tracking de honorarios</p>
        </div>
      </header>

      <div className="content">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <MonthSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        <div className="filters-container">
          <button
            onClick={() => setShowUnpaidOnly(!showUnpaidOnly)}
            className={`unpaid-filter-button ${showUnpaidOnly ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {showUnpaidOnly ? 'Mostrando solo deudores' : 'Filtrar por deudores'}
          </button>
        </div>

        <ClientTable
          clients={clients}
          year={selectedYear}
          month={selectedMonth}
          searchQuery={searchQuery}
          showUnpaidOnly={showUnpaidOnly}
          onUpdateHonorario={updateClientHonorario}
          onUpdatePaidStatus={updateClientPaidStatus}
          onUpdateEmployeeHonorario={updateEmployeeHonorario}
          onUpdateEmployeePaidStatus={updateEmployeePaidStatus}
          onEditClient={handleEditClient}
          onEditEmployee={handleEditEmployee}
          onDeleteClient={handleDeleteClient}
          onDeleteEmployee={handleDeleteEmployee}
          onAddEmployee={handleAddEmployee}
        />
      </div>

      <button onClick={handleAddClient} className="floating-button" aria-label="Agregar cliente">
        +
      </button>

      <EntityModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        entity={editingClient}
        type="client"
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
      />

      <EntityModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        entity={editingEmployee}
        type="employee"
        title={
          editingEmployee
            ? 'Editar Empleado'
            : `AGREGA UN EMPLEADO DE ${clients.find(c => c.id === selectedClientId)?.name.toUpperCase() || ''}`
        }
      />

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          background: #f9fafb;
          padding-bottom: 5rem;
        }

        .header {
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 2rem 0;
          margin-bottom: 2rem;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: var(--foreground);
          background: linear-gradient(135deg, var(--primary) 0%, #0052cc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          margin: 0.5rem 0 0;
          color: var(--muted);
          font-size: 0.9375rem;
        }

        .filters-container {
          max-width: 1400px;
          margin: 1.5rem auto 1rem;
          display: flex;
          justify-content: flex-end;
        }

        .unpaid-filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .unpaid-filter-button:hover {
          background: var(--secondary);
          color: var(--foreground);
        }

        .unpaid-filter-button.active {
          background: #fee2e2;
          border-color: #ef4444;
          color: #b91c1c;
        }

        .content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }


        @media (max-width: 768px) {
          .header-content,
          .content {
            padding: 0 1rem;
          }

          .title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
