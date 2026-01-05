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
  const handlePrevYear = () => {
    onYearChange(selectedYear - 1);
  };

  const handleNextYear = () => {
    onYearChange(selectedYear + 1);
  };

  return (
    <div className="month-selector">
      <button
        onClick={handlePrevYear}
        className="year-nav-button"
        aria-label="Año anterior"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 16l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

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
        onClick={handleNextYear}
        className="year-nav-button"
        aria-label="Año siguiente"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 4l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="year-display">{MONTH_NAMES_ES[selectedMonth]} {selectedYear}</div>


      <style jsx>{`
        .month-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 0.5rem;
          background: var(--secondary);
          border-radius: var(--radius);
          position: relative;
        }

        .year-nav-button {
          background: white;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--foreground);
          flex-shrink: 0;
        }

        .year-nav-button:hover {
          background: var(--secondary);
          border-color: var(--primary);
        }

        .months-container {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .month-button {
          padding: 0.5rem 1rem;
          border: none;
          background: white;
          color: var(--foreground);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .month-button:hover {
          background: var(--primary);
          color: white;
        }

        .month-button.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 4px rgba(0, 102, 255, 0.2);
        }

        .year-display {
          position: absolute;
          bottom: -1.75rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.875rem;
          color: var(--muted);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .month-selector {
            flex-direction: column;
            align-items: stretch;
          }

          .months-container {
            order: 1;
          }

          .year-nav-button {
            width: 100%;
          }

          .year-display {
            position: static;
            transform: none;
            text-align: center;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
