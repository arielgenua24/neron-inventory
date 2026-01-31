"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2, Bot, Cpu, Zap } from "lucide-react";
import { getAllClients } from "@/lib/storage-firestore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const GeminiChat: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Only show chatbot on home page
  if (pathname !== "/") {
    return null;
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsExpanded(true);
    setIsLoading(true);

    try {
      // Get current clients data for context
      const clientsData = await getAllClients();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          clientsData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}\nDetalles: ${data.details}` : data.error;
        throw new Error(errorMsg || "Error al obtener respuesta");
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content:
          "Lo siento, hubo un error al procesar tu consulta. Por favor, intentá de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="gemini-fab"
            aria-label="Abrir chat con IA"
          >
            <div className="gemini-fab-inner">
              <Bot size={24} className="gemini-fab-icon" />
              <div className="gemini-fab-glow" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isExpanded ? "70vh" : "auto",
              width: isExpanded ? "min(600px, 90vw)" : "min(400px, 90vw)",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="gemini-container"
          >
            {/* Animated Border */}
            <div className="gemini-border-wrapper">
              <div className="gemini-border-animation" />
            </div>

            {/* Main Content */}
            <div className="gemini-content">
              {/* Header - Only show when expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="gemini-header"
                  >
                    <div className="gemini-header-title">
                      <div className="gemini-header-icon-wrapper">
                        <Cpu size={18} className="gemini-icon" />
                      </div>
                      <span>Nerón Intelligence</span>
                      <div className="status-badge">
                        <span className="status-dot"></span>
                        PRO
                      </div>
                    </div>
                    <button onClick={handleClose} className="gemini-close-btn">
                      <X size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area - Only show when expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto", flex: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="gemini-messages"
                  >
                    {messages.length === 0 ? (
                      <div className="gemini-empty-state">
                        <div className="gemini-empty-icon-wrapper">
                          <Bot size={48} className="gemini-icon-large" />
                        </div>
                        <p>Sistemas Inteligentes Nerón</p>
                        <span>Analísis avanzado de inventario y honorarios con IA</span>
                      </div>
                    ) : (
                      <div className="gemini-messages-list">
                        {messages.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`gemini-message ${msg.role}`}
                          >
                            {msg.role === "assistant" && (
                              <div className="gemini-message-avatar">
                                <Bot size={14} />
                              </div>
                            )}
                            <div className="gemini-message-content">
                              {msg.content.split("\n").map((line, i) => (
                                <p key={i}>{line || "\u00A0"}</p>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="gemini-message assistant loading"
                          >
                            <div className="gemini-message-avatar">
                              <Bot size={14} />
                            </div>
                            <div className="gemini-typing">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="gemini-input-wrapper">
                {!isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="gemini-input-label"
                  >
                    <Cpu size={14} className="gemini-icon-small" />
                    <span>Consultar Inteligencia Nerón...</span>
                  </motion.div>
                )}
                <div className="gemini-input-container">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => !isExpanded && messages.length > 0 && setIsExpanded(true)}
                    placeholder={isExpanded ? "Escribí tu consulta..." : "¿Qué necesitás saber?"}
                    className="gemini-input"
                    rows={1}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isLoading}
                    className="gemini-send-btn"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="gemini-spinner" />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </div>
                {!isExpanded && (
                  <button onClick={handleClose} className="gemini-dismiss">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Floating Action Button */
        .gemini-fab {
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #000000;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          overflow: hidden;
        }

        .gemini-fab-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
          z-index: 1;
        }

        .gemini-fab-icon {
            z-index: 2;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
        }

        .gemini-fab-glow {
            position: absolute;
            width: 150%;
            height: 150%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .gemini-fab:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .gemini-fab:hover .gemini-fab-glow {
            opacity: 1;
        }

        /* Main Container */
        .gemini-container {
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          border-radius: 24px;
          overflow: hidden;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.4);
        }

        /* Animated Border */
        .gemini-border-wrapper {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          overflow: hidden;
        }

        .gemini-border-animation {
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            #000,
            #222,
            #444,
            #666,
            #888,
            #aaa,
            #888,
            #666,
            #444,
            #222,
            #000
          );
          animation: spin 6s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Content */
        .gemini-content {
          position: relative;
          margin: 2px;
          border-radius: 22px;
          background: hsl(var(--card));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: calc(100% - 4px);
        }

        /* Header */
        .gemini-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--card));
        }

        .gemini-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1rem;
          color: hsl(var(--foreground));
          letter-spacing: -0.01em;
        }

        .gemini-header-icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #000;
            border-radius: 8px;
            color: white;
        }

        .status-badge {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.25rem 0.6rem;
            background: hsl(var(--secondary));
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            color: hsl(var(--foreground));
            border: 1px solid hsl(var(--border));
        }

        .status-dot {
            width: 6px;
            height: 6px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 8px #22c55e;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }

        .gemini-icon {
          color: white;
        }

        .gemini-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: hsl(var(--secondary));
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .gemini-close-btn:hover {
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
        }

        /* Messages Area */
        .gemini-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          min-height: 200px;
          max-height: calc(70vh - 140px);
        }

        .gemini-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: hsl(var(--muted-foreground));
          text-align: center;
          padding: 2rem;
        }

        .gemini-empty-state p {
          font-weight: 600;
          font-size: 1rem;
          color: hsl(var(--foreground));
          margin-top: 0.5rem;
        }

        .gemini-empty-state span {
          font-size: 0.875rem;
        }

        .gemini-empty-icon-wrapper {
            width: 80px;
            height: 80px;
            background: #000;
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 1rem;
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4);
        }

        .gemini-icon-large {
          width: 40px;
          height: 40px;
        }

        .gemini-messages-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .gemini-message {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .gemini-message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .gemini-message.assistant {
          align-self: flex-start;
        }

        .gemini-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gemini-message-content {
          padding: 0.75rem 1rem;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .gemini-message-content p {
          margin: 0;
        }

        .gemini-message-content p + p {
          margin-top: 0.5rem;
        }

        .gemini-message.user .gemini-message-content {
          background: #000;
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gemini-message.assistant .gemini-message-content {
          background: hsl(var(--secondary) / 0.5);
          backdrop-filter: blur(8px);
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-bottom-left-radius: 4px;
        }

        /* Typing Animation */
        .gemini-typing {
          display: flex;
          gap: 4px;
          padding: 0.75rem 1rem;
          background: hsl(var(--secondary));
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }

        .gemini-typing span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: hsl(var(--muted-foreground));
          animation: typing 1.4s infinite ease-in-out both;
        }

        .gemini-typing span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .gemini-typing span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Input Area */
        .gemini-input-wrapper {
          padding: 1rem;
          border-top: 1px solid hsl(var(--border));
          background: hsl(var(--card));
          position: relative;
        }

        .gemini-input-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gemini-icon-small {
            color: #000;
        }

        .gemini-input-container {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .gemini-input {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 1px solid hsl(var(--border));
          border-radius: 16px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-size: 0.9rem;
          font-family: inherit;
          resize: none;
          min-height: 48px;
          max-height: 120px;
          transition: all 0.2s ease;
        }

        .gemini-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .gemini-input::placeholder {
          color: hsl(var(--muted-foreground));
        }

        .gemini-send-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: none;
          background: #000;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gemini-send-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
          background: #ccc;
          color: #666;
        }

        .gemini-send-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .gemini-spinner {
          animation: spin-loader 1s linear infinite;
        }

        @keyframes spin-loader {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .gemini-dismiss {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: hsl(var(--secondary));
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0.7;
        }

        .gemini-dismiss:hover {
          opacity: 1;
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .gemini-container {
            right: 1rem;
            bottom: 5rem;
            width: calc(100vw - 2rem) !important;
          }

          .gemini-fab {
            right: 1rem;
            bottom: 5rem;
          }
        }
      `}</style>
    </>
  );
};
