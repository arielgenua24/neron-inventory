/**
 * Componente de fila de cliente
 * Muestra los datos del cliente y sus empleados (siempre visibles)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Client, Employee, MonthKey } from '@/lib/types';
import { getHonorarioForMonth, getPaidStatusForMonth } from '@/lib/honorarios-logic';
import { EmployeeRow } from './EmployeeRow';
import { formatCUIT } from '@/lib/utils';

interface ClientRowProps {
  client: Client;
  year: number;
  month: MonthKey;
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
  onEdit: (client: Client) => void;
  onEditEmployee: (employee: Employee) => void;
  onDelete: (clientId: string) => void;
  onDeleteEmployee: (clientId: string, employeeId: string) => void;
  onAddEmployee: (clientId: string) => void;
}

export const ClientRow: React.FC<ClientRowProps> = ({
  client,
  year,
  month,
  onUpdateHonorario,
  onUpdatePaidStatus,
  onUpdateEmployeeHonorario,
  onUpdateEmployeePaidStatus,
  onEdit,
  onEditEmployee,
  onDelete,
  onDeleteEmployee,
  onAddEmployee
}) => {
  const router = useRouter();
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editAmount, setEditAmount] = useState('');

  const amount = getHonorarioForMonth(client.monthlyRecords, year, month);
  const isPaid = getPaidStatusForMonth(client.monthlyRecords, year, month);
  const hasEmployees = client.employees.length > 0;

  // Verificar si algún empleado no ha pagado
  const anyEmployeeUnpaid = client.employees.some(emp =>
    !getPaidStatusForMonth(emp.monthlyRecords, year, month)
  );

  // Mostrar mensaje solo si el cliente pagó pero un empleado no
  const showUnpaidWarning = isPaid && anyEmployeeUnpaid;

  const handleAmountClick = () => {
    setEditAmount(amount.toString());
    setIsEditingAmount(true);
  };

  const handleAmountSave = () => {
    const newAmount = parseFloat(editAmount);
    if (!isNaN(newAmount) && newAmount >= 0) {
      onUpdateHonorario(client.id, year, month, newAmount, isPaid);
    }
    setIsEditingAmount(false);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAmountSave();
    } else if (e.key === 'Escape') {
      setIsEditingAmount(false);
    }
  };

  const handlePaidToggle = () => {
    onUpdatePaidStatus(client.id, year, month, !isPaid);
  };

  const handleInvoiceClick = () => {
    router.push(`/factura/${client.id}?year=${year}&month=${month}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="client-group animate-fade-in">
      <div className="client-row">
        <div className="table-cell client-name">
          <span className="name-text">{client.name}</span>
          <button
            onClick={() => onAddEmployee(client.id)}
            className="inline-add-button"
            title={`Agregar empleado a ${client.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3.333v9.334M3.333 8h9.334"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {showUnpaidWarning && (
            <div className="unpaid-warning-tag animate-fade-in">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Alguien pendiente en la relación</span>
            </div>
          )}
        </div>

        <div className="table-cell cuit">{formatCUIT(client.cuit)}</div>

        <div className="table-cell arca-pass">
          <span className="arca-password-text">
            {client.arcaPassword}
          </span>
        </div>

        <div className="table-cell relations">
          {hasEmployees ? (
            <span className="employee-count">
              {client.employees.length} emp.
            </span>
          ) : (
            <span className="no-employees">-</span>
          )}
        </div>

        <div className="table-cell amount">
          {isEditingAmount ? (
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              onBlur={handleAmountSave}
              onKeyDown={handleAmountKeyDown}
              className="amount-input"
              autoFocus
            />
          ) : (
            <span
              onClick={handleAmountClick}
              className="amount-value clickable"
            >
              {formatCurrency(amount)}
            </span>
          )}
        </div>

        <div className="table-cell status">
          <button
            onClick={handlePaidToggle}
            className={`status-badge ${isPaid ? 'paid' : 'unpaid'}`}
          >
            {isPaid ? 'Pagado' : 'Pendiente'}
          </button>
        </div>

        <div className="table-cell actions">
          <button
            onClick={handleInvoiceClick}
            className="action-button"
            title="Generar Factura"
          >
            <FileText width={16} height={16} />
          </button>
          <button
            onClick={() => onEdit(client)}
            className="action-button"
            title="Editar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="action-button delete"
            title="Eliminar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {hasEmployees && (
        <div className="employees-container">
          {client.employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              clientId={client.id}
              year={year}
              month={month}
              onUpdateHonorario={onUpdateEmployeeHonorario}
              onUpdatePaidStatus={onUpdateEmployeePaidStatus}
              onEdit={onEditEmployee}
              onDelete={onDeleteEmployee}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .client-group {
          border-bottom: 2px solid #f1f5f9;
        }

        .client-row {
          display: grid;
          grid-template-columns: 1fr 150px 150px 100px 120px 100px 100px;
          align-items: center;
          padding: 1rem;
          background: white;
          gap: 1rem;
        }

        .table-cell {
          font-size: 0.875rem;
        }

        .client-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .name-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 250px;
        }

        .inline-add-button {
          background: #f1f5f9;
          border: none;
          color: #64748b;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .inline-add-button:hover {
          background: var(--primary);
          color: white;
          transform: scale(1.1);
        }

        .unpaid-warning-tag {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #fff1f2;
          color: #e11d48;
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          border: 1px solid #fda4af;
          font-weight: 600;
        }

        .cuit {
          color: #64748b;
          font-family: monospace;
          font-weight: 600;
        }

        .arca-password-text {
          font-family: monospace;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: #334155;
          font-weight: 600;
        }

        .employee-count {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .amount-value {
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .amount-value:hover {
          background: #f1f5f9;
        }

        .amount-input {
          width: 100%;
          padding: 0.25rem 0.5rem;
          border: 2px solid var(--primary);
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-badge.paid {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.unpaid {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-badge:hover {
          transform: translateY(-1px);
          filter: brightness(0.95);
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .action-button {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.4rem;
          cursor: pointer;
          color: #64748b;
        }

        .action-button:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: #eff6ff;
        }

        .action-button.delete:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: #fef2f2;
        }

        .employees-container {
          padding-left: 0;
        }
      `}</style>
    </div>
  );
};
