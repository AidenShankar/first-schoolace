import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bot, BookOpen, PenTool, BarChart, CheckCircle, GraduationCap,
  Brain, Sparkles, Users, Calendar, Activity, Crown, SlidersHorizontal,
  BrainCircuit, ShieldCheck, Mail, Edit, Shield, PlusCircle, Lock, Eye, Unlock
} from 'lucide-react';
import { Contact } from '@/entities/Contact';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '../components/i18n/useTranslation';
import LanguageSelector from '../components/i18n/LanguageSelector';
import AIPreviewSection from '../components/landing/AIPreviewSection';
import AceTutorBanner from '../components/landing/AceTutorBanner';
import LandingFooter from '../components/landing/LandingFooter';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const EXPO = [0.16, 1, 0.3, 1];
const CARD_HOVER = { scale: 1.015, y: -4, transition: { duration: 0.28, ease: EXPO } };
const CARD_TAP   = { scale: 0.975 };

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.52, ease: EXPO, delay } },
});
const stagger = (s = 0.06) => ({
  hidden: {},
  show:   { transition: { staggerChildren: s } },
});

// ─── Background ───────────────────────────────────────────────────────────────
const AmbientBlob = ({ style, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ filter: 'blur(120px)', ...style }}
    animate={{ x: [0, 32, -18, 0], y: [0, -22, 16, 0] }}
    transition={{ duration: 22 + delay * 4, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const Background = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#07070a]" />
    <div className="absolute inset-0 bg-grid-subtle" />
    <AmbientBlob style={{ width: 680, height: 680, background: 'rgba(94,106,210,0.10)', top: -220, left: -160 }} delay={0} />
    <AmbientBlob style={{ width: 500, height: 500, background: 'rgba(139,92,246,0.08)', top: '32%', right: -120 }} delay={6} />
    <AmbientBlob style={{ width: 420, height: 420, background: 'rgba(94,106,210,0.07)', bottom: '8%', left: '26%' }} delay={12} />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#07070a_100%)] pointer-events-none" />
  </div>
);

// ─── Animated counter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ end, duration = 3, className, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, end, {
      duration, ease: 'easeOut',
      onUpdate: (v) => setCount(Math.floor(v)),
    });
    return () => ctrl.stop();
  }, [inView, end, duration]);
  return <span ref={ref} className={className}>{count}{suffix}</span>;
};

// ─── Typewriter ───────────────────────────────────────────────────────────────
const TypewriterText = ({ text, className }) => {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!text) return;
    let i = 0; setShown('');
    const id = setInterval(() => {
      if (i < text.length) setShown(text.substring(0, ++i));
      else clearInterval(id);
    }, 44);
    return () => clearInterval(id);
  }, [text]);
  return <span className={className}>{shown}</span>;
};

// ─── Navigation ───────────────────────────────────────────────────────────────
const Header = () => {
  const { t } = useTranslation();
  const links = [
    { href: '#features',        label: t('landing.forTeachers') },
    { href: '#student-features',label: t('landing.forStudents') },
    { href: '#co-pilot',        label: t('landing.aiCapabilities') },
    { href: 'https://schoolace.ai/tutor', label: 'Tutor', badge: 'NEW' },
    { href: '#testimonials',    label: t('landing.testimonials') },
    { href: '#pricing',         label: t('landing.pricing') },
    { href: '#contact',         label: t('landing.contact') },
    { href: 'https://aitutor.schoolace.ai/tutor/awards', label: 'Awards' },
  ];
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 backdrop-blur-xl"
      style={{ background: 'rgba(7,7,10,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}>
              <img src="https://media.base44.com/images/public/687ed6bea54c832b17eb40bc/36948c755_image.png" alt="SchoolACE" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-[#EDEDEF] tracking-tight">SchoolACE</span>
          </div>
          <nav className="hidden md:flex items-center gap-5">
            {links.map((item) => (
              <a key={item.href} href={item.href}
                className="flex items-start gap-1 text-xs font-medium transition-colors duration-200"
                style={{ color: '#8A8F98' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#EDEDEF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8A8F98'}>
                {item.label}
                {item.badge && (
                  <span className="px-1.5 py-px text-[8px] font-bold bg-orange-500 text-white rounded-full leading-tight -mt-0.5">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
            <Link to="/about" className="text-xs font-medium transition-colors duration-200"
              style={{ color: '#8A8F98' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#EDEDEF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8A8F98'}>
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

// ─── Feature card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ feature, index, accent = '#5E6AD2' }) => (
  <motion.div
    variants={fadeUp(index * 0.04)}
    whileHover={CARD_HOVER} whileTap={CARD_TAP}
    className="relative p-6 rounded-2xl overflow-hidden group cursor-default"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: `radial-gradient(circle at 50% 0%, ${accent}1a, transparent 65%)` }} />
    <div className="relative z-10">
      <div className="w-10 h-10 mb-4 rounded-xl flex items-center justify-center transition-colors duration-300"
        style={{ background: `${accent}18`, color: accent }}>
        {React.cloneElement(feature.icon, { className: 'w-5 h-5' })}
      </div>
      <h3 className="text-sm font-semibold text-[#EDEDEF] mb-1.5">{feature.title}</h3>
      <p className="text-sm text-[#8A8F98] leading-relaxed">{feature.description}</p>
    </div>
  </motion.div>
);

// ─── Featured (large) student card ───────────────────────────────────────────
const FeaturedCard = ({ feature }) => (
  <motion.div
    variants={fadeUp(0)}
    whileHover={{ ...CARD_HOVER, scale: 1.01 }} whileTap={CARD_TAP}
    className="relative py-10 px-10 rounded-2xl overflow-hidden group cursor-default mb-4"
    style={{ background: 'rgba(94,106,210,0.06)', border: '1px solid rgba(94,106,210,0.22)' }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(94,106,210,0.14), transparent 65%)' }} />
    <div className="relative z-10 flex items-center gap-8">
      <div className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(94,106,210,0.18)', color: '#7B8FE8' }}>
        <Bot className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-[#EDEDEF] mb-2">{feature.title}</h3>
        <p className="text-[#8A8F98] leading-relaxed max-w-2xl text-sm">{feature.description}</p>
      </div>
    </div>
  </motion.div>
);

// ─── Pricing card ─────────────────────────────────────────────────────────────
const PricingCard = ({ plan, price, features, cta, isFeatured, linkTo, onCtaClick }) => {
  const [showEmail, setShowEmail] = useState(false);
  const [emailText, setEmailText] = useState('');
  const { t } = useTranslation();

  const revealEmail = () => {
    setShowEmail(true);
    const email = 'contact@schoolace.ai';
    let i = 0;
    const id = setInterval(() => {
      if (i < email.length) setEmailText(email.slice(0, ++i));
      else clearInterval(id);
    }, 48);
  };

  const priceDisplay = () => {
    if (price === t('landing.freePrice')) return (
      <>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-[#EDEDEF]">$0</span>
          <span className="text-xs text-[#8A8F98]">USD</span>
        </div>
        <div className="text-xs text-[#8A8F98]">/ month</div>
      </>
    );
    if (price.includes('$10')) return (
      <>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-[#EDEDEF]">$10</span>
          <span className="text-xs text-[#8A8F98]">USD</span>
        </div>
        <div className="text-xs text-[#8A8F98]">{price.replace('$10', '').trim()}</div>
      </>
    );
    return <div className="text-3xl font-bold text-[#EDEDEF]">{price}</div>;
  };

  const btnStyle = isFeatured
    ? { background: 'linear-gradient(135deg,#5E6AD2,#7B8FE8)', color: '#fff', boxShadow: '0 4px 20px rgba(94,106,210,0.32)' }
    : { background: 'rgba(255,255,255,0.06)', color: '#EDEDEF', border: '1px solid rgba(255,255,255,0.1)' };

  const cardStyle = isFeatured
    ? { background: 'rgba(94,106,210,0.07)', border: '1px solid rgba(94,106,210,0.38)', boxShadow: '0 0 40px rgba(94,106,210,0.1), inset 0 1px 0 rgba(255,255,255,0.07)' }
    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.52, ease: EXPO }}
      whileHover={{ y: -4, transition: { duration: 0.24, ease: EXPO } }}
      className="relative p-7 rounded-2xl flex flex-col overflow-hidden"
      style={cardStyle}>
      {isFeatured && (
        <div className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(94,106,210,0.5), transparent 55%)' }} />
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#EDEDEF]">{plan}</h3>
          {isFeatured && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ color: '#A78BFA', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.22)' }}>
              <Crown className="w-2.5 h-2.5" />{t('landing.mostPopular')}
            </span>
          )}
        </div>
        <div className="mb-5 min-h-[80px] flex flex-col justify-center">{priceDisplay()}</div>
        <ul className="space-y-2.5 mb-7 flex-grow">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-[#8A8F98]">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#5E6AD2' }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            {onCtaClick ? (
              <button onClick={onCtaClick}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-shadow duration-200"
                style={btnStyle}>
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : linkTo ? (
              <Link to={linkTo}>
                <button className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={btnStyle}>
                  {cta} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            ) : (
              <button onClick={revealEmail}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer" style={btnStyle}>
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
          {showEmail && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] text-[#8A8F98] mb-1">Contact us at:</p>
              <p className="font-mono text-sm" style={{ color: '#7B8FE8' }}>{emailText}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Chart card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, value, valueColor, data, color, gradientId, isLineChart = false, maxValue, ticks }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView || !data.length) return;
    const start = Date.now(), dur = 6000;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(t);
  }, [inView, data.length]);

  const animated = data.map(pt => ({ ...pt, val: pt.val * progress }));
  const m = value.match(/([+])?(\d+(\.\d+)?)(.*)/);
  const prefix = m?.[1] || '', number = parseFloat(m?.[2] || 0), suffix = m?.[4] || '';

  const tooltipStyle = { backgroundColor: 'rgba(7,7,10,0.95)', borderColor: 'rgba(255,255,255,0.09)', borderRadius: '0.75rem', color: '#EDEDEF', fontSize: '11px' };
  const axisProps = { tick: { fill: '#3a4050', fontSize: 11 }, tickLine: false, axisLine: false };

  return (
    <div ref={ref} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-xs font-medium text-[#8A8F98]">{title}</h4>
        <p className={`font-bold text-2xl tabular-nums ${valueColor}`}>
          {prefix}<AnimatedCounter end={number} duration={4.5} />{suffix}
        </p>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          {isLineChart ? (
            <LineChart data={animated} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.7} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" {...axisProps} interval={0} />
              <YAxis {...axisProps} domain={[0, maxValue || 'dataMax+5']} ticks={ticks} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 2 }} formatter={(v) => [v.toFixed(1), '']} />
              <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} isAnimationActive animationDuration={2000} animationEasing="ease-out" />
            </LineChart>
          ) : (
            <AreaChart data={animated} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" {...axisProps} interval={0} />
              <YAxis {...axisProps} domain={[0, maxValue || 'dataMax+5']} ticks={ticks} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 2 }} formatter={(v) => [v.toFixed(1), '']} />
              <Area type="monotone" dataKey="val" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} isAnimationActive animationDuration={2000} animationEasing="ease-out" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.4, ease: EXPO, delay }}
    className="p-6 rounded-2xl text-center flex flex-col justify-center"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <p className={`text-4xl font-bold tabular-nums mb-1.5 ${color}`}>{value}</p>
    <p className="text-xs text-[#8A8F98] font-medium">{title}</p>
  </motion.div>
);

// ─── Testimonial card ─────────────────────────────────────────────────────────
const TestimonialCard = ({ testimonial }) => (
  <motion.div
    whileHover={{ scale: 1.015, y: -3, transition: { duration: 0.24, ease: EXPO } }}
    className="relative h-full p-6 rounded-2xl flex flex-col overflow-hidden group"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(94,106,210,0.12), transparent 65%)' }} />
    <div className="relative z-10 flex flex-col h-full">
      <blockquote className="text-sm text-[#8A8F98] leading-relaxed italic flex-grow mb-5">
        "{testimonial.quote}"
      </blockquote>
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {testimonial.imageUrl ? (
          <img src={testimonial.imageUrl} alt={testimonial.name}
            className="w-8 h-8 rounded-full object-cover"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }} />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
            style={{ background: testimonial.role === 'Teacher' ? 'rgba(94,106,210,0.35)' : 'rgba(139,92,246,0.35)' }}>
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-[#EDEDEF]">{testimonial.name}</p>
          <p className="text-[10px] text-[#8A8F98]">{testimonial.role}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color = '#5E6AD2' }) => (
  <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
    transition={{ duration: 0.35 }}
    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
    style={{ color }}>
    {children}
  </motion.p>
);

const SectionHeading = ({ children, delay = 0 }) => (
  <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.52, ease: EXPO, delay }}
    className="text-3xl md:text-4xl font-bold tracking-tight text-[#EDEDEF] mb-4">
    {children}
  </motion.h2>
);

const SectionSub = ({ children, delay = 0.07 }) => (
  <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.52, ease: EXPO, delay }}
    className="text-[#8A8F98] max-w-xl mx-auto text-sm leading-relaxed">
    {children}
  </motion.p>
);

const UnlockBadge = ({ label, color = '#5E6AD2' }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ delay: 0.35 }}
    className="flex justify-center mt-10">
    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs text-[#8A8F98]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <Unlock className="w-3.5 h-3.5" style={{ color }} />
      {label}
    </div>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.gtag) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-PPPFF547QK';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-PPPFF547QK');
  }, []);

  const toLogin = async () => {
    const url = window.location.origin + createPageUrl('Dashboard');
    await base44.auth.redirectToLogin(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { alert('Please fill in all required fields'); return; }
    setSubmitting(true);
    try {
      await Contact.create({ name: form.name, email: form.email, subject: form.subject || 'No subject', message: form.message, status: 'new' });
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      alert('Failed to send. Please email contact@schoolace.ai directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const teacherFeatures = [
    { icon: <Bot />, title: t('landing.intelligentGrading'), description: t('landing.intelligentGradingDesc') },
    { icon: <BarChart />, title: t('landing.interactiveQuizzes'), description: t('landing.interactiveQuizzesDesc') },
    { icon: <BookOpen />, title: t('landing.dynamicAssignments'), description: t('landing.dynamicAssignmentsDesc') },
    { icon: <Calendar />, title: t('landing.smartScheduling'), description: t('landing.smartSchedulingDesc') },
    { icon: <Activity />, title: t('landing.realTimeProgress'), description: t('landing.realTimeProgressDesc') },
    { icon: <Sparkles />, title: t('landing.proactiveAIAgent'), description: t('landing.proactiveAIAgentDesc') },
  ];

  const studentFeatures = [
    { icon: <Bot />, title: t('landing.individualizedStudyCompanion'), description: t('landing.individualizedStudyCompanionDesc'), isFeatured: true },
    { icon: <PenTool />, title: t('landing.aceModels'), description: t('landing.aceModelsDesc') },
    { icon: <Bot />, title: t('landing.longitudinalMemory'), description: t('landing.longitudinalMemoryDesc') },
    { icon: <Brain />, title: t('landing.checkYourUnderstanding'), description: t('landing.checkYourUnderstandingDesc') },
    { icon: <Users />, title: 'ACE Spaces', description: 'Experience the future of collaboration with AI-enhanced group chats where you can brainstorm, share files, and get instant tutoring together.' },
  ];

  const aiTools = [
    { icon: <PenTool />, title: t('landing.worksheetGeneration') },
    { icon: <BarChart />, title: t('landing.rubricCreation') },
    { icon: <BrainCircuit />, title: t('landing.quizGeneration') },
    { icon: <GraduationCap />, title: t('landing.reportCardComments') },
    { icon: <SlidersHorizontal />, title: t('landing.lessonPlanning') },
    { icon: <Edit />, title: t('landing.iepAssistance') },
    { icon: <Mail />, title: t('landing.emailDrafting') },
    { icon: <ShieldCheck />, title: t('landing.reportContent') },
  ];

  const testimonials = [
    { quote: t('landing.testimonial1'), name: 'Ethan Chen', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/a4476a942_Screenshot2025-10-14at74455PM.png' },
    { quote: t('landing.testimonial2'), name: 'Jesse Alabi', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/c5f3f94c4_Screenshot2025-10-14at74303PM.png' },
    { quote: t('landing.testimonial3'), name: 'Henry He', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/28d23dde8_Screenshot2025-10-14at74431PM.png' },
    { quote: t('landing.testimonial4'), name: 'Dr. Kraver', role: t('roles.teacher') },
    { quote: t('landing.testimonial5'), name: 'Kimoon Bae', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/754ea1c55_443E26B3-DC25-40FC-9A29-B1051EC523F5_1_201_a.jpg' },
    { quote: t('landing.testimonial6'), name: 'Xiangting Ren', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/db05cdc6d_Screenshot2025-09-30at44716PM.png' },
    { quote: t('landing.testimonial7'), name: 'Lexi Liu', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/200f24820_Screenshot2025-10-01at10742PM.png' },
    { quote: t('landing.testimonial8'), name: 'Sophie He', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/45f8f2cf8_Screenshot2025-10-01at10931PM.png' },
    { quote: t('landing.testimonial9'), name: 'Johnny Zhao', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/76f9da2e7_Screenshot2025-10-01at10830PM.png' },
    { quote: t('landing.testimonial10'), name: 'David He', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/a8cd04160_Screenshot2025-12-31at95757PM.png' },
    { quote: t('landing.testimonial11'), name: 'Jefferson Chen', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/6daf7e7fa_Screenshot2025-12-31at103321PM.png' },
    { quote: t('landing.testimonial12'), name: 'Ethan Wang', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/4e2cb0da4_Screenshot2026-01-03at105645AM.png' },
    { quote: t('landing.testimonial13'), name: 'Xiyao Zhou', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/f6f20006c_Screenshot2026-01-03at105653AM.png' },
    { quote: t('landing.testimonial14'), name: 'Yohaan Narayanan', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/cc92e6bb9_Screenshot2026-02-17at64039PM.png' },
    { quote: t('landing.testimonial15'), name: 'Anish Sarangee', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/6ddd3f8a0_Screenshot2026-01-03at120548PM.png' },
    { quote: t('landing.testimonial16'), name: 'Rey Sadhu', role: t('roles.student'), imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/f6585736b_Screenshot2026-01-03at120832PM.png' },
  ];

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm text-[#EDEDEF] placeholder-[#3a4050] outline-none transition-all duration-200';
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
  const focusInput = (e) => { e.target.style.borderColor = 'rgba(94,106,210,0.5)'; };
  const blurInput  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; };

  return (
    <div className="text-[#EDEDEF] min-h-screen overflow-x-hidden relative" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Background />

      {/* Fixed sign-in */}
      <div className="fixed top-4 right-4 lg:right-6 z-[100] flex items-center gap-3">
        <LanguageSelector />
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={toLogin}
          className="text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#5E6AD2,#7B8FE8)', color: '#fff', boxShadow: '0 2px 16px rgba(94,106,210,0.32)' }}>
          {t('landing.signIn')}
        </motion.button>
      </div>

      <div className="relative z-20">
        <Header />
        <AceTutorBanner />

        <main>

          {/* ── Hero ─────────────────────────────────────────── */}
          <section className="px-6 pt-24 pb-20 text-center max-w-5xl mx-auto">
            <motion.div initial="hidden" animate="show" variants={stagger(0.1)}>

              <motion.div variants={fadeUp(0)} className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.28)', color: '#7B8FE8' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Education Platform
                </div>
              </motion.div>

              <motion.h1 variants={fadeUp(0.06)} className="text-5xl md:text-7xl font-bold mb-6 leading-[1.08] tracking-tight">
                <TypewriterText
                  text={t('landing.heroTitle')}
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)' }}
                />
              </motion.h1>

              <motion.p variants={fadeUp(0.14)} className="text-base text-[#8A8F98] max-w-2xl mx-auto leading-relaxed mb-2">
                {t('landing.heroSubtitle').split('{aceAI}')[0]}
                <strong className="font-semibold text-[#EDEDEF]">ACE AI</strong>
                {t('landing.heroSubtitle').split('{aceAI}')[1] || ''}
              </motion.p>

              <motion.p variants={fadeUp(0.18)} className="text-lg font-semibold text-[#EDEDEF] max-w-2xl mx-auto mb-10">
                {t('landing.heroTagline')}
              </motion.p>

              <motion.div variants={fadeUp(0.24)} className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(94,106,210,0.50)' }}
                  whileTap={{ scale: 0.97 }} onClick={toLogin}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#5E6AD2,#7B8FE8)', color: '#fff', boxShadow: '0 4px 24px rgba(94,106,210,0.38)' }}>
                  {t('landing.getStartedFree')} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          </section>

          {/* ── Teacher features ─────────────────────────────── */}
          <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <SectionLabel color="#5E6AD2">For Educators</SectionLabel>
              <SectionHeading>{t('landing.coPilotForTeachers')}</SectionHeading>
              <SectionSub>{t('landing.coPilotDesc')}</SectionSub>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger(0.055)}>
              {teacherFeatures.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} accent="#5E6AD2" />)}
            </motion.div>
            <UnlockBadge label={t('landing.signInToDiscover')} color="#5E6AD2" />
          </section>

          {/* ── Student features ─────────────────────────────── */}
          <section id="student-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <SectionLabel color="#9D4EDD">For Students</SectionLabel>
              <SectionHeading>{t('landing.studyCompanionForStudents')}</SectionHeading>
              <SectionSub>{t('landing.studyCompanionDesc')}</SectionSub>
            </div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger(0.06)}>
              <FeaturedCard feature={studentFeatures[0]} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentFeatures.slice(1).map((f, i) => <FeatureCard key={f.title} feature={f} index={i + 1} accent="#9D4EDD" />)}
              </div>
            </motion.div>
            <UnlockBadge label={t('landing.signInToDiscover')} color="#9D4EDD" />
          </section>

          {/* ── AI preview ───────────────────────────────────── */}
          <section className="py-8 relative z-30 mb-8">
            <AIPreviewSection />
          </section>

          {/* ── 30+ Tools ────────────────────────────────────── */}
          <section id="co-pilot" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <SectionLabel color="#06b6d4">AI Toolkit</SectionLabel>
                <motion.h2 initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.52, ease: EXPO }}
                  className="text-3xl md:text-4xl font-bold tracking-tight text-[#EDEDEF] mb-4 flex items-center gap-3">
                  <span className="tabular-nums" style={{ color: '#06b6d4' }}>
                    <AnimatedCounter end={30} duration={3} suffix="+" />
                  </span>
                  {t('landing.productivityTools')}
                </motion.h2>
                <motion.p initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.52, ease: EXPO, delay: 0.08 }}
                  className="text-[#8A8F98] text-sm leading-relaxed">
                  {t('landing.productivityToolsDesc')}
                </motion.p>
              </div>
              <div className="relative h-[400px] overflow-hidden"
                style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
                <div className="animate-vertical-scroll flex flex-col">
                  {[...aiTools, ...aiTools].map((tool, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl mb-3 flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ color: '#8A8F98' }}>{tool.icon}</div>
                      <p className="text-sm font-medium text-[#EDEDEF]">{tool.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Getting started ──────────────────────────────── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <SectionLabel color="#5E6AD2">Get Started</SectionLabel>
              <SectionHeading>{t('landing.teachersGetStarted')}</SectionHeading>
              <SectionSub>{t('landing.teachersGetStartedDesc')}</SectionSub>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger(0.09)}>
              {[
                { num: '01', title: t('landing.step1Title'), desc: t('landing.step1Desc'), icon: <PlusCircle className="w-5 h-5" /> },
                { num: '02', title: t('landing.step2Title'), desc: t('landing.step2Desc'), icon: <BookOpen className="w-5 h-5" /> },
                { num: '03', title: t('landing.step3Title'), desc: t('landing.step3Desc'), icon: <Users className="w-5 h-5" /> },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp(i * 0.07)} whileHover={CARD_HOVER} whileTap={CARD_TAP}
                  className="relative flex flex-col items-center p-8 rounded-2xl text-center overflow-hidden group cursor-default"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(94,106,210,0.14), transparent 60%)' }} />
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold tracking-widest mb-4" style={{ color: '#5E6AD2' }}>{step.num}</p>
                    <div className="w-11 h-11 mb-5 rounded-xl flex items-center justify-center mx-auto"
                      style={{ background: 'rgba(94,106,210,0.14)', color: '#7B8FE8' }}>
                      {step.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-[#EDEDEF] mb-2">{step.title}</h3>
                    <p className="text-xs text-[#8A8F98] leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
              className="flex justify-center mt-12">
              <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(94,106,210,0.50)' }} whileTap={{ scale: 0.97 }}
                onClick={toLogin} className="flex items-center gap-2 px-10 py-4 rounded-2xl text-sm font-semibold cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#5E6AD2,#7B8FE8)', color: '#fff', boxShadow: '0 4px 24px rgba(94,106,210,0.38)' }}>
                {t('landing.getStartedFree')} <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </section>

          {/* ── Measurable results ───────────────────────────── */}
          <section id="impact" className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <SectionLabel color="#10b981">Impact</SectionLabel>
                <SectionHeading>{t('landing.measurableResults')}</SectionHeading>
                <SectionSub>{t('landing.measurableResultsDesc')}</SectionSub>
              </div>
              <div className="space-y-5">
                <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: EXPO }}
                  className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
                  <ChartCard title={t('landing.teacherTimeSavings')} value="+180mins" valueColor="text-emerald-400"
                    data={[{ name: 'D1', val: 22 }, { name: 'D2', val: 50 }, { name: 'D3', val: 80 }, { name: 'D4', val: 120 }, { name: 'D5', val: 160 }, { name: 'D6', val: 175 }, { name: 'D7', val: 180 }, { name: 'D8', val: 180 }]}
                    color="#10b981" gradientId="timeSavings" maxValue={180} ticks={[0, 60, 120, 180]} />
                  <div className="grid grid-rows-2 gap-5">
                    <MetricCard title={t('landing.teacherSatisfaction')} value="95%" color="text-cyan-400" delay={0.12} />
                    <MetricCard title={t('landing.lessonPrepReduction')} value="60%" color="text-blue-400" delay={0.18} />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: EXPO, delay: 0.08 }}
                  className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
                  <ChartCard title={t('landing.studentEngagement')} value="+53%" valueColor="text-cyan-400"
                    data={[{ name: 'D1', val: 10 }, { name: 'D2', val: 15 }, { name: 'D3', val: 25 }, { name: 'D4', val: 30 }, { name: 'D5', val: 40 }, { name: 'D6', val: 45 }, { name: 'D7', val: 53 }, { name: 'D8', val: 53 }]}
                    color="#06b6d4" gradientId="engagement" maxValue={60} ticks={[0, 20, 40, 60]} />
                  <div className="grid grid-rows-2 gap-5">
                    <MetricCard title={t('landing.gradingSpeedup')} value="5X" color="text-violet-400" delay={0.22} />
                    <MetricCard title={t('landing.personalizationAccuracy')} value="91%" color="text-pink-400" delay={0.28} />
                  </div>
                </motion.div>
              </div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                className="text-[10px] text-[#8A8F98]/50 italic mt-8">
                {t('landing.estimatesDisclaimer')}
              </motion.p>
            </div>
          </section>

          {/* ── Privacy & security ───────────────────────────── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <SectionLabel color="#10b981">Trust & Safety</SectionLabel>
              <SectionHeading>{t('landing.privacySecurity')}</SectionHeading>
              <SectionSub>{t('landing.privacySecurityDesc')}</SectionSub>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger(0.07)}>
              {[
                { icon: <Shield />, title: t('landing.privacyFirstTitle'), description: t('landing.privacyFirstDesc') },
                { icon: <Lock />, title: t('landing.enterpriseSecurityTitle'), description: t('landing.enterpriseSecurityDesc') },
                { icon: <BrainCircuit />, title: t('landing.safeAITitle'), description: t('landing.safeAIDesc') },
                { icon: <Eye />, title: t('landing.transparencyTitle'), description: t('landing.transparencyDesc') },
              ].map((f, i) => <FeatureCard key={f.title} feature={f} index={i} accent="#10b981" />)}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
              className="mt-10 flex justify-center gap-3 flex-wrap">
              {[t('landing.ferpaCompliant'), t('landing.coppaCompliant')].map((badge) => (
                <div key={badge} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.28)', color: '#34d399' }}>
                  <CheckCircle className="w-3.5 h-3.5" />{badge}
                </div>
              ))}
            </motion.div>
          </section>

          {/* ── Testimonials ─────────────────────────────────── */}
          <section id="testimonials" className="py-16">
            <div className="text-center mb-12 px-4">
              <SectionLabel color="#9D4EDD">Social Proof</SectionLabel>
              <SectionHeading>{t('landing.lovedByTeachersStudents')}</SectionHeading>
              <SectionSub>{t('landing.lovedByDesc')}</SectionSub>
            </div>
            <div className="group w-full overflow-hidden"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 7%, black 93%, transparent)' }}>
              <div className="flex w-max animate-infinite-scroll">
                {[...testimonials, ...testimonials].map((testimonial, i) => (
                  <div key={i} className="w-[340px] flex-shrink-0 px-2.5">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Pricing ──────────────────────────────────────── */}
          <section id="pricing" className="px-4 py-20 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <SectionLabel color="#5E6AD2">Pricing</SectionLabel>
              <SectionHeading>{t('landing.choosePlan')}</SectionHeading>
              <SectionSub>{t('landing.choosePlanDesc')}</SectionSub>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              <PricingCard plan={t('landing.freePlan')} price={t('landing.freePrice')}
                features={[t('landing.freeFeature1'), t('landing.freeFeature2'), t('landing.freeFeature3'), t('landing.freeFeature4'), t('landing.freeFeature5')]}
                cta={t('landing.startForFree')} onCtaClick={toLogin} />
              <PricingCard plan={t('landing.proPlan')} price={t('landing.proPrice')} isFeatured
                features={[t('landing.proFeature1'), t('landing.proFeature2'), t('landing.proFeature3'), t('landing.proFeature4'), t('landing.proFeature5')]}
                cta={t('landing.getStarted')} onCtaClick={toLogin} />
              <PricingCard plan={t('landing.schoolPlan')} price={t('landing.schoolPrice')}
                features={[t('landing.schoolFeature1'), t('landing.schoolFeature2'), t('landing.schoolFeature3'), t('landing.schoolFeature4'), t('landing.schoolFeature5'), t('landing.schoolFeature6'), t('landing.schoolFeature7')]}
                cta={t('landing.contactSales')} />
            </div>
          </section>

          {/* ── Contact ──────────────────────────────────────── */}
          <section id="contact" className="px-4 py-20 max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <SectionLabel color="#5E6AD2">Contact</SectionLabel>
              <SectionHeading>{t('landing.getInTouch')}</SectionHeading>
              <SectionSub>{t('landing.getInTouchDesc')}</SectionSub>
            </div>
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.52, ease: EXPO, delay: 0.1 }}>
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {success && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-4 rounded-xl flex items-center gap-3"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
                    <p className="text-sm" style={{ color: '#34d399' }}>{t('landing.thankYouMessage')}</p>
                  </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A8F98] mb-2">{t('landing.contactName')} *</label>
                      <input type="text" id="name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass} style={inputStyle}
                        onFocus={focusInput} onBlur={blurInput}
                        placeholder={t('landing.yourName')} required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A8F98] mb-2">{t('landing.contactEmail')} *</label>
                      <input type="email" id="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass} style={inputStyle}
                        onFocus={focusInput} onBlur={blurInput}
                        placeholder={t('landing.yourEmail')} required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A8F98] mb-2">{t('landing.contactSubject')}</label>
                    <input type="text" id="subject" value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={inputClass} style={inputStyle}
                      onFocus={focusInput} onBlur={blurInput}
                      placeholder={t('landing.contactSubjectPlaceholder')} />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A8F98] mb-2">{t('landing.contactMessage')} *</label>
                    <textarea id="message" rows={5} value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputClass} resize-none`} style={inputStyle}
                      onFocus={focusInput} onBlur={blurInput}
                      placeholder={t('landing.contactMessagePlaceholder')} required />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#5E6AD2,#7B8FE8)', color: '#fff', boxShadow: '0 4px 20px rgba(94,106,210,0.3)' }}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('landing.sending')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {t('landing.sendMessage')}
                      </span>
                    )}
                  </motion.button>
                  <p className="text-[11px] text-[#8A8F98]/60 text-center">
                    {t('landing.orEmailDirectly')}{' '}
                    <a href="mailto:contact@schoolace.ai" style={{ color: '#7B8FE8' }}
                      className="underline underline-offset-2 hover:text-[#9DAFF0] transition-colors">
                      contact@schoolace.ai
                    </a>
                  </p>
                </form>
              </div>
            </motion.div>
          </section>

        </main>
        <LandingFooter />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .bg-grid-subtle {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0);
          background-size: 28px 28px;
        }

        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-infinite-scroll { animation: infinite-scroll 18s linear infinite; }
        .group:hover .animate-infinite-scroll { animation-play-state: paused; }

        @keyframes vertical-scroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        .animate-vertical-scroll { animation: vertical-scroll 22s linear infinite; }
        .animate-vertical-scroll:hover { animation-play-state: paused; }

        html { scroll-behavior: smooth; color-scheme: dark; }

        @media (prefers-reduced-motion: reduce) {
          .animate-infinite-scroll,
          .animate-vertical-scroll { animation: none; }
        }
      `}</style>
    </div>
  );
}
