/**
 * Selector de meses
 * Permite navegar entre meses y años
 */

'use client';

import React from 'react';
import { MONTHS, MONTH_NAMES_ES, MonthKey } from '@/lib/types';

interface MonthSelectorProps {
  selectedYear: number;
  selectedMonth: MonthKey;
  onMonthChange: (month: MonthKey) => void;
  onYearChange: (year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onMonthChange,
  onYearChange
}) => {
  const [isYearModalOpen, setIsYearModalOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();

  // Generate year range (10 years before to 5 years after current year)
  const yearRange = Array.from(
    { length: 16 },
    (_, i) => currentYear - 10 + i
  );

  const handleYearSelect = (year: number) => {
    onYearChange(year);
    setIsYearModalOpen(false);
  };

  return (
    <>
      <div className="month-selector">
        <div className="months-container">
          {MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => onMonthChange(month)}
              className={`month-button ${selectedMonth === month ? 'active' : ''}`}
            >
              {MONTH_NAMES_ES[month]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsYearModalOpen(true)}
          className="year-display"
          aria-label="Cambiar año"
        >
          {MONTH_NAMES_ES[selectedMonth]} {selectedYear}
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Year Selection Modal */}
      {isYearModalOpen && (
        <div className="year-modal-overlay" onClick={() => setIsYearModalOpen(false)}>
          <div className="year-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="year-modal-header">
              <h3>Seleccionar Año</h3>
              <button
                onClick={() => setIsYearModalOpen(false)}
                className="year-modal-close"
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="year-grid">
              {yearRange.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`year-option ${year === selectedYear ? 'selected' : ''} ${year === currentYear ? 'current' : ''}`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        .month-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: calc(var(--radius) + 4px);
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .months-container {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .month-button {
          padding: 0.625rem 1.125rem;
          border: 1px solid hsl(var(--border) / 0.4);
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .month-button:hover:not(.active) {
          background: hsl(var(--secondary));
          border-color: hsl(var(--border));
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .month-button:active:not(.active) {
          transform: translateY(0);
        }

        .month-button.active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35), 0 0 0 1px hsl(var(--primary));
          transform: translateY(-1px);
        }

        .year-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: hsl(var(--secondary) / 0.6);
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: 8px;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .year-display:hover {
          background: hsl(var(--secondary));
          border-color: hsl(var(--border));
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .year-display:active {
          transform: translateY(0);
        }

        .year-display svg {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Year Modal Styles */
        .year-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .year-modal-content {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: calc(var(--radius) + 8px);
          max-width: 420px;
          width: 100%;
          box-shadow:
            0 24px 48px -12px rgba(0, 0, 0, 0.18),
            0 16px 32px -8px rgba(0, 0, 0, 0.12),
            0 0 1px rgba(0, 0, 0, 0.05);
          animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .year-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
        }

        .year-modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--foreground));
        }

        .year-modal-close {
          background: hsl(var(--secondary) / 0.6);
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 8px;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          padding: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .year-modal-close:hover {
          background: hsl(var(--secondary));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
          transform: scale(1.05);
        }

        .year-modal-close:active {
          transform: scale(0.98);
        }

        .year-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          padding: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .year-option {
          padding: 1rem;
          background: hsl(var(--secondary) / 0.4);
          border: 1.5px solid hsl(var(--border) / 0.4);
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: hsl(var(--foreground));
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .year-option:hover:not(.selected) {
          background: hsl(var(--secondary));
          border-color: hsl(var(--border));
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }

        .year-option:active {
          transform: translateY(0);
        }

        .year-option.current {
          border-color: hsl(var(--primary) / 0.3);
          color: hsl(var(--primary));
          font-weight: 700;
        }

        .year-option.selected {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35), 0 0 0 1px hsl(var(--primary));
          transform: translateY(-2px);
        }

        .year-option.selected::after {
          content: '✓';
          position: absolute;
          top: 0.25rem;
          right: 0.5rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .year-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.625rem;
            padding: 1.25rem;
          }

          .year-modal-content {
            max-width: 360px;
          }

          .year-option {
            padding: 0.875rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .year-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
};
