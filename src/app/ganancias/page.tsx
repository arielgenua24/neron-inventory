'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Rocket } from 'lucide-react';

export default function GananciasPage() {
    return (
        <div className="ganancias-container">
            <motion.div
                className="hero-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="icon-3d-wrapper">
                    <div className="icon-3d">
                        <TrendingUp size={64} />
                    </div>
                    <motion.div
                        className="sparkle s1"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Sparkles size={24} />
                    </motion.div>
                    <motion.div
                        className="sparkle s2"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                    >
                        <Rocket size={20} />
                    </motion.div>
                </div>

                <h1 className="title">Ganancias Inteligentes</h1>
                <p className="description">
                    Estamos preparando una experiencia revolucionaria para analizar tus ingresos y optimizar tu rentabilidad con IA.
                </p>

                <div className="status-badge">Próximamente</div>
            </motion.div>

            <div className="features-grid">
                {[
                    { title: 'Análisis Predictivo', desc: 'Anticipa tus ingresos del próximo mes.' },
                    { title: 'Optimización de Tasas', desc: 'Sugiere ajustes basados en el mercado.' },
                    { title: 'Reportes Premium', desc: 'Diseños de exportación estilo Apple.' },
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        className="feature-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                    >
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            <style jsx>{`
        .ganancias-container {
          min-height: calc(100vh - 64px);
          background: #000;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          overflow: hidden;
          position: relative;
        }

        .ganancias-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(52, 168, 83, 0.15) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          filter: blur(80px);
        }

        .hero-section {
          text-align: center;
          max-width: 600px;
          margin-bottom: 4rem;
          position: relative;
          z-index: 1;
        }

        .icon-3d-wrapper {
          position: relative;
          width: fit-content;
          margin: 0 auto 3rem;
        }

        .icon-3d {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #34A853 0%, #1e7e34 100%);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(52, 168, 83, 0.3),
                      inset 0 2px 2px rgba(255, 255, 255, 0.4);
          transform: perspective(1000px) rotateX(15deg) rotateY(-10deg);
          color: white;
        }

        .sparkle {
          position: absolute;
          color: #34A853;
        }

        .s1 { top: -20px; right: -20px; color: #FBBC05; }
        .s2 { bottom: -10px; left: -30px; color: #4285F4; }

        .title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 1.5rem;
          background: linear-gradient(to bottom, #fff 0%, #a1a1a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .description {
          font-size: 1.25rem;
          color: #a1a1a6;
          line-height: 1.5;
          margin-bottom: 2.5rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          background: rgba(52, 168, 83, 0.15);
          border: 1px solid rgba(52, 168, 83, 0.3);
          border-radius: 980px;
          color: #34A853;
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1000px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 20px;
          transition: border-color 0.3s ease;
        }

        .feature-card:hover {
          border-color: rgba(52, 168, 83, 0.5);
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #fff;
        }

        .feature-card p {
          color: #a1a1a6;
          font-size: 0.9375rem;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .title {
            font-size: 2.5rem;
          }
        }
      `}</style>
        </div>
    );
}
