"use client";

import React from "react";
import { MONTHS, MONTH_NAMES_ES, MonthKey } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Snowflake,
  Sun,
  Leaf,
  Flower2,
  Waves,
  Heart,
  Gift,
  Coffee,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MonthHeroProps {
  selectedYear: number;
  selectedMonth: MonthKey;
  onMonthChange: (month: MonthKey) => void;
  onYearChange: (year: number) => void;
}

// 12 unique color palettes - each month gets its own identity
const MONTH_PALETTES: Record<MonthKey, { bg: string; grid: string; text: string }> = {
  january: { bg: "#3b82f6", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Blue
  february: { bg: "#ec4899", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Pink
  march: { bg: "#10b981", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Green
  april: { bg: "#f59e0b", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Orange
  may: { bg: "#8b5cf6", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Purple
  june: { bg: "#06b6d4", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Cyan
  july: { bg: "#ef4444", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Red
  august: { bg: "#f97316", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Orange-Red
  september: { bg: "#14b8a6", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Teal
  october: { bg: "#a855f7", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Violet
  november: { bg: "#84cc16", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Lime
  december: { bg: "#0ea5e9", grid: "rgba(255, 255, 255, 0.15)", text: "#ffffff" }, // Sky Blue
};

const MONTH_FULL_NAMES: Record<MonthKey, string> = {
  january: "ENERO",
  february: "FEBRERO",
  march: "MARZO",
  april: "ABRIL",
  may: "MAYO",
  june: "JUNIO",
  july: "JULIO",
  august: "AGOSTO",
  september: "SEPTIEMBRE",
  october: "OCTUBRE",
  november: "NOVIEMBRE",
  december: "DICIEMBRE",
};

// Seasonal decorations for Argentine seasons
const MONTH_DECORATIONS: Record<
  MonthKey,
  { emojis: string[]; icon: React.ComponentType<{ size?: number; className?: string }>; theme: string }
> = {
  january: { emojis: ["☀️", "🏖️", "🌊", "🍹", "😎"], icon: Sun, theme: "summer" }, // Verano - playa
  february: { emojis: ["❤️", "💕", "🌹", "☀️", "🎉"], icon: Heart, theme: "summer" }, // Verano + San Valentín
  march: { emojis: ["🍂", "🍁", "🌾", "🎒", "📚"], icon: Leaf, theme: "autumn" }, // Otoño comienza
  april: { emojis: ["🍂", "🍁", "☂️", "🌧️", "🎃"], icon: Leaf, theme: "autumn" }, // Otoño pleno
  may: { emojis: ["🍂", "❄️", "🧣", "☕", "🌙"], icon: Coffee, theme: "autumn" }, // Otoño tardío
  june: { emojis: ["❄️", "☕", "🧣", "🌨️", "⛄"], icon: Snowflake, theme: "winter" }, // Invierno comienza
  july: { emojis: ["❄️", "⛄", "🎿", "🌨️", "🔥"], icon: Snowflake, theme: "winter" }, // Invierno pleno
  august: { emojis: ["❄️", "🌨️", "☃️", "🧤", "🎭"], icon: Snowflake, theme: "winter" }, // Invierno tardío
  september: { emojis: ["🌸", "🌼", "🦋", "🌱", "✨"], icon: Flower2, theme: "spring" }, // Primavera comienza
  october: { emojis: ["🌸", "🌺", "🌷", "🌻", "🐝"], icon: Flower2, theme: "spring" }, // Primavera plena
  november: { emojis: ["🌸", "☀️", "🌈", "🦋", "🎈"], icon: Sparkles, theme: "spring" }, // Primavera tardía
  december: { emojis: ["🎄", "🎅", "🎁", "✨", "☀️"], icon: Gift, theme: "summer" }, // Verano + Navidad
};

export const MonthHero: React.FC<MonthHeroProps> = ({
  selectedYear,
  selectedMonth,
  onMonthChange,
  onYearChange,
}) => {
  const [isYearModalOpen, setIsYearModalOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();
  const palette = MONTH_PALETTES[selectedMonth];
  const decorations = MONTH_DECORATIONS[selectedMonth];
  const SeasonIcon = decorations.icon;

  // Generate year range (10 years before to 5 years after current year)
  const yearRange = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i);

  const handlePreviousMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex === 0) {
      // Go to December of previous year
      onMonthChange("december");
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(MONTHS[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex === 11) {
      // Go to January of next year
      onMonthChange("january");
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(MONTHS[currentIndex + 1]);
    }
  };

  const handleYearSelect = (year: number) => {
    onYearChange(year);
    setIsYearModalOpen(false);
  };

  return (
    <>
      <motion.div
        className="month-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          backgroundColor: palette.bg,
        }}
      >
        {/* Grid Pattern Background */}
        <div
          className="month-hero-grid"
          style={{
            backgroundImage: `
              linear-gradient(${palette.grid} 1px, transparent 1px),
              linear-gradient(90deg, ${palette.grid} 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="month-hero-content">
          {/* Navigation Controls - Top Right */}
          <div className="month-hero-controls">
            <button
              onClick={handlePreviousMonth}
              className="month-hero-nav"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => setIsYearModalOpen(true)}
              className="month-hero-year-btn"
              aria-label="Cambiar año"
            >
              <Calendar size={18} />
              <span>{selectedYear}</span>
            </button>

            <button
              onClick={handleNextMonth}
              className="month-hero-nav"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="month-hero-main">
            {/* Giant Month Display with Decorations */}
            <motion.div
              key={`${selectedMonth}-${selectedYear}`}
              initial={{ scale: 0.95, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="month-hero-display"
              style={{ color: palette.text }}
            >
              <div className="month-hero-month-container">
                <div className="month-hero-month">{MONTH_FULL_NAMES[selectedMonth]}</div>

                {/* Seasonal Decorations - Right Side */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`decorations-${selectedMonth}`}
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="month-decorations"
                  >
                    {/* Large animated icon */}
                    <motion.div
                      className="season-icon"
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    >
                      <SeasonIcon size={72} className="season-icon" />
                    </motion.div>

                    {/* Floating Emojis */}
                    <AnimatePresence mode="wait">
                      {decorations.emojis.map((emoji, index) => (
                        <motion.div
                          key={`${selectedMonth}-${emoji}-${index}`}
                          className="floating-emoji"
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={{
                            opacity: [0, 1, 1, 0.8],
                            scale: [0, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: index * 0.2,
                            ease: "easeInOut",
                          }}
                          style={{
                            position: "absolute",
                            right: `${20 + index * 15}%`,
                            top: `${20 + (index * 15) % 40}%`,
                            fontSize: "2rem",
                            opacity: 0.8,
                          }}
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Seasonal Icon with pulse animation */}
                    <motion.div
                      key={`icon-${selectedMonth}`}
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.15, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        duration: 0.6,
                      }}
                      className="month-hero-season-icon"
                    >
                      <SeasonIcon size={180} />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="month-hero-year">{selectedYear}</div>
            </motion.div>

            {/* Month Pills - Bottom Left */}
            <div className="month-hero-pills">
              {MONTHS.map((month) => (
                <button
                  key={month}
                  onClick={() => onMonthChange(month)}
                  className={`month-pill ${selectedMonth === month ? "active" : ""}`}
                >
                  {MONTH_NAMES_ES[month]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Year Selection Modal */}
      {isYearModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="year-modal-overlay"
          onClick={() => setIsYearModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="year-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="year-modal-header">
              <h3>Seleccionar Año</h3>
              <button
                onClick={() => setIsYearModalOpen(false)}
                className="year-modal-close"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="year-grid">
              {yearRange.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`year-option ${year === selectedYear ? "selected" : ""} ${year === currentYear ? "current" : ""
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        .month-hero {
          position: relative;
          width: 100%;
          min-height: 320px;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        .month-hero-grid {
          position: absolute;
          inset: 0;
          opacity: 0.6;
        }

        .month-hero-content {
          position: relative;
          z-index: 1;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          min-height: 360px;
        }

        .month-hero-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          align-self: flex-end;
          margin-bottom: 1rem;
        }

        .month-hero-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .month-hero-nav {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .month-hero-nav:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }

        .month-hero-nav:active {
          transform: scale(0.95);
        }

        .month-hero-year-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 100px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .month-hero-year-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.05);
        }

        .month-hero-year-btn:active {
          transform: scale(0.98);
        }

        .month-hero-display {
          text-align: left;
          line-height: 0.9;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .month-hero-month-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 0.5rem;
        }

        .month-hero-month {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.85;
          z-index: 2;
          position: relative;
        }

        .month-decorations {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 120px;
          height: 100px;
          margin-left: auto;
        }

        .season-icon {
          color: rgba(255, 255, 255, 0.9);
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
        }

        .month-hero-season-icon {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.15);
          pointer-events: none;
          z-index: 0;
        }

        .floating-emoji {
          pointer-events: none;
          user-select: none;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
        }

        .month-hero-year {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          opacity: 0.95;
        }

        .month-hero-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-start;
          margin-top: 1.5rem;
        }

        .month-pill {
          padding: 0.5rem 1rem;
          border-radius: 100px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .month-pill:hover:not(.active) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          color: white;
          transform: translateY(-2px);
        }

        .month-pill.active {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(255, 255, 255, 1);
          color: ${palette.bg};
          font-weight: 700;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Year Modal */
        .year-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .year-modal-content {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 24px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .year-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--card));
        }

        .year-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: hsl(var(--foreground));
        }

        .year-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: hsl(var(--secondary));
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          transition: all 0.2s ease;
        }

        .year-modal-close:hover {
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
          transform: scale(1.05);
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
          padding: 1.25rem;
          background: hsl(var(--secondary) / 0.4);
          border: 2px solid hsl(var(--border) / 0.4);
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .year-option:hover:not(.selected) {
          background: hsl(var(--secondary));
          border-color: hsl(var(--border));
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .year-option.current {
          border-color: ${palette.bg};
          color: ${palette.bg};
          font-weight: 700;
        }

        .year-option.selected {
          background: ${palette.bg};
          border-color: ${palette.bg};
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .year-option.selected::after {
          content: "✓";
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .month-hero {
            min-height: 300px;
            margin-bottom: 1.5rem;
          }

          .month-hero-content {
            padding: 2rem 1.5rem;
            min-height: 300px;
          }

          .month-hero-controls {
            gap: 0.75rem;
          }

          .month-hero-month-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .month-hero-month {
            font-size: clamp(3rem, 12vw, 6rem);
          }

          .month-hero-year {
            font-size: clamp(2rem, 8vw, 4rem);
          }

          .month-decorations {
            min-width: 80px;
            height: 80px;
            margin-left: 0;
          }

          .season-icon {
            width: 48px !important;
            height: 48px !important;
          }

          .month-hero-season-icon {
            right: -20px;
          }

          .month-hero-season-icon svg {
            width: 120px !important;
            height: 120px !important;
          }

          .floating-emoji {
            font-size: 1.5rem !important;
          }

          .month-hero-pills {
            gap: 0.375rem;
          }

          .month-pill {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }

          .year-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            padding: 1rem;
          }

          .year-option {
            padding: 1rem;
            font-size: 0.9375rem;
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
