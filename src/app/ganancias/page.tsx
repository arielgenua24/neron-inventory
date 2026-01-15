'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useClients } from '@/hooks/useClients';
import { MonthKey, MONTHS, MONTH_NAMES_ES } from '@/lib/types';
import { getHonorarioForMonth, getPaidStatusForMonth } from '@/lib/honorarios-logic';

const MONTH_FULL_NAMES: Record<MonthKey, string> = {
  january: 'Enero',
  february: 'Febrero',
  march: 'Marzo',
  april: 'Abril',
  may: 'Mayo',
  june: 'Junio',
  july: 'Julio',
  august: 'Agosto',
  september: 'Septiembre',
  october: 'Octubre',
  november: 'Noviembre',
  december: 'Diciembre',
};

// Apple-inspired colors
const COLORS = {
  appleBlue: '#007AFF',
  appleGreen: '#34C759',
  appleOrange: '#FF9500',
  appleRed: '#FF3B30',
  appleGray: '#8E8E93',
  appleGray2: '#C7C7CC',
  appleLightGray: '#F2F2F7',
  appleWhite: '#FFFFFF',
};

interface MonthlyEarnings {
  month: MonthKey;
  total: number;
  paid: number;
  unpaid: number;
  clientCount: number;
  employeeCount: number;
  paymentRate: number;
}

export default function GananciasPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(MONTHS[currentMonthIndex]);
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);

  const { clients, isLoading } = useClients();

  // Calculate monthly earnings for the selected year
  const monthlyData = useMemo<MonthlyEarnings[]>(() => {
    return MONTHS.map(month => {
      let total = 0;
      let paid = 0;
      let unpaid = 0;
      let clientCount = 0;
      let employeeCount = 0;

      clients.forEach(client => {
        const clientAmount = getHonorarioForMonth(client.monthlyRecords, selectedYear, month);
        const clientPaid = getPaidStatusForMonth(client.monthlyRecords, selectedYear, month);

        if (clientAmount > 0) {
          total += clientAmount;
          clientCount++;
          if (clientPaid) {
            paid += clientAmount;
          } else {
            unpaid += clientAmount;
          }
        }

        client.employees.forEach(employee => {
          const empAmount = getHonorarioForMonth(employee.monthlyRecords, selectedYear, month);
          const empPaid = getPaidStatusForMonth(employee.monthlyRecords, selectedYear, month);

          if (empAmount > 0) {
            total += empAmount;
            employeeCount++;
            if (empPaid) {
              paid += empAmount;
            } else {
              unpaid += empAmount;
            }
          }
        });
      });

      const paymentRate = total > 0 ? (paid / total) * 100 : 0;

      return {
        month,
        total,
        paid,
        unpaid,
        clientCount,
        employeeCount,
        paymentRate
      };
    });
  }, [clients, selectedYear]);

  // Current month data
  const currentMonthData = monthlyData.find(m => m.month === selectedMonth) || monthlyData[0];

  // Yearly totals
  const yearlyStats = useMemo(() => {
    const total = monthlyData.reduce((sum, m) => sum + m.total, 0);
    const paid = monthlyData.reduce((sum, m) => sum + m.paid, 0);
    const unpaid = monthlyData.reduce((sum, m) => sum + m.unpaid, 0);
    const avgMonthly = total / 12;
    const paymentRate = total > 0 ? (paid / total) * 100 : 0;

    return { total, paid, unpaid, avgMonthly, paymentRate };
  }, [monthlyData]);

  // Data for charts
  const yearlyChartData = monthlyData.map(m => ({
    name: MONTH_NAMES_ES[m.month],
    total: m.total,
    cobrado: m.paid,
    pendiente: m.unpaid,
  }));

  const pieChartData = [
    { name: 'Cobrado', value: currentMonthData.paid, color: COLORS.appleGreen },
    { name: 'Pendiente', value: currentMonthData.unpaid, color: COLORS.appleOrange },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handlePreviousMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex === 0) {
      setSelectedMonth('december');
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(MONTHS[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex === 11) {
      setSelectedMonth('january');
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(MONTHS[currentIndex + 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  return (
    <div className="ganancias-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-icon">
          <TrendingUp size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h1>Ganancias</h1>
          <p className="subtitle">Análisis financiero inteligente</p>
        </div>
      </div>

      {/* Year Summary Card - Always visible */}
      <motion.div
        className="summary-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="summary-header">
          <div className="summary-title">
            <Calendar size={20} />
            <h2>Resumen Anual {selectedYear}</h2>
          </div>
          <div className="year-controls">
            <button onClick={() => setSelectedYear(selectedYear - 1)} className="year-btn">
              <ChevronLeft size={18} />
            </button>
            <span className="year-label">{selectedYear}</span>
            <button onClick={() => setSelectedYear(selectedYear + 1)} className="year-btn">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-stat">
            <p className="stat-label">Ingresos Totales</p>
            <h3 className="stat-value primary">{formatCurrency(yearlyStats.total)}</h3>
            <p className="stat-sub">Promedio: {formatCurrency(yearlyStats.avgMonthly)}/mes</p>
          </div>

          <div className="summary-stat">
            <p className="stat-label">Cobrado</p>
            <h3 className="stat-value success">{formatCurrency(yearlyStats.paid)}</h3>
            <p className="stat-sub">{formatPercent(yearlyStats.paymentRate)}</p>
          </div>

          <div className="summary-stat">
            <p className="stat-label">Pendiente</p>
            <h3 className="stat-value warning">{formatCurrency(yearlyStats.unpaid)}</h3>
            <p className="stat-sub">{formatPercent(100 - yearlyStats.paymentRate)}</p>
          </div>

          <div className="summary-stat">
            <p className="stat-label">Clientes Activos</p>
            <h3 className="stat-value info">{clients.length}</h3>
            <p className="stat-sub">{clients.reduce((s, c) => s + c.employees.length, 0)} empleados</p>
          </div>
        </div>

        {/* Yearly Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <BarChart3 size={18} />
            <h3>Evolución Anual</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={yearlyChartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.appleBlue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.appleBlue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.appleGreen} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.appleGreen} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
              <XAxis dataKey="name" stroke={COLORS.appleGray} fontSize={12} />
              <YAxis stroke={COLORS.appleGray} fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E5EA',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke={COLORS.appleBlue}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="cobrado"
                stroke={COLORS.appleGreen}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCobrado)"
                name="Cobrado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Month Selector */}
      <div className="month-selector-section">
        <motion.button
          className="month-selector-button"
          onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="month-selector-content">
            <div className="month-nav-btn" onClick={(e) => { e.stopPropagation(); handlePreviousMonth(); }}>
              <ChevronLeft size={20} />
            </div>
            <div className="month-display">
              <span className="month-name">{MONTH_FULL_NAMES[selectedMonth]}</span>
              <span className="month-year">{selectedYear}</span>
            </div>
            <div className="month-nav-btn" onClick={(e) => { e.stopPropagation(); handleNextMonth(); }}>
              <ChevronRight size={20} />
            </div>
          </div>
        </motion.button>

        {/* Month Grid Selector */}
        <AnimatePresence>
          {isMonthSelectorOpen && (
            <motion.div
              className="month-grid-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMonthSelectorOpen(false)}
            >
              <motion.div
                className="month-grid-popup"
                initial={{ scale: 0.9, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Seleccionar Mes</h3>
                <div className="month-grid">
                  {MONTHS.map((month) => (
                    <button
                      key={month}
                      className={`month-option ${selectedMonth === month ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedMonth(month);
                        setIsMonthSelectorOpen(false);
                      }}
                    >
                      {MONTH_NAMES_ES[month]}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Month Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedMonth}-${selectedYear}`}
          className="month-detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          {/* Month Stats Cards */}
          <div className="month-stats-grid">
            <div className="stat-card primary">
              <div className="stat-card-icon">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="stat-card-label">Total del Mes</p>
                <h3 className="stat-card-value">{formatCurrency(currentMonthData.total)}</h3>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-card-icon">
                <Activity size={24} />
              </div>
              <div>
                <p className="stat-card-label">Cobrado</p>
                <h3 className="stat-card-value">{formatCurrency(currentMonthData.paid)}</h3>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-card-icon">
                <PieChartIcon size={24} />
              </div>
              <div>
                <p className="stat-card-label">Pendiente</p>
                <h3 className="stat-card-value">{formatCurrency(currentMonthData.unpaid)}</h3>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-card-icon">
                <Users size={24} />
              </div>
              <div>
                <p className="stat-card-label">Contribuyentes</p>
                <h3 className="stat-card-value">
                  {currentMonthData.clientCount + currentMonthData.employeeCount}
                </h3>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Payment Distribution Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <PieChartIcon size={18} />
                <h3>Distribución de Pagos</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-summary">
                <div className="summary-item">
                  <div className="summary-dot" style={{ backgroundColor: COLORS.appleGreen }} />
                  <span>Tasa de cobro: {formatPercent(currentMonthData.paymentRate)}</span>
                </div>
              </div>
            </div>

            {/* Breakdown Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <BarChart3 size={18} />
                <h3>Desglose por Tipo</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Clientes',
                      cantidad: currentMonthData.clientCount,
                    },
                    {
                      name: 'Empleados',
                      cantidad: currentMonthData.employeeCount,
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                  <XAxis dataKey="name" stroke={COLORS.appleGray} />
                  <YAxis stroke={COLORS.appleGray} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E5EA',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="cantidad" fill={COLORS.appleBlue} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="chart-summary">
                <div className="summary-item">
                  <span>Total: {currentMonthData.clientCount} clientes + {currentMonthData.employeeCount} empleados</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .ganancias-page {
          min-height: 100vh;
          background: #f1f1f1;
          padding: 2rem;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: #f1f1f1;
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid #E5E5EA;
          border-top-color: ${COLORS.appleBlue};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Header */
        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 0.5rem;
          margin-bottom: 2rem;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: ${COLORS.appleBlue};
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1D1D1F;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: ${COLORS.appleGray};
          font-size: 1rem;
          margin: 0.25rem 0 0 0;
        }

        /* Summary Card */
        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #E5E5EA;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .summary-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1D1D1F;
        }

        .summary-title h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .year-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .year-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #E5E5EA;
          background: white;
          color: ${COLORS.appleBlue};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .year-btn:hover {
          background: ${COLORS.appleLightGray};
        }

        .year-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1D1D1F;
          padding: 0 1rem;
        }

        /* Summary Grid */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-stat {
          text-align: center;
          padding: 1.5rem;
          background: ${COLORS.appleLightGray};
          border-radius: 16px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: ${COLORS.appleGray};
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .stat-value.primary { color: ${COLORS.appleBlue}; }
        .stat-value.success { color: ${COLORS.appleGreen}; }
        .stat-value.warning { color: ${COLORS.appleOrange}; }
        .stat-value.info { color: #5856D6; }

        .stat-sub {
          font-size: 0.875rem;
          color: ${COLORS.appleGray};
          margin: 0;
        }

        /* Chart Section */
        .chart-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #E5E5EA;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: #1D1D1F;
        }

        .chart-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        /* Month Selector */
        .month-selector-section {
          margin-bottom: 2rem;
          position: relative;
        }

        .month-selector-button {
          width: 100%;
          background: white;
          border: 1px solid #E5E5EA;
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .month-selector-button:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .month-selector-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .month-display {
          text-align: center;
          flex: 1;
        }

        .month-name {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #1D1D1F;
          letter-spacing: -0.02em;
        }

        .month-year {
          font-size: 1rem;
          color: ${COLORS.appleGray};
          font-weight: 500;
        }

        .month-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: ${COLORS.appleLightGray};
          color: ${COLORS.appleBlue};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .month-nav-btn:hover {
          background: #E5E5EA;
        }

        /* Month Grid Popup */
        .month-grid-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .month-grid-popup {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .month-grid-popup h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1D1D1F;
          margin: 0 0 1.5rem 0;
          text-align: center;
        }

        .month-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .month-option {
          padding: 1rem;
          background: ${COLORS.appleLightGray};
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #1D1D1F;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .month-option:hover {
          background: #E5E5EA;
          transform: translateY(-2px);
        }

        .month-option.active {
          background: ${COLORS.appleBlue};
          color: white;
          border-color: ${COLORS.appleBlue};
        }

        /* Month Detail */
        .month-detail {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Month Stats Grid */
        .month-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #E5E5EA;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .stat-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card.primary .stat-card-icon {
          background: rgba(0, 122, 255, 0.1);
          color: ${COLORS.appleBlue};
        }

        .stat-card.success .stat-card-icon {
          background: rgba(52, 199, 89, 0.1);
          color: ${COLORS.appleGreen};
        }

        .stat-card.warning .stat-card-icon {
          background: rgba(255, 149, 0, 0.1);
          color: ${COLORS.appleOrange};
        }

        .stat-card.info .stat-card-icon {
          background: rgba(88, 86, 214, 0.1);
          color: #5856D6;
        }

        .stat-card-label {
          font-size: 0.875rem;
          color: ${COLORS.appleGray};
          margin: 0 0 0.25rem 0;
          font-weight: 500;
        }

        .stat-card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1D1D1F;
          margin: 0;
          letter-spacing: -0.02em;
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #E5E5EA;
        }

        .chart-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: #1D1D1F;
        }

        .chart-card-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .chart-summary {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #E5E5EA;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: ${COLORS.appleGray};
        }

        .summary-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ganancias-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .summary-card {
            padding: 1.5rem;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .month-stats-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .month-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
