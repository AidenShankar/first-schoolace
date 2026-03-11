import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { transferToAITutor } from '@/functions/transferToAITutor';
import { createPageUrl } from '@/utils';
import { GraduationCap } from 'lucide-react';

const MEET_ACE = "MEET ACE";
const ACE_LINE = "AI Learning Companion for Education";

// Render the ACE line, coloring A (index 0), C (index 12), E (index 26)
function AceLineColored({ text }) {
  const colored = { 0: '#a78bfa', 12: '#a78bfa', 26: '#a78bfa' };
  return (
    <span>
      {text.split('').map((char, i) =>
        colored[i]
          ? <span key={i} style={{ color: colored[i], fontWeight: 800 }}>{char}</span>
          : <span key={i}>{char}</span>
      )}
    </span>
  );
}

export default function AITutor() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // Animation phases: 0 = typing MEET ACE, 1 = typing ACE line, 2 = show bottom
  const [phase, setPhase] = useState(0);
  const [meetAceText, setMeetAceText] = useState('');
  const [aceLineText, setAceLineText] = useState('');
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u || null);
        // If returning from login with autoTransfer flag, auto-launch
        const params = new URLSearchParams(window.location.search);
        if (u && params.get('autoTransfer') === 'true') {
          doTransfer();
        }
      })
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // Phase 0: type "MEET ACE"
  useEffect(() => {
    if (phase !== 0) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMeetAceText(MEET_ACE.slice(0, i));
      if (i >= MEET_ACE.length) {
        clearInterval(interval);
        setTimeout(() => setPhase(1), 350);
      }
    }, 90);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 1: type ACE line
  useEffect(() => {
    if (phase !== 1) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAceLineText(ACE_LINE.slice(0, i));
      if (i >= ACE_LINE.length) {
        clearInterval(interval);
        setTimeout(() => setShowBottom(true), 300);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  const doTransfer = async () => {
    setTransferring(true);
    try {
      const response = await transferToAITutor({});
      if (response?.data?.redirect_url) {
        window.location.href = response.data.redirect_url;
      } else {
        throw new Error('No redirect URL');
      }
    } catch (e) {
      console.error('Transfer error:', e);
      setTransferring(false);
    }
  };

  const handleLearnClick = () => {
    if (!authChecked) return;
    if (user) {
      doTransfer();
    } else {
      const returnUrl = window.location.origin + createPageUrl('AITutor') + '?autoTransfer=true';
      base44.auth.redirectToLogin(returnUrl);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&display=swap');
        .ace-root { font-family: 'Oxanium', sans-serif; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeSlideUp 0.7s ease forwards; }
        .learn-btn {
          font-family: 'Oxanium', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.9rem 3rem;
          border-radius: 50px;
          border: 2px solid rgba(139,92,246,0.5);
          background: linear-gradient(135deg, rgba(109,40,217,0.25), rgba(139,92,246,0.15));
          color: white;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .learn-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(109,40,217,0.55), rgba(139,92,246,0.45));
          border-color: rgba(167,139,250,0.9);
          box-shadow: 0 0 36px rgba(139,92,246,0.45);
          transform: scale(1.04);
        }
        .learn-btn:disabled { opacity: 0.6; cursor: wait; }
        .cursor-blink { animation: blink 0.9s step-start infinite; display: inline-block; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      <div className="ace-root" style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 60% 40%, #1a0a3e 0%, #0d0d20 55%, #080810 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.12,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(167,139,250,0.5) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />

        {/* Glow orb */}
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top logo */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a href={createPageUrl('Landing')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6d28d9, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Oxanium, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#e2e8f0', letterSpacing: '0.05em' }}>School<span style={{ color: '#a78bfa' }}>ACE</span></span>
          </a>
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '860px', width: '100%' }}>

          {/* MEET ACE */}
          <h1 style={{
            fontSize: 'clamp(3.5rem, 11vw, 8rem)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            lineHeight: 1.05,
            marginBottom: '1.2rem',
            minHeight: '1.15em',
            background: 'linear-gradient(135deg, #c4b5fd 10%, #a78bfa 50%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {meetAceText}
            {phase === 0 && <span className="cursor-blink" style={{ WebkitTextFillColor: '#a78bfa' }}>|</span>}
          </h1>

          {/* AI Learning Companion for Education */}
          {phase >= 1 && (
            <h2 style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.75rem)',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '1.5rem',
              minHeight: '1.5em',
              letterSpacing: '0.02em',
            }}>
              <AceLineColored text={aceLineText} />
              {phase === 1 && <span className="cursor-blink" style={{ color: '#a78bfa' }}>|</span>}
            </h2>
          )}

          {/* AI Tutor for Everyone + Button — always reserves space */}
          <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.4rem' }}>
            {showBottom && (
              <>
                <p className="fade-up" style={{
                  fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                  color: '#94a3b8',
                  fontWeight: 400,
                  letterSpacing: '0.05em',
                }}>
                  AI Tutor for Everyone
                </p>

                <button
                  className="learn-btn fade-up"
                  onClick={handleLearnClick}
                  disabled={transferring || !authChecked}
                  style={{ animationDelay: '0.15s' }}
                >
                  {transferring ? 'Launching...' : "Let's Learn"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}