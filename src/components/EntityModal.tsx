/**
 * Modal para agregar o editar clientes y empleados
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Client, Employee, TaxCategory } from '@/lib/types';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  entity: Client | Employee | null;
  type: 'client' | 'employee';
  title: string;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entity,
  type,
  title
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    cuit: string;
    arcaPassword: string;
    categoriaFiscal: TaxCategory | '';
  }>({
    name: '',
    cuit: '',
    arcaPassword: '',
    categoriaFiscal: ''
  });

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name || '',
        cuit: entity.cuit || '',
        arcaPassword: entity.arcaPassword || '',
        categoriaFiscal: ('categoriaFiscal' in entity ? entity.categoriaFiscal : '') || ''
      });
    } else {
      setFormData({
        name: '',
        cuit: '',
        arcaPassword: '',
        categoriaFiscal: ''
      });
    }
  }, [entity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!formData.cuit.trim()) {
      alert('El CUIT es requerido');
      return;
    }
    if (!formData.arcaPassword.trim()) {
      alert('La contraseña ARCA es requerida');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    let finalValue = value;
    if (field === 'cuit') {
      // Limpiar y formatear CUIT
      const clean = value.replace(/\D/g, '').substring(0, 11);
      if (clean.length > 10) {
        finalValue = `${clean.substring(0, 2)}-${clean.substring(2, 10)}-${clean.substring(10)}`;
      } else if (clean.length > 2) {
        finalValue = `${clean.substring(0, 2)}-${clean.substring(2)}`;
      } else {
        finalValue = clean;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">
              Nombre <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={type === 'client' ? 'Nombre del cliente' : 'Nombre del empleado'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cuit">
              CUIT <span className="required">*</span>
            </label>
            <input
              id="cuit"
              type="text"
              value={formData.cuit}
              onChange={(e) => handleChange('cuit', e.target.value)}
              placeholder="20-43777061-0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="arcaPassword">
              Contraseña ARCA <span className="required">*</span>
            </label>
            <input
              id="arcaPassword"
              type="text"
              value={formData.arcaPassword}
              onChange={(e) => handleChange('arcaPassword', e.target.value)}
              placeholder="Ingrese la contraseña"
              required
            />
          </div>

          {type === 'client' && (
            <div className="form-group">
              <label htmlFor="categoriaFiscal">Categoría Fiscal</label>
              <select
                id="categoriaFiscal"
                value={formData.categoriaFiscal}
                onChange={(e) => handleChange('categoriaFiscal', e.target.value as TaxCategory)}
                className="select-input"
              >
                <option value="">Seleccionar categoría</option>
                <option value="Monotributista">Monotributista</option>
                <option value="Resp. inscripto">Resp. inscripto</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="button-secondary">
              Cancelar
            </button>
            <button type="submit" className="button-primary">
              {entity ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
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

        .modal-content {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: calc(var(--radius) + 8px);
          max-width: 520px;
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

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.75rem 1.75rem 1.25rem;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--foreground));
        }

        .close-button {
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

        .close-button:hover {
          background: hsl(var(--secondary));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
          transform: scale(1.05);
        }

        .close-button:active {
          transform: scale(0.98);
        }

        .modal-form {
          padding: 1.75rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group:last-of-type {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.8125rem;
          letter-spacing: -0.01em;
          color: hsl(var(--foreground));
        }

        .required {
          color: hsl(var(--destructive));
        }

        .form-group input,
        .form-group .select-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1.5px solid hsl(var(--border) / 0.5);
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 500;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .form-group input:hover,
        .form-group .select-input:hover {
          border-color: hsl(var(--border));
        }

        .form-group input:focus,
        .form-group .select-input:focus {
          outline: none;
          border-color: hsl(var(--primary));
          background: hsl(var(--card));
          box-shadow:
            0 0 0 3.5px hsl(var(--primary) / 0.12),
            0 2px 4px rgba(0, 0, 0, 0.04);
          transform: translateY(-1px);
        }

        .form-group input::placeholder {
          color: hsl(var(--muted-foreground) / 0.5);
          font-weight: 400;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.75rem;
          border-top: 1px solid hsl(var(--border) / 0.5);
        }

        .button-secondary,
        .button-primary {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          border: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .button-secondary {
          background: hsl(var(--secondary));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border) / 0.4);
        }

        .button-secondary:hover {
          background: hsl(var(--secondary) / 0.8);
          border-color: hsl(var(--border));
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .button-secondary:active {
          transform: translateY(0);
        }

        .button-primary {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          box-shadow: 0 2px 8px hsl(var(--primary) / 0.25);
        }

        .button-primary:hover {
          background: hsl(var(--primary) / 0.9);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.35);
        }

        .button-primary:active {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .modal-header {
            padding: 1.5rem 1.25rem 1rem;
          }

          .modal-form {
            padding: 1.5rem 1.25rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .button-secondary,
          .button-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
