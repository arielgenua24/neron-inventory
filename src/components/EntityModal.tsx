/**
 * Modal para agregar o editar clientes y empleados
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Client, Employee } from '@/lib/types';

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
  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    arcaPassword: '',
    contact: ''
  });

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name || '',
        cuit: entity.cuit || '',
        arcaPassword: entity.arcaPassword || '',
        contact: ('contact' in entity ? entity.contact : '') || ''
      });
    } else {
      setFormData({
        name: '',
        cuit: '',
        arcaPassword: '',
        contact: ''
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
              <label htmlFor="contact">Contacto</label>
              <input
                id="contact"
                type="text"
                value={formData.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="Email o teléfono"
              />
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
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: var(--radius);
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .close-button:hover {
          background: var(--secondary);
          color: var(--foreground);
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group:last-of-type {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--foreground);
        }

        .required {
          color: var(--danger);
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.9375rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .form-group input::placeholder {
          color: var(--muted);
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .button-secondary,
        .button-primary {
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .button-secondary {
          background: var(--secondary);
          color: var(--foreground);
        }

        .button-secondary:hover {
          background: #e5e5e5;
        }

        .button-primary {
          background: var(--primary);
          color: white;
        }

        .button-primary:hover {
          background: var(--primary-hover);
        }
      `}</style>
    </div>
  );
};
