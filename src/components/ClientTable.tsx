/**
 * Tabla principal de clientes
 */

'use client';

import React from 'react';
import { Client, Employee, MonthKey } from '@/lib/types';
import { getPaidStatusForMonth } from '@/lib/honorarios-logic';
import { ClientRow } from './ClientRow';

interface ClientTableProps {
  clients: Client[];
  year: number;
  month: MonthKey;
  searchQuery: string;
  showUnpaidOnly: boolean;
  onUpdateHonorario: (
    clientId: string,
    year: number,
    month: MonthKey,
    amount: number,
    paid: boolean
  ) => void;
  onUpdatePaidStatus: (
    clientId: string,
    year: number,
    month: MonthKey,
    paid: boolean
  ) => void;
  onUpdateEmployeeHonorario: (
    clientId: string,
    employeeId: string,
    year: number,
    month: MonthKey,
    amount: number,
    paid: boolean
  ) => void;
  onUpdateEmployeePaidStatus: (
    clientId: string,
    employeeId: string,
    year: number,
    month: MonthKey,
    paid: boolean
  ) => void;
  onEditClient: (client: Client) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteClient: (clientId: string) => void;
  onDeleteEmployee: (clientId: string, employeeId: string) => void;
  onAddEmployee: (clientId: string) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  year,
  month,
  searchQuery,
  showUnpaidOnly,
  onUpdateHonorario,
  onUpdatePaidStatus,
  onUpdateEmployeeHonorario,
  onUpdateEmployeePaidStatus,
  onEditClient,
  onEditEmployee,
  onDeleteClient,
  onDeleteEmployee,
  onAddEmployee
}) => {

  // Filtrar clientes basado en la búsqueda
  const filteredClients = clients.filter((client) => {
    // Primero, verificar si el cliente o sus empleados deben
    const clientUnpaid = !getPaidStatusForMonth(client.monthlyRecords, year, month);
    const anyEmployeeUnpaid = client.employees.some(emp =>
      !getPaidStatusForMonth(emp.monthlyRecords, year, month)
    );

    if (showUnpaidOnly && !clientUnpaid && !anyEmployeeUnpaid) {
      return false;
    }

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const nameMatch = client.name.toLowerCase().includes(query);
    const cuitMatch = client.cuit.toLowerCase().includes(query);

    // También buscar en empleados
    const employeeMatch = client.employees.some((emp) =>
      emp.name.toLowerCase().includes(query) ||
      emp.cuit.toLowerCase().includes(query)
    );

    return nameMatch || cuitMatch || employeeMatch;
  });

  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 20V32L40 40"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>No hay clientes registrados</h3>
        <p>Comienza agregando tu primer cliente con el botón (+) de abajo</p>

        <style jsx>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            color: var(--muted);
            text-align: center;
          }

          .empty-state svg {
            margin-bottom: 1.5rem;
            opacity: 0.5;
          }

          .empty-state h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--foreground);
          }

          .empty-state p {
            font-size: 0.9375rem;
          }
        `}</style>
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <div className="empty-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M56 56L44 44M50 28C50 39.0457 41.0457 48 30 48C18.9543 48 10 39.0457 10 28C10 16.9543 18.9543 8 30 8C41.0457 8 50 16.9543 50 28Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otro término de búsqueda</p>

        <style jsx>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            color: var(--muted);
            text-align: center;
          }

          .empty-state svg {
            margin-bottom: 1.5rem;
            opacity: 0.5;
          }

          .empty-state h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--foreground);
          }

          .empty-state p {
            font-size: 0.9375rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="header-cell client-name">Cliente</div>
        <div className="header-cell cuit">CUIT</div>
        <div className="header-cell categoria-fiscal">Categoría Fiscal</div>
        <div className="header-cell relations">Relaciones</div>
        <div className="header-cell amount">Monto</div>
        <div className="header-cell status">Estado</div>
        <div className="header-cell actions">Acciones</div>
      </div>

      <div className="table-body">
        {filteredClients.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            year={year}
            month={month}
            onUpdateHonorario={onUpdateHonorario}
            onUpdatePaidStatus={onUpdatePaidStatus}
            onUpdateEmployeeHonorario={onUpdateEmployeeHonorario}
            onUpdateEmployeePaidStatus={onUpdateEmployeePaidStatus}
            onEdit={onEditClient}
            onEditEmployee={onEditEmployee}
            onDelete={onDeleteClient}
            onDeleteEmployee={onDeleteEmployee}
            onAddEmployee={onAddEmployee}
          />
        ))}
      </div>

      <style jsx>{`
        .table-container {
          background: white;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 150px 150px 100px 120px 100px 100px;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--secondary);
          border-bottom: 1px solid var(--border);
          gap: 1rem;
        }

        .header-cell {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .table-body {
          max-height: calc(100vh - 320px);
          overflow-y: auto;
        }

        @media (max-width: 1200px) {
          .table-header {
            grid-template-columns: 1fr 120px 1fr;
            gap: 0.5rem;
          }

          .categoria-fiscal,
          .relations {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
