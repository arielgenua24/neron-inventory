'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ClipboardList, TrendingUp } from 'lucide-react';

const navItems = [
  { name: 'Inicio', href: '/', icon: Home, color: '#4285F4' },
  { name: 'Tareas', href: '/tareas', icon: ClipboardList, color: '#EA4335' },
  { name: 'Ganancias', href: '/ganancias', icon: TrendingUp, color: '#34A853' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="logo-section">
          <div className="logo-3d">N</div>
          <span className="logo-text">Nerón</span>
        </div>

        <div className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <div className="icon-wrapper" style={{ '--icon-color': item.color } as React.CSSProperties}>
                  <item.icon size={20} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="active-bg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                <span className="nav-text">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="search-placeholder">
          {/* Global Search or Profile Placeholder */}
        </div>
      </div>

      <style jsx>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: hsl(var(--background) / 0.8);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid hsl(var(--border));
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: center;
        }

        .navbar-content {
          max-width: 1400px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-3d {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(220, 80%, 40%) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          border-radius: 10px;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.3),
                      inset 0 1px 1px rgba(255, 255, 255, 0.2);
          position: relative;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          color: hsl(var(--foreground));
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: hsl(var(--secondary));
          padding: 0.35rem;
          border-radius: 14px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          text-decoration: none;
          color: hsl(var(--muted-foreground));
          font-weight: 500;
          font-size: 0.9375rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-item:hover {
          color: hsl(var(--foreground));
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .nav-item.active {
          color: var(--icon-color);
        }

        .active-bg {
          position: absolute;
          inset: -4px -12px;
          background: hsl(var(--background));
          border-radius: 8px;
          box-shadow: 0 2px 8px hsl(var(--foreground) / 0.05);
          z-index: -1;
        }

        .nav-text {
          position: relative;
          z-index: 1;
        }

        .search-placeholder {
          flex: 0 1 300px;
        }

        @media (max-width: 768px) {
          .search-placeholder {
            display: none;
          }
          .logo-text {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
