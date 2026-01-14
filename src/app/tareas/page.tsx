'use client';

import React, { useState, useEffect } from 'react';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hash, Lock, Plus, Search, Trash2, FileText } from 'lucide-react';

export default function TareasPage() {
    const { clients, isLoading, updateClientTasks } = useClients();
    const [activeClient, setActiveClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [localTasks, setLocalTasks] = useState('');

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cuit.includes(searchTerm)
    );

    useEffect(() => {
        if (activeClient) {
            setLocalTasks(activeClient.tasks || '');
        }
    }, [activeClient]);

    const handleSaveTasks = () => {
        if (activeClient) {
            updateClientTasks(activeClient.id, localTasks);
        }
    };

    const handleDragStart = (e: React.DragEvent, client: Client) => {
        e.dataTransfer.setData('clientId', client.id);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const clientId = e.dataTransfer.getData('clientId');
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setActiveClient(client);
        }
    };

    if (isLoading) return <div className="loading">Cargando clientes...</div>;

    return (
        <div className="tareas-layout">
            <aside className="clients-sidebar">
                <div className="sidebar-header">
                    <h2>Clientes</h2>
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="clients-list">
                    {filteredClients.map(client => (
                        <motion.div
                            key={client.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e as any, client)}
                            onClick={() => setActiveClient(client)}
                            className={`client-card ${activeClient?.id === client.id ? 'active' : ''}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="client-info">
                                <span className="name">{client.name}</span>
                                <span className="cuit">{client.cuit}</span>
                            </div>
                            <div className="drag-handle">⋮⋮</div>
                        </motion.div>
                    ))}
                </div>
            </aside>

            <main
                className="canvas-area"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <AnimatePresence mode="wait">
                    {activeClient ? (
                        <motion.div
                            key={activeClient.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="canvas-content"
                        >
                            <header className="canvas-header">
                                <div className="header-info">
                                    <h1>{activeClient.name}</h1>
                                    <div className="meta-chips">
                                        <span className="chip"><Hash size={12} /> {activeClient.cuit}</span>
                                        <span className="chip"><Lock size={12} /> {activeClient.arcaPassword}</span>
                                    </div>
                                </div>
                                <button className="save-button" onClick={handleSaveTasks}>
                                    Guardar Cambios
                                </button>
                            </header>

                            <div className="editor-container">
                                <textarea
                                    placeholder="Escribe aquí las tareas para este cliente..."
                                    value={localTasks}
                                    onChange={(e) => setLocalTasks(e.target.value)}
                                    className="free-canvas"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="empty-state">
                            <div className="drop-target">
                                <Plus size={48} />
                                <p>Arrastra un cliente aquí para empezar a trabajar</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <style jsx>{`
        .tareas-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - 64px);
          background: #f5f5f7;
        }

        .clients-sidebar {
          background: white;
          border-right: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1d1d1f;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f2f2f7;
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          color: #86868b;
        }

        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.875rem;
        }

        .clients-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .client-card {
          padding: 1rem;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .client-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }

        .client-card.active {
          background: #f2f2f7;
          border-color: #0071e3;
        }

        .client-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .name {
          font-weight: 600;
          color: #1d1d1f;
          font-size: 0.9375rem;
        }

        .cuit {
          font-size: 0.75rem;
          color: #86868b;
        }

        .drag-handle {
          color: #c7c7cc;
          cursor: grab;
        }

        .canvas-area {
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .canvas-content {
          background: white;
          border-radius: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .canvas-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-info h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
          color: #1d1d1f;
        }

        .meta-chips {
          display: flex;
          gap: 0.75rem;
        }

        .chip {
          background: #f2f2f7;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #48484a;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .save-button {
          background: #0071e3;
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 980px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .save-button:hover {
          transform: scale(1.02);
          background: #0077ed;
        }

        .editor-container {
          flex: 1;
          padding: 2rem;
        }

        .free-canvas {
          width: 100%;
          height: 100%;
          border: none;
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 1.125rem;
          line-height: 1.6;
          color: #1d1d1f;
        }

        .empty-state {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-target {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 4rem;
          border: 3px dashed rgba(0, 0, 0, 0.05);
          border-radius: 32px;
          color: #86868b;
          max-width: 400px;
          text-align: center;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 1.25rem;
          color: #86868b;
        }

        @media (max-width: 1024px) {
          .tareas-layout {
            grid-template-columns: 280px 1fr;
          }
        }
      `}</style>
        </div>
    );
}
