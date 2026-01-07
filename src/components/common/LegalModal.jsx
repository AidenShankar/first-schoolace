import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Shield, FileText } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, title, content }) {
  const isPrivacy = title.includes('Privacy');
  const Icon = isPrivacy ? Shield : FileText;

  // Create a new Date object to get the current date
  const today = new Date();
  // Format the date into "Month day, year" format (e.g., "August 8, 2025")
  const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-4xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main container with custom styling */}
            <div 
              className="relative overflow-hidden flex flex-col"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                maxHeight: '90vh'
              }}
            >
              {/* Gradient overlays */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.03) 0%, transparent 50%, rgba(37, 99, 235, 0.03) 100%)'
                }}
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)'
                }}
              />
              
              {/* Header */}
              <div 
                className="relative flex-shrink-0 p-6 md:p-8"
                style={{
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '16px'
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: '#22d3ee' }} />
                    </div>
                    <div>
                      <h2 
                        className="text-2xl md:text-3xl font-bold mb-1"
                        style={{
                          background: 'linear-gradient(90deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {title}
                      </h2>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>
                        {isPrivacy ? 'How we protect and handle your data' : 'Our commitment to transparency and fairness'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose}
                    className="h-10 w-10 transition-all duration-200 hover:bg-slate-700/50"
                    style={{ 
                      color: '#94a3b8',
                      borderRadius: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#94a3b8';
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative flex-1 overflow-y-auto">
                <div className="p-6 md:p-8 lg:p-12">
                  <div 
                    className="max-w-none"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.7',
                      color: '#cbd5e1'
                    }}
                  >
                    <style>{`
                      .legal-content h2 {
                        font-size: 1.25rem !important;
                        font-weight: 700 !important;
                        color: #ffffff !important;
                        margin: 2rem 0 1.5rem 0 !important;
                        padding: 0.75rem 1rem !important;
                        border-left: 4px solid rgba(6, 182, 212, 0.5) !important;
                        background: linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, transparent 100%) !important;
                        border-radius: 0 8px 8px 0 !important;
                      }
                      .legal-content p {
                        color: #cbd5e1 !important;
                        margin-bottom: 1rem !important;
                        line-height: 1.6 !important;
                      }
                      .legal-content strong {
                        color: #22d3ee !important;
                        font-weight: 600 !important;
                      }
                      .legal-content ul, .legal-content ol {
                        margin: 1rem 0 !important;
                        padding-left: 1.5rem !important;
                      }
                      .legal-content li {
                        color: #cbd5e1 !important;
                        margin-bottom: 0.5rem !important;
                        line-height: 1.6 !important;
                      }
                      .legal-content a {
                        color: #22d3ee !important;
                        text-decoration: none !important;
                        transition: all 0.2s ease !important;
                      }
                      .legal-content a:hover {
                        color: #67e8f9 !important;
                        text-decoration: underline !important;
                      }
                    `}</style>
                    <div className="legal-content">
                      {content}
                    </div>
                  </div>
                </div>
                
                {/* Gradient fade at bottom */}
                <div 
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{
                    height: '64px',
                    background: 'linear-gradient(to top, #0f172a 0%, transparent 100%)'
                  }}
                />
              </div>
              
              {/* Footer */}
              <div 
                className="relative flex-shrink-0 p-6"
                style={{
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#4ade80' }}
                    />
                    <span>Last updated: {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: '#64748b' }}>Questions?</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="transition-all duration-200"
                      style={{
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: '#22d3ee',
                        borderRadius: '12px',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                        e.target.style.borderColor = '#22d3ee';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                      }}
                      onClick={() => window.open('mailto:schoolacehelp@gmail.com')}
                    >
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}