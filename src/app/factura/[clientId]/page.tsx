/**
 * Página de Factura
 * Genera y permite editar una factura para un cliente y sus empleados
 * Imprime dos copias rotadas 90° en formato paisaje A4
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Edit2, Check } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { getHonorarioForMonth } from '@/lib/honorarios-logic';
import { MonthKey } from '@/lib/types';
import { formatCUIT } from '@/lib/utils';

// Mapeo de nombres de meses en español
const MONTH_FULL_NAMES: Record<MonthKey, string> = {
  january: 'enero',
  february: 'febrero',
  march: 'marzo',
  april: 'abril',
  may: 'mayo',
  june: 'junio',
  july: 'julio',
  august: 'agosto',
  september: 'septiembre',
  october: 'octubre',
  november: 'noviembre',
  december: 'diciembre',
};

// Meses válidos para validación
const VALID_MONTHS: MonthKey[] = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export default function FacturaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const clientId = params.clientId as string;
  const year = searchParams.get('year');
  const month = searchParams.get('month') as MonthKey;

  const { clients, isLoading } = useClients();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [printContent, setPrintContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Buscar el cliente
  const client = clients.find(c => c.id === clientId);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Obtener fecha actual en formato DD/MM/YYYY
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const monthNum = String(today.getMonth() + 1).padStart(2, '0');
    const yearNum = today.getFullYear();
    return `${day}/${monthNum}/${yearNum}`;
  };

  // Generar contenido HTML de la factura
  const generateInvoiceHTML = () => {
    if (!client || !year || !month) return '';

    const monthName = MONTH_FULL_NAMES[month];
    const currentDate = getCurrentDate();
    const clientAmount = getHonorarioForMonth(client.monthlyRecords, Number(year), month);

    let employeesHTML = '';
    let employeesTotal = 0;

    if (client.employees.length > 0) {
      const employeeItems = client.employees.map(emp => {
        const amount = getHonorarioForMonth(emp.monthlyRecords, Number(year), month);
        employeesTotal += amount;
        return `<li style="margin: 0.15rem 0; display: flex; justify-content: space-between; padding: 0.25rem 0.5rem; background: hsl(var(--secondary) / 0.3); border-radius: 4px;">
          <span style="font-size: 0.9rem;">${emp.name}</span>
          <span style="font-weight: 600; font-size: 0.9rem;">${formatCurrency(amount)}</span>
        </li>`;
      }).join('');

      employeesHTML = `
        <div style="margin-bottom: 1rem;">
          <p style="font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); font-size: 0.95rem;">Empleados:</p>
          <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 0.15rem;">
            ${employeeItems}
          </ul>
        </div>
      `;
    }

    const total = clientAmount + employeesTotal;

    return `
      <div style="text-align: center; margin-bottom: 2rem; border-bottom: 3px solid hsl(var(--primary)); padding-bottom: 1rem;">
        <h1 style="font-size: 2rem; font-weight: 800; color: hsl(var(--primary)); margin: 0; letter-spacing: 0.05em;">
          FACTURA
        </h1>
      </div>

      <div style="margin-bottom: 1.5rem; background: hsl(var(--secondary)); padding: 1rem; border-radius: 8px;">
        <p style="margin: 0.25rem 0; font-size: 0.95rem;"><strong>Período:</strong> ${monthName} de ${year}</p>
        <p style="margin: 0.25rem 0; font-size: 0.95rem;"><strong>Fecha:</strong> ${currentDate}</p>
      </div>

      <div style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid hsl(var(--border)); border-radius: 8px;">
        <p style="margin: 0.25rem 0; font-size: 1rem;"><strong>Cliente:</strong> ${client.name}</p>
        <p style="margin: 0.25rem 0; font-size: 0.9rem; color: hsl(var(--muted-foreground));"><strong>CUIT:</strong> ${formatCUIT(client.cuit)}</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); text-transform: uppercase; letter-spacing: 0.02em;">
          Detalle de Honorarios
        </h2>

        <div style="margin-bottom: 1.5rem; padding: 0.75rem; background: hsl(var(--card)); border-radius: 6px;">
          <p style="display: flex; justify-content: space-between; margin: 0; font-size: 1rem;">
            <span><strong>${client.name}</strong> <span style="color: hsl(var(--muted-foreground)); font-size: 0.85rem;">(Titular)</span></span>
            <span style="font-weight: 700; color: hsl(var(--primary));">${formatCurrency(clientAmount)}</span>
          </p>
        </div>

        ${employeesHTML}
      </div>

      <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 3px double hsl(var(--border)); background: hsl(var(--primary) / 0.05); padding: 1.5rem; border-radius: 8px;">
        <p style="display: flex; justify-content: space-between; font-size: 1.5rem; font-weight: 800; margin: 0; align-items: center;">
          <span style="text-transform: uppercase; letter-spacing: 0.05em;">Total:</span>
          <span style="color: hsl(var(--primary));">${formatCurrency(total)}</span>
        </p>
      </div>
    `;
  };

  // Generar HTML compacto para impresión (sin inline styles de spacing)
  const generatePrintInvoiceHTML = () => {
    if (!client || !year || !month) return '';

    const monthName = MONTH_FULL_NAMES[month];
    const currentDate = getCurrentDate();
    const clientAmount = getHonorarioForMonth(client.monthlyRecords, Number(year), month);

    let employeesHTML = '';
    let employeesTotal = 0;

    if (client.employees.length > 0) {
      const employeeItems = client.employees.map(emp => {
        const amount = getHonorarioForMonth(emp.monthlyRecords, Number(year), month);
        employeesTotal += amount;
        return `<div class="print-line"><span>${emp.name}</span><span>${formatCurrency(amount)}</span></div>`;
      }).join('');

      employeesHTML = `
        <div class="print-employees-label">Empleados:</div>
        ${employeeItems}
      `;
    }

    const total = clientAmount + employeesTotal;

    return `
      <div class="print-header">FACTURA</div>
      <div class="print-info">
        <div><strong>Período:</strong> ${monthName} de ${year}</div>
        <div><strong>Fecha:</strong> ${currentDate}</div>
      </div>
      <div class="print-client">
        <div><strong>Cliente:</strong> ${client.name}</div>
        <div><strong>CUIT:</strong> ${formatCUIT(client.cuit)}</div>
      </div>
      <div class="print-detail">
        <div class="print-detail-title">DETALLE DE HONORARIOS</div>
        <div class="print-line print-titular"><span>${client.name} (Titular)</span><span>${formatCurrency(clientAmount)}</span></div>
        ${employeesHTML}
      </div>
      <div class="print-total">
        <span>TOTAL:</span>
        <span>${formatCurrency(total)}</span>
      </div>
    `;
  };

  // Inicializar contenido editable al cargar
  useEffect(() => {
    if (client && year && month) {
      setEditableContent(generateInvoiceHTML());
      setPrintContent(generatePrintInvoiceHTML());
    }
  }, [client, year, month]);

  // Handlers
  const handleEditToggle = () => {
    if (isEditing && contentRef.current) {
      const newContent = contentRef.current.innerHTML;
      setEditableContent(newContent);
      // También actualizar el contenido de impresión con los cambios editados
      setPrintContent(newContent);
    }
    setIsEditing(!isEditing);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.back();
  };

  // Validación de parámetros
  if (!year || !month || !VALID_MONTHS.includes(month)) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1>Parámetros inválidos</h1>
          <p>La fecha especificada no es válida.</p>
          <button onClick={handleBack} className="back-button">
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>

        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: hsl(var(--background));
            padding: 2rem;
          }

          .error-content {
            text-align: center;
            max-width: 500px;
          }

          .error-content h1 {
            font-size: 2rem;
            font-weight: 800;
            color: hsl(var(--foreground));
            margin-bottom: 1rem;
          }

          .error-content p {
            color: hsl(var(--muted-foreground));
            margin-bottom: 2rem;
          }

          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .back-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
          }
        `}</style>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando factura...</p>

        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: hsl(var(--background));
            gap: 1rem;
          }

          .loader {
            width: 48px;
            height: 48px;
            border: 4px solid hsl(var(--secondary));
            border-top-color: hsl(var(--primary));
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .loading-container p {
            color: hsl(var(--muted-foreground));
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    );
  }

  // Cliente no encontrado
  if (!client) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1>Cliente no encontrado</h1>
          <p>El cliente solicitado no existe.</p>
          <button onClick={() => router.push('/')} className="back-button">
            Volver al inicio
          </button>
        </div>

        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: hsl(var(--background));
            padding: 2rem;
          }

          .error-content {
            text-align: center;
            max-width: 500px;
          }

          .error-content h1 {
            font-size: 2rem;
            font-weight: 800;
            color: hsl(var(--foreground));
            margin-bottom: 1rem;
          }

          .error-content p {
            color: hsl(var(--muted-foreground));
            margin-bottom: 2rem;
          }

          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .back-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
          }
        `}</style>
      </div>
    );
  }

  // Render principal
  return (
    <div className="invoice-page">
      {/* Toolbar - oculto en impresión */}
      <div className="toolbar">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="toolbar-actions">
          <button onClick={handleEditToggle} className="edit-button">
            {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
            <span>{isEditing ? 'Finalizar Edición' : 'Editar'}</span>
          </button>
          <button onClick={handlePrint} className="print-button">
            <Printer size={20} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Vista de pantalla - Una factura */}
      <div className="invoice-container screen-only">
        <div
          ref={contentRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          className={`invoice-content ${isEditing ? 'editing' : ''}`}
          dangerouslySetInnerHTML={{ __html: editableContent }}
        />
      </div>

      {/* Vista de impresión - Dos facturas rotadas */}
      <div className="print-container">
        <div className="print-invoice-wrapper">
          <div
            className="print-invoice"
            dangerouslySetInnerHTML={{ __html: printContent }}
          />
        </div>
        <div className="print-invoice-wrapper">
          <div
            className="print-invoice"
            dangerouslySetInnerHTML={{ __html: printContent }}
          />
        </div>
      </div>

      <style jsx>{`
        .invoice-page {
          min-height: 100vh;
          background: hsl(var(--background));
          padding-bottom: 4rem;
        }

        /* Toolbar */
        .toolbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: hsl(var(--background) / 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid hsl(var(--border));
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-button, .edit-button, .print-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid hsl(var(--border));
          font-size: 0.9rem;
        }

        .back-button {
          background: hsl(var(--secondary));
          color: hsl(var(--foreground));
        }

        .back-button:hover {
          background: hsl(var(--secondary) / 0.8);
          transform: translateX(-2px);
        }

        .toolbar-actions {
          display: flex;
          gap: 0.75rem;
        }

        .edit-button {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
        }

        .edit-button:hover {
          background: hsl(var(--secondary));
          border-color: hsl(var(--primary));
        }

        .print-button {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }

        .print-button:hover {
          background: hsl(var(--primary) / 0.9);
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
          transform: translateY(-1px);
        }

        /* Vista de pantalla */
        .invoice-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 2rem;
        }

        .invoice-content {
          background: hsl(var(--card));
          padding: 3rem;
          border-radius: 12px;
          border: 1px solid hsl(var(--border));
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
          min-height: 600px;
          font-family: var(--font-inter), system-ui, sans-serif;
          line-height: 1.8;
        }

        .invoice-content.editing {
          border: 2px solid hsl(var(--primary));
          outline: none;
          background: hsl(var(--background));
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.1);
        }

        .invoice-content:focus {
          outline: none;
        }

        /* Ocultar vista de impresión en pantalla */
        .print-container {
          display: none;
        }

        /* Estilos de impresión */
        @media print {
          /* Ocultar toolbar y vista de pantalla */
          .toolbar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .screen-only {
            display: none !important;
          }

          /* Ocultar navbar y elementos de navegación */
          :global(nav),
          :global(header),
          :global([role="navigation"]) {
            display: none !important;
          }

          /* Ocultar chatbot y botones flotantes */
          :global(button[style*="position: fixed"]),
          :global(div[style*="position: fixed"]),
          :global(.floating-button),
          :global([class*="chat"]),
          :global([class*="Chat"]) {
            display: none !important;
          }

          /* Configurar página - A4 portrait */
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
          }

          .invoice-page {
            background: white !important;
            padding: 0;
            margin: 0;
            min-height: 0;
            width: 210mm;
            height: 297mm;
          }

          /* Contenedor de impresión - dos facturas apiladas verticalmente */
          .print-container {
            display: flex !important;
            flex-direction: column;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          /* Cada wrapper toma la mitad de la altura (148.5mm) */
          .print-invoice-wrapper {
            width: 210mm;
            height: 148.5mm;
            position: relative;
            overflow: hidden;
          }

          /* Rotar cada factura 90 grados en sentido horario */
          .print-invoice {
            position: absolute;
            width: 125mm;
            height: 205mm;
            transform: rotate(90deg);
            transform-origin: top left;
            top: 0;
            left: 144mm;
            padding: 4mm;
            font-size: 9pt;
            line-height: 1.3;
            overflow: hidden;
            box-sizing: border-box;
            background: white;
            font-family: system-ui, -apple-system, sans-serif;
          }

          /* === Estilos globales para clases del HTML de impresión === */
          /* Usamos :global() porque el HTML se inyecta con dangerouslySetInnerHTML */

          :global(.print-header) {
            font-size: 16pt;
            font-weight: 800;
            text-align: center;
            margin-bottom: 4mm;
            padding-bottom: 2mm;
            border-bottom: 0.5mm solid #000;
            letter-spacing: 0.15em;
          }

          :global(.print-info) {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3mm;
            padding: 2mm 0;
            border-bottom: 0.3mm dotted #666;
          }

          :global(.print-info div) {
            font-size: 9pt;
          }

          :global(.print-client) {
            margin-bottom: 3mm;
            padding: 2mm 0;
            border-bottom: 0.3mm dotted #666;
          }

          :global(.print-client div) {
            font-size: 9pt;
            margin: 1mm 0;
          }

          :global(.print-detail) {
            margin-bottom: 3mm;
          }

          :global(.print-detail-title) {
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #000;
          }

          :global(.print-line) {
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            padding: 1.5mm 0;
            border-bottom: 0.2mm dotted #ccc;
          }

          :global(.print-line span:last-child) {
            font-weight: 600;
          }

          :global(.print-titular) {
            font-weight: 500;
          }

          :global(.print-employees-label) {
            font-size: 9pt;
            font-weight: 600;
            margin: 3mm 0 1mm 0;
          }

          :global(.print-total) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12pt;
            font-weight: 800;
            padding: 3mm 0;
            margin-top: 4mm;
            border-top: 0.5mm solid #000;
          }

          :global(.print-total span:first-child) {
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .toolbar {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .toolbar-actions {
            justify-content: stretch;
            gap: 0.5rem;
          }

          .back-button,
          .edit-button,
          .print-button {
            flex: 1;
            justify-content: center;
          }

          .invoice-container {
            padding: 0 1rem;
          }

          .invoice-content {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
