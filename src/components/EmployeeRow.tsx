/**
 * Componente de fila de empleado
 * Muestra los datos de un empleado individual
 */

'use client';

import React, { useState } from 'react';
import { Employee, MonthKey } from '@/lib/types';
import { getHonorarioForMonth, getPaidStatusForMonth } from '@/lib/honorarios-logic';
import { formatCUIT } from '@/lib/utils';

interface EmployeeRowProps {
  employee: Employee;
  clientId: string;
  year: number;
  month: MonthKey;
  onUpdateHonorario: (
    clientId: string,
    employeeId: string,
    year: number,
    month: MonthKey,
    amount: number,
    paid: boolean
  ) => void;
  onUpdatePaidStatus: (
    clientId: string,
    employeeId: string,
    year: number,
    month: MonthKey,
    paid: boolean
  ) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (clientId: string, employeeId: string) => void;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  clientId,
  year,
  month,
  onUpdateHonorario,
  onUpdatePaidStatus,
  onEdit,
  onDelete
}) => {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editAmount, setEditAmount] = useState('');

  const amount = getHonorarioForMonth(employee.monthlyRecords, year, month);
  const isPaid = getPaidStatusForMonth(employee.monthlyRecords, year, month);

  const handleAmountClick = () => {
    setEditAmount(amount.toString());
    setIsEditingAmount(true);
  };

  const handleAmountSave = () => {
    const newAmount = parseFloat(editAmount);
    if (!isNaN(newAmount) && newAmount >= 0) {
      onUpdateHonorario(clientId, employee.id, year, month, newAmount, isPaid);
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
    onUpdatePaidStatus(clientId, employee.id, year, month, !isPaid);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="employee-row animate-fade-in">
      <div className="employee-connector">
        <div className="vertical-line"></div>
        <div className="horizontal-line"></div>
      </div>

      <div className="table-cell client-name">
        {employee.name}
      </div>

      <div className="table-cell cuit">{formatCUIT(employee.cuit)}</div>

      <div className="table-cell contact">
        <span className="arca-password">
          {employee.arcaPassword}
        </span>
      </div>

      <div className="table-cell relations">-</div>

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
            title="Click para editar"
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
          onClick={() => onEdit(employee)}
          className="action-button"
          title="Editar empleado"
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
          onClick={() => onDelete(clientId, employee.id)}
          className="action-button delete"
          title="Eliminar empleado"
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

      <style jsx>{`
        .employee-row {
          display: grid;
          grid-template-columns: 40px 1fr 150px 150px 100px 120px 100px 100px;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #fffbeb; /* Cream yellow background */
          border-bottom: 1px solid var(--border);
          gap: 1rem;
        }

        .arca-password {
          font-family: monospace;
          background: #fefce8;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #fef08a;
          color: #854d0e;
          font-weight: 500;
        }


        .employee-connector {
          width: 40px;
          height: 100%;
          position: relative;
          display: flex;
          justify-content: center;
        }

        .vertical-line {
          position: absolute;
          left: 15px;
          top: -20px; /* Se conecta con la fila superior */
          bottom: 50%;
          width: 2px;
          background: #cbd5e1;
        }

        .horizontal-line {
          position: absolute;
          left: 15px;
          top: 50%;
          width: 20px;
          height: 2px;
          background: #cbd5e1;
        }

        /* Si es el último empleado, la línea vertical se corta en la mitad */
        .employee-row:last-child .vertical-line {
          height: 50%;
          top: -20px;
          bottom: auto;
        }

        .table-cell {
          font-size: 0.875rem;
        }

        .client-name {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
        }


        .employee-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          background: var(--primary);
          color: white;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .cuit {
          color: var(--muted);
          font-family: monospace;
        }

        .password-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: var(--secondary);
          border-radius: 4px;
          cursor: help;
        }

        .amount-value {
          font-weight: 600;
          color: var(--foreground);
        }

        .amount-value.clickable {
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .amount-value.clickable:hover {
          background: var(--secondary);
        }

        .amount-input {
          width: 100%;
          padding: 0.25rem 0.5rem;
          border: 2px solid var(--primary);
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
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
          opacity: 0.8;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .action-button {
          background: none;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.375rem;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover {
          background: var(--secondary);
          border-color: var(--primary);
          color: var(--primary);
        }

        .action-button.delete:hover {
          border-color: var(--danger);
          color: var(--danger);
        }

        @media (max-width: 1200px) {
          .employee-row {
            grid-template-columns: 20px 1fr 120px 1fr;
            gap: 0.5rem;
          }

          .contact,
          .relations {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
