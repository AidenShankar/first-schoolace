import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, BookOpen, PenTool, BarChart, CheckCircle, GraduationCap, Brain, Sparkles, Users, Calendar, Activity, Crown, SlidersHorizontal, BrainCircuit, ShieldCheck, Mail, Edit, Linkedin, Shield, PlusCircle, Lock, Eye, Unlock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { User } from '@/entities/User';
import { Contact } from '@/entities/Contact';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '../components/i18n/useTranslation';
import LanguageSelector from '../components/i18n/LanguageSelector';
import AIPreviewSection from '../components/landing/AIPreviewSection';
import { TermsContent, PrivacyContent } from '../components/landing/LegalContent';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";

// --- Enhanced Atmospheric Effects ---

const AtmosphericBackground = () =>
  <div className="fixed inset-0 z-0 overflow-hidden">
    {/* Grid overlay */}
    <div className="absolute inset-0 opacity-30">
      <div className="h-full w-full bg-grid-pattern"></div>
    </div>
  </div>;


const ShootingStars = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [1, 0, 0, 1]);
  const stars = Array.from({ length: 0 }, (_, i) =>
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_15px_5px_white]"
      initial={{
        x: Math.random() * -200,
        y: Math.random() * window.innerHeight * 0.8,
        opacity: 0,
        scale: 0
      }}
      animate={{
        x: window.innerWidth + 200,
        y: Math.random() * window.innerHeight * 0.8 + 100,
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0]
      }}
      transition={{
        duration: Math.random() * 2 + 3,
        delay: Math.random() * 5 + i * 0.3,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear'
      }} />);
  return (
    <motion.div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ opacity }}>
      {stars}
    </motion.div>);

};

const FloatingOrbs = () => {
  const orbs = Array.from({ length: 0 }, (_, i) =>
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: [0.2, 0.8, 0.2]
      }}
      transition={{
        duration: Math.random() * 8 + 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2
      }} />);

  return <div className="fixed inset-0 z-5 pointer-events-none">{orbs}</div>;
};

// New floating particles for more ambient animation
const FloatingParticles = () => {
  const particles = Array.from({ length: 0 }, (_, i) =>
    <motion.div
      key={i}
      className="absolute w-0.5 h-0.5 bg-blue-300/30 rounded-full"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 20
      }}
      animate={{
        y: -20,
        x: Math.random() * window.innerWidth,
        opacity: [0, 0.6, 0]
      }}
      transition={{
        duration: Math.random() * 15 + 10,
        repeat: Infinity,
        delay: Math.random() * 10,
        ease: "linear"
      }} />);

  return <div className="fixed inset-0 z-5 pointer-events-none">{particles}</div>;
};

// Animated counter
const AnimatedCounter = ({ end, duration = 3, className, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      // Use Framer Motion's animate function
      const controls = animate(0, end, {
        duration: duration,
        ease: "easeIn", // This is the key change: starts slow, speeds up
        onUpdate(value) {
          setCount(Math.floor(value));
        }
      });

      // Return a cleanup function to stop the animation
      return () => controls.stop();
    }
  }, [isInView, end, duration]);

  return <span ref={ref} className={className}>{count}{suffix}</span>;
};

// Typewriter effect component
const TypewriterText = ({ text, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text) {
      let i = 0;
      setDisplayedText("");
      setIsComplete(false);
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
          setIsComplete(true);
        }
      }, 50);

      return () => clearInterval(intervalId);
    }
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
    </span>
  );
};

const HeaderNav = () => {
  const { t } = useTranslation();
  return (
    <nav className="hidden md:flex items-center gap-8">
      <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.forTeachers')}</a>
      <a href="#student-features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.forStudents')}</a>
      <a href="#co-pilot" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.aiCapabilities')}</a>
      <a href="#testimonials" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.testimonials')}</a>
      <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.pricing')}</a>
      <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.contact')}</a>
    </nav>
  );
};

const Header = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 backdrop-blur-sm bg-black/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Schoolace</span>
          </div>

          <HeaderNav />
        </div>
      </div>
    </header>);

};

// Enhanced pricing card with animated email reveal
const PricingCard = ({ plan, price, features, cta, isFeatured, isPrimary, linkTo, onCtaClick }) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showContactEmail, setShowContactEmail] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const { t } = useTranslation();

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleContactSales = () => {
    setShowContactEmail(true);
    const email = "contact@schoolace.org";
    let index = 0;
    const typewriter = setInterval(() => {
      if (index < email.length) {
        setTypewriterText(email.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriter);
      }
    }, 50);
  };

  // Split price into main and suffix
  const getPriceDisplay = () => {
    // Free tier: $0 USD \n / month
    if (price === t('landing.freePrice')) {
      return (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-extrabold text-white">$0</span>
            <span className="text-sm font-normal text-slate-400">USD</span>
          </div>
          <div className="text-base font-normal text-slate-300">/ month</div>
        </>
      );
    }

    // Pro tier: $21 / teacher / month
    if (price.includes('$21')) {
      return (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-extrabold text-white">$21</span>
            <span className="text-sm font-normal text-slate-400">USD</span>
          </div>
          <div className="text-base font-normal text-slate-300 mb-1">{price.replace('$21', '').trim()}</div>
        </>
      );
    }

    // School tier or any other
    return <div className="text-3xl font-extrabold text-white">{price}</div>;
  };


  // Determine button style based on plan
  const isGreyButton = plan === t('landing.freePlan') || plan === t('landing.schoolPlan');
  const buttonClassName = isGreyButton
    ? 'bg-slate-700 hover:bg-slate-600 text-white'
    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-2xl shadow-indigo-500/30';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={isFeatured ? handleMouseMove : undefined}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: 'spring' }}
      className={`relative p-8 rounded-2xl backdrop-blur-xl border overflow-hidden group ${isFeatured ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-900/40 border-slate-700/50'}`}>


      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-white">{plan}</h3>
          {isFeatured &&
            <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-500/20 px-2.5 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              {t('landing.mostPopular')}
            </span>
          }
        </div>

        <div className="mb-6 min-h-[120px] flex flex-col justify-center">
          {getPriceDisplay()}
        </div>

        {/* Features list - this will grow to fill available space */}
        <ul className="space-y-4 mb-8 flex-grow">
          {features.map((feature, i) =>
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          )}
        </ul>


        <div className="mt-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {onCtaClick ?
              <Button
                onClick={onCtaClick}
                className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${buttonClassName}`}>
                {cta}
                <ArrowRight className="w-5 h-5" />
              </Button> :
              linkTo ?
                <Link to={linkTo}>
                  <Button className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${buttonClassName}`}>
                    {cta}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link> :

                <Button
                  onClick={handleContactSales}
                  className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${buttonClassName}`}>
                  {cta}
                  <ArrowRight className="w-5 h-5" />
                </Button>
            }
          </motion.div>

          {/* Contact email reveal - only for school tier, positioned below button */}
          {showContactEmail &&
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-slate-800/80 rounded-lg border border-slate-600/50">

              <p className="text-sm text-slate-400 mb-2">Contact us at:</p>
              <p className="font-mono text-cyan-400">{typewriterText}</p>
            </motion.div>
          }
        </div>
      </div>
    </motion.div>);

};



const ChartCard = ({ title, value, valueColor, data, color, gradientId, isLineChart = false, maxValue, ticks }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (isInView && data.length > 0) {

      const duration = 6000;
      const startTime = Date.now();

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setAnimationProgress(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateProgress);
        }
      };

      // Small delay before starting
      const timeout = setTimeout(() => {
        requestAnimationFrame(animateProgress);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isInView, data.length]); // Fix: Removed 'end' and 'duration' from dependencies

  // Create animated data where values are interpolated based on progress
  const animatedData = data.map((point, index) => {
    const targetValue = point.val;
    const animatedValue = targetValue * animationProgress;
    return {
      ...point,
      val: animatedValue
    };
  });

  const match = value.match(/([+])?(\d+(\.\d+)?)(.*)/); // Modified regex to capture decimals
  let prefix = '';
  let number = 0;
  let suffix = '';

  if (match) {
    prefix = match[1] || '';
    number = parseFloat(match[2]); // Use parseFloat for decimal numbers
    suffix = match[4] || ''; // Adjusted index for suffix due to new capture group
  }

  return (
    <div ref={containerRef} className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-white text-lg">{title}</h4>
        <p className={`font-bold text-3xl ${valueColor}`}>
          {prefix}
          <AnimatedCounter end={number} duration={4.5} />
          {suffix}
        </p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {isLineChart ? (
            <LineChart data={animatedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /> {/* Added CartesianGrid to AreaChart */}
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0} />

              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, maxValue || 'dataMax + 5']}
                ticks={ticks} />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  color: '#f1f5f9',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold' }}
                cursor={{ stroke: 'rgba(100, 116, 139, 0.3)', strokeWidth: 2 }}
                formatter={(value) => [value.toFixed(2), '']} />

              <Line
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={3}
                dot={{ stroke: color, strokeWidth: 2, r: 4, fill: color }}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-out" />
            </LineChart>
          ) : (
            <AreaChart data={animatedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /> {/* Added CartesianGrid to AreaChart */}
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0} />

              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, maxValue || 'dataMax + 5']}
                ticks={ticks} />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  color: '#f1f5f9',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold' }}
                cursor={{ stroke: 'rgba(100, 116, 139, 0.3)', strokeWidth: 2 }}
                formatter={(value) => [value.toFixed(2), '']} />

              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                dot={false} // Only dots for LineChart, not AreaChart
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-out" />

            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>);

};



const MetricCard = ({ title, value, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: delay }}
      className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl backdrop-blur-md text-center">

      <p className={`text-4xl font-bold mb-2 ${color}`}>{value}</p>
      <p className="text-white font-bold text-lg">{title}</p>
    </motion.div>);

};

// Updated TestimonialCard component without individual entrance animations
const TestimonialCard = ({ testimonial }) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{
        scale: 1.03,
        y: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}
      className="group/card relative h-full p-8 rounded-2xl backdrop-blur-xl border overflow-hidden flex flex-col bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">

      {/* Mouse-following glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(350px at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.15), transparent 80%)`
        }} />

      {/* Animated glowing border */}
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-purple-500/30 to-indigo-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-sm"></div>
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-purple-500/20 to-indigo-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-grow mb-6">
          <blockquote className="text-slate-200 leading-relaxed italic" style={{ textShadow: '0 0 4px #fff' }}>
            "{testimonial.quote}"
          </blockquote>
        </div>
        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-700/50">
          {testimonial.imageUrl ?
            <img src={testimonial.imageUrl} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }} /> :

            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl
                              ${testimonial.role === 'Teacher' ? 'bg-indigo-600' : 'bg-purple-600'}
                              shadow-lg`}
              style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}>
              {testimonial.name.charAt(0)}
            </div>
          }
          <div>
            <p className="font-semibold text-white text-lg">{testimonial.name}</p>
            <p className="text-slate-400 text-sm">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>);

};


// A function to get the formatted date
const getFormattedDate = () => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

// TermsContent and PrivacyContent are imported from components/landing/LegalContent
const _unused = () => (
  <div>

    <h2>1. Eligibility and School Authorization</h2>
    <ul>
      <li><strong>Teachers and School Staff:</strong> You must be at least 18 years old and authorized by your school or educational institution to use SchoolAce on behalf of students.</li>
      <li><strong>Students:</strong> Student access must be authorized by the school. Students under 18 may only use the Platform under school supervision and with appropriate parental consent obtained by the school.</li>
      <li><strong>School Authorization Model:</strong> SchoolAce operates under school authorization. Schools are responsible for obtaining necessary parental consents and ensuring compliance with applicable laws.</li>
      <li>You are responsible for ensuring your use complies with all applicable laws, regulations, and school policies.</li>
export default function LandingPage() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormSuccess, setContactFormSuccess] = useState(false);

  // Google Analytics Integration
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined' && !window.gtag) {
      // Add gtag.js script
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-PPPFF547QK";
      document.head.appendChild(script);

      // Initialize dataLayer and gtag function
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-PPPFF547QK');
    }
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    setContactFormSubmitting(true);
    try {
      // Save to Contact entity instead of sending email
      await Contact.create({
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject || 'No subject provided',
        message: contactForm.message,
        status: 'new'
      });

      setContactFormSuccess(true);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => setContactFormSuccess(false), 5000);
    } catch (error) {
      console.error('Error saving contact form:', error);
      alert('Failed to send message. Please try again or email us directly, contact@schoolace.org');
    } finally {
      setContactFormSubmitting(false);
    }
  };

  const handleGetStartedClick = async () => {
    // The redirect URL should be the dashboard. The dashboard page itself handles
    // redirecting to the setup page if the user's setup is not complete.
    const redirectUrl = window.location.origin + createPageUrl('Dashboard');
    await base44.auth.redirectToLogin(redirectUrl);
  };

  const handleSignInClick = async () => {
    const redirectUrl = window.location.origin + createPageUrl('Dashboard');
    await base44.auth.redirectToLogin(redirectUrl);
  };

  const getTeacherFeatures = () => [
    { icon: <Bot />, title: t('landing.intelligentGrading'), description: t('landing.intelligentGradingDesc') },
    { icon: <BarChart />, title: t('landing.interactiveQuizzes'), description: t('landing.interactiveQuizzesDesc') },
    { icon: <BookOpen />, title: t('landing.dynamicAssignments'), description: t('landing.dynamicAssignmentsDesc') },
    { icon: <Calendar />, title: t('landing.smartScheduling'), description: t('landing.smartSchedulingDesc') },
    { icon: <Activity />, title: t('landing.realTimeProgress'), description: t('landing.realTimeProgressDesc') },
    { icon: <Sparkles />, title: t('landing.proactiveAIAgent'), description: t('landing.proactiveAIAgentDesc') }];



  const getStudentFeatures = () => [
    {
      icon: <Bot />,
      title: t('landing.individualizedStudyCompanion'),
      description: t('landing.individualizedStudyCompanionDesc'),
      isFeatured: true
    },
    {
      icon: <PenTool />,
      title: t('landing.aceModels'),
      description: t('landing.aceModelsDesc')
    },
    {
      icon: <Bot />,
      title: t('landing.longitudinalMemory'),
      description: t('landing.longitudinalMemoryDesc')
    },
    {
      icon: <Brain />,
      title: t('landing.checkYourUnderstanding'),
      description: t('landing.checkYourUnderstandingDesc')
    },
    {
      icon: <Users />,
      title: "ACE Spaces",
      description: "Experience the future of collaboration with AI-enhanced group chats where you can brainstorm, share files, and get instant tutoring together."}];
  
  const studentFeatures = getStudentFeatures();



  const getAIToolkitFeatures = () => [
    { icon: <PenTool />, title: t('landing.worksheetGeneration') },
    { icon: <BarChart />, title: t('landing.rubricCreation') },
    { icon: <BrainCircuit />, title: t('landing.quizGeneration') },
    { icon: <GraduationCap />, title: t('landing.reportCardComments') },
    { icon: <SlidersHorizontal />, title: t('landing.lessonPlanning') },
    { icon: <Edit />, title: t('landing.iepAssistance') },
    { icon: <Mail />, title: t('landing.emailDrafting') },
    { icon: <ShieldCheck />, title: t('landing.reportContent') }];
  
  const aiToolkitFeatures = getAIToolkitFeatures();



  const getTestimonials = () => [
    {
      quote: t('landing.testimonial1'),
      name: "Ethan Chen",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/a4476a942_Screenshot2025-10-14at74455PM.png"
    },
    {
      quote: t('landing.testimonial2'),
      name: "Jesse Alabi",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/c5f3f94c4_Screenshot2025-10-14at74303PM.png"
    },
    {
      quote: t('landing.testimonial3'),
      name: "Henry He",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/28d23dde8_Screenshot2025-10-14at74431PM.png"
    },
    {
      quote: t('landing.testimonial4'),
      name: "Dr. Kraver",
      role: t('roles.teacher')
    },
    {
      quote: t('landing.testimonial5'),
      name: "Kimoon Bae",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/754ea1c55_443E26B3-DC25-40FC-9A29-B1051EC523F5_1_201_a.jpg"
    },
    {
      quote: t('landing.testimonial6'),
      name: "Xiangting Ren",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/db05cdc6d_Screenshot2025-09-30at44716PM.png"
    },
    {
      quote: t('landing.testimonial7'),
      name: "Lexi Liu",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/200f24820_Screenshot2025-10-01at10742PM.png"
    },
    {
      quote: t('landing.testimonial8'),
      name: "Sophie He",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/45f8f2cf8_Screenshot2025-10-01at10931PM.png"
    },
    {
      quote: t('landing.testimonial9'),
      name: "Johnny Zhao",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/76f9da2e7_Screenshot2025-10-01at10830PM.png"
    },
    {
      quote: t('landing.testimonial10'),
      name: "David He",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/a8cd04160_Screenshot2025-12-31at95757PM.png"
    },
    {
      quote: t('landing.testimonial11'),
      name: "Jefferson Chen",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/6daf7e7fa_Screenshot2025-12-31at103321PM.png"
    },
    {
      quote: t('landing.testimonial12'),
      name: "Ethan Wang",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/4e2cb0da4_Screenshot2026-01-03at105645AM.png"
    },
    {
      quote: t('landing.testimonial13'),
      name: "Xiyao Zhou",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/f6f20006c_Screenshot2026-01-03at105653AM.png"
    },
    {
      quote: t('landing.testimonial14'),
      name: "Yohaan Narayanan",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/cc92e6bb9_Screenshot2026-02-17at64039PM.png"
    },
    {
      quote: t('landing.testimonial15'),
      name: "Anish Sarangee",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/6ddd3f8a0_Screenshot2026-01-03at120548PM.png"
    },
    {
      quote: t('landing.testimonial16'),
      name: "Rey Sadhu",
      role: t('roles.student'),
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687ed6bea54c832b17eb40bc/f6585736b_Screenshot2026-01-03at120832PM.png"
    }];
  
  const testimonials = getTestimonials();


  return (
    <div className="bg-gradient-to-br from-black via-slate-950 to-purple-950 text-white min-h-screen overflow-x-hidden relative">
      <AtmosphericBackground />
      <ShootingStars />
      <FloatingOrbs />
      <FloatingParticles />

      {/* Fixed Sign In Button and Language Selector - Outside Header */}
      <div className="fixed top-6 right-2 sm:right-4 lg:right-6 z-[100] flex items-center gap-3">
        <LanguageSelector />
        <Button
          variant="default"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6 py-3 shadow-2xl shadow-indigo-500/50 border-0 text-base rounded-xl"
          onClick={handleSignInClick}>

          {t('landing.signIn')}
        </Button>
      </div>

      <div className="relative z-20">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="px-6 py-12 text-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8">

              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-center">
                <TypewriterText
                  text={t('landing.heroTitle')}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-300 whitespace-nowrap" />


              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-2">
                {t('landing.heroSubtitle').split('{aceAI}')[0]}
                <strong className="font-bold text-2xl text-white">ACE AI</strong>
                {t('landing.heroSubtitle').split('{aceAI}')[1] || ''}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-2xl font-bold text-white max-w-3xl mx-auto leading-relaxed mb-8">
                {t('landing.heroTagline')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="flex justify-center">
                <Button
                  onClick={handleGetStartedClick}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 rounded-full px-10 py-6 text-lg font-semibold shadow-2xl shadow-indigo-500/30">
                  {t('landing.getStartedFree')} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

          </section>



          {/* 1. Teacher Features Section */}
          <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4">

                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  {t('landing.coPilotForTeachers')}
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2 }} className="text-slate-300 text-lg max-w-2xl mx-auto">{t('landing.coPilotDesc')}


              </motion.p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getTeacherFeatures().map((feature, index) =>
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1
                  }}
                  // Keep only the hover animations fast
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: {
                      duration: 0.2, // Fast hover entry
                      ease: "easeOut",
                      type: "tween"
                    }
                  }}
                  // Fast exit when not hovering
                  animate={{
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: 0.15, // Fast exit animation
                      ease: "easeInOut",
                      type: "tween"
                    }
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  className="relative bg-slate-900/40 border border-slate-700/50 p-8 rounded-2xl backdrop-blur-xl overflow-hidden group"
                  style={{
                    transformOrigin: "center",
                    willChange: "transform, opacity"
                  }}>

                  {/* Rest of your component stays the same */}
                  <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                  <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-purple-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <motion.div
                      className="flex items-center justify-center w-14 h-14 mb-5 bg-slate-800/80 rounded-xl text-purple-400 group-hover:text-purple-300 transition-all duration-300 backdrop-blur-sm"
                      whileHover={{
                        scale: 1.1,
                        transition: {
                          duration: 0.6,
                          ease: "easeInOut"
                        }
                      }}
                      animate={{
                        rotate: 0,
                        scale: 1,
                        transition: {
                          duration: 0.3, // Quick rotation back
                          ease: "easeOut"
                        }
                      }}
                      style={{
                        transformOrigin: "center",
                        filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))'
                      }}>

                      {React.cloneElement(feature.icon, { className: "w-7 h-7" })}
                    </motion.div>

                    <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-white group-hover:text-white transition-colors" style={{ textShadow: '0 0 4px #fff' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center mt-12">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl px-8 py-4 backdrop-blur-xl flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-slate-800/80 rounded-xl">
                  <Unlock className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-slate-300 text-lg font-medium">
                  {t('landing.signInToDiscover')}
                </p>
              </div>
            </motion.div>
          </section>

          {/* 2. Student AI Toolkit Section */}
          <section id="student-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">{t('landing.studyCompanionForStudents')}</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-lg max-w-2xl mx-auto">
                {t('landing.studyCompanionDesc')}
              </motion.p>
            </div>

            {/* Large Horizontal Featured Card - Top */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.05, // Changed from 1.02
                y: -10, // Changed from -5
                transition: { duration: 0.2, ease: "easeOut", type: "tween" }
              }}
              animate={{
                scale: 1,
                y: 0,
                transition: { duration: 0.15, ease: "easeInOut", type: "tween" }
              }}
              whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              className="relative bg-slate-900/40 border border-slate-700/50 py-16 px-12 rounded-2xl backdrop-blur-xl overflow-hidden group"
              style={{ transformOrigin: "center", willChange: "transform, opacity" }}>

              <div className="absolute -inset-px bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-pink-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="absolute -inset-px bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-pink-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 flex items-center gap-8">
                <motion.div
                  className="flex items-center justify-center w-20 h-20 bg-slate-800/80 rounded-xl text-purple-400 group-hover:text-purple-300 transition-all duration-300 backdrop-blur-sm"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))' }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.6, ease: "easeInOut" } }}
                  animate={{ rotate: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }}>

                  <Bot className="w-10 h-10" />
                </motion.div>

                <div className="flex-grow">
                  <h3 className="text-3xl font-bold text-slate-100 mb-4 group-hover:text-white transition-colors">
                    {t('landing.individualizedStudyCompanion')}
                  </h3>
                  <p className="text-white group-hover:text-white transition-colors text-lg leading-relaxed" style={{ textShadow: '0 0 4px #fff' }}>{t('landing.individualizedStudyCompanionDesc')}

                  </p>
                </div>
              </div>
            </motion.div>

            {/* 2x2 Grid of Smaller Cards - Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {getStudentFeatures().slice(1).map((feature, index) =>
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.2, ease: "easeOut", type: "tween" }
                  }}
                  animate={{
                    scale: 1,
                    y: 0,
                    transition: { duration: 0.15, ease: "easeInOut", type: "tween" }
                  }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                  className="relative bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-xl overflow-hidden group"
                  style={{ transformOrigin: "center", willChange: "transform, opacity" }}>

                  <div className="absolute -inset-px bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-pink-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                  <div className="absolute -inset-px bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-pink-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 mb-4 bg-slate-800/80 rounded-xl text-purple-400 group-hover:text-purple-300 transition-all duration-300 backdrop-blur-sm"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))' }}
                      whileHover={{ scale: 1.1, transition: { duration: 0.6, ease: "easeInOut" } }}
                      animate={{ rotate: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }}>

                      {React.cloneElement(feature.icon, { className: "w-6 h-6" })}
                    </motion.div>

                    <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-white group-hover:text-white transition-colors" style={{ textShadow: '0 0 4px #fff' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center mt-12">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl px-8 py-4 backdrop-blur-xl flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-slate-800/80 rounded-xl">
                  <Unlock className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-slate-300 text-lg font-medium">
                  {t('landing.signInToDiscover')}
                </p>
              </div>
            </motion.div>
          </section>

          {/* AI Interface Preview Section */}
          <section className="py-8 relative z-30 mb-16">
            <AIPreviewSection />
          </section>

          {/* 3. AI Co-Pilot Section */}
          <section id="co-pilot" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-3">

                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 inline-block w-24">
                    <AnimatedCounter end={30} duration={3} suffix="+" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                    {t('landing.productivityTools')}
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.2 }} className="text-slate-300 mb-8 text-lg leading-relaxed">{t('landing.productivityToolsDesc')}


              </motion.p>
              </div>

              {/* Continuous Vertical Scroll for AI Tools */}
              <div className="relative h-[400px] overflow-hidden">
                <div className="animate-vertical-scroll-seamless-loop flex flex-col">
                  {/* First complete set */}
                  {getAIToolkitFeatures().map((tool, i) =>
                    <motion.div
                      key={`tool-1-${tool.title}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-700/50 rounded-lg backdrop-blur-md hover:bg-slate-800/50 transition-all duration-300 flex-shrink-0 mb-4">

                      <div
                        className="text-white"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))' }}>

                        {tool.icon}
                      </div>
                      <p
                        className="text-white font-medium text-sm"
                        style={{ textShadow: '0 0 6px #fff' }}>

                        {tool.title}
                      </p>
                    </motion.div>
                  )}
                  {/* Second complete set for seamless loop */}
                  {getAIToolkitFeatures().map((tool, i) =>
                    <div
                      key={`tool-2-${tool.title}`}
                      className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-700/50 rounded-lg backdrop-blur-md hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex-shrink-0 mb-4">

                      <div
                        className="text-white"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))' }}>

                        {tool.icon}
                      </div>
                      <p
                        className="text-white font-medium text-sm"
                        style={{ textShadow: '0 0 6px #fff' }}>

                        {tool.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  {t('landing.teachersGetStarted')}
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2 }} className="text-slate-300 text-lg max-w-2xl mx-auto">{t('landing.teachersGetStartedDesc')}


              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  number: "1",
                  title: t('landing.step1Title'),
                  description: t('landing.step1Desc'),
                  icon: <PlusCircle className="w-8 h-8" />
                },
                {
                  number: "2",
                  title: t('landing.step2Title'),
                  description: t('landing.step2Desc'),
                  icon: <BookOpen className="w-8 h-8" />
                },
                {
                  number: "3",
                  title: t('landing.step3Title'),
                  description: t('landing.step3Desc'),
                  icon: <Users className="w-8 h-8" />
                }].
                map((step, index) =>
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative flex flex-col items-center p-8 bg-slate-900/40 border border-slate-700/50 rounded-xl backdrop-blur-md hover:bg-slate-800/50 transition-all duration-300 group">

                    {/* Blue gradient borders on hover */}
                    <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                    <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-purple-500/0 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      <motion.div
                        className="flex items-center justify-center w-16 h-16 mb-4 bg-slate-800/80 rounded-xl text-indigo-400 group-hover:text-indigo-300 transition-all duration-300 backdrop-blur-sm relative z-10"
                        whileHover={{
                          scale: 1.1,
                          transition: {
                            duration: 0.6,
                            ease: "easeInOut"
                          }
                        }}
                        animate={{
                          rotate: 0,
                          scale: 1,
                          transition: {
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }}
                        style={{
                          transformOrigin: "center",
                          filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))'
                        }}>
                        {React.cloneElement(step.icon, { className: "w-8 h-8" })}
                      </motion.div>

                      {/* Title */}
                      <h3
                        className="text-2xl mb-3 text-lg font-bold relative z-10"
                        style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.3)' }}>
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300 text-center text-sm leading-relaxed relative z-10">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center mt-12">
              <Button
                onClick={handleGetStartedClick}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 rounded-full px-12 py-6 text-xl font-semibold shadow-2xl shadow-indigo-500/30">
                {t('landing.getStartedFree')} <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </section>

          {/* Measurable Results Section */}
          <section id="impact" className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-cyan-300">
                  {t('landing.measurableResults')}<sup className="text-2xl text-white"></sup>
                </h2>
                <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                  {t('landing.measurableResultsDesc')}
                </p>
              </motion.div>

              <div className="mt-16 space-y-8">
                {/* First Row: Time Savings Chart + First Two Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">

                  <ChartCard
                    title={t('landing.teacherTimeSavings')}
                    value="+180mins"
                    valueColor="text-green-400"
                    data={[
                      { name: 'Day1', val: 22 }, { name: 'Day2', val: 50 },
                      { name: 'Day3', val: 80 }, { name: 'Day4', val: 120 },
                      { name: 'Day5', val: 160 }, { name: 'Day6', val: 175 },
                      { name: 'Day7', val: 180 }, { name: 'Day8', val: 180 },
                    ]}
                    color="#10b981"
                    gradientId="timeSavingsGradient"
                    maxValue={180}
                    ticks={[0, 30, 60, 90, 120, 150, 180]}
                  />

                  <div className="grid grid-rows-2 gap-6">
                    <MetricCard
                      title={t('landing.teacherSatisfaction')}
                      value="95%"
                      color="text-cyan-300"
                      delay={0.3}
                    />

                    <MetricCard
                      title={t('landing.lessonPrepReduction')}
                      value="60%"
                      color="text-blue-400"
                      delay={0.4}
                    />
                  </div>
                </motion.div>

                {/* Second Row: Engagement Chart + Last Two Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">

                  <ChartCard
                    title={t('landing.studentEngagement')}
                    value="+53%"
                    valueColor="text-cyan-400"
                    data={[
                      { name: 'Day1', val: 10 }, { name: 'Day2', val: 15 },
                      { name: 'Day3', val: 25 }, { name: 'Day4', val: 30 },
                      { name: 'Day5', val: 40 }, { name: 'Day6', val: 45 },
                      { name: 'Day7', val: 53 }, { name: 'Day38', val: 53 },
                    ]}
                    color="#06b6d4"
                    gradientId="engagementGradient"
                    maxValue={60}
                    ticks={[0, 15, 30, 45, 60]}
                  />

                  <div className="grid grid-rows-2 gap-6">
                    <MetricCard
                      title={t('landing.gradingSpeedup')}
                      value="5X"
                      color="text-purple-400"
                      delay={0.5}
                    />

                    <MetricCard
                      title={t('landing.personalizationAccuracy')}
                      value="91%"
                      color="text-pink-400"
                      delay={0.6}
                    />
                  </div>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-sm text-slate-500 italic text-left mt-8">
                {t('landing.estimatesDisclaimer')}
              </motion.p>
            </div>
          </section>

          {/* Privacy & Security Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">{t('landing.privacySecurity')}</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-lg max-w-2xl mx-auto">
                {t('landing.privacySecurityDesc')}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Shield />,
                  title: t('landing.privacyFirstTitle'),
                  description: t('landing.privacyFirstDesc')
                },
                {
                  icon: <Lock />,
                  title: t('landing.enterpriseSecurityTitle'),
                  description: t('landing.enterpriseSecurityDesc')
                },
                {
                  icon: <BrainCircuit />,
                  title: t('landing.safeAITitle'),
                  description: t('landing.safeAIDesc')
                },
                {
                  icon: <Eye />,
                  title: t('landing.transparencyTitle'),
                  description: t('landing.transparencyDesc')
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.2, ease: "easeOut", type: "tween" }
                  }}
                  animate={{
                    scale: 1,
                    y: 0,
                    transition: { duration: 0.15, ease: "easeInOut", type: "tween" }
                  }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                  className="relative bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-xl overflow-hidden group"
                  style={{ transformOrigin: "center", willChange: "transform, opacity" }}
                >
                  <div className="absolute -inset-px bg-gradient-to-r from-green-500/0 via-green-500/50 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                  <div className="absolute -inset-px bg-gradient-to-r from-green-500/0 via-green-500/20 to-emerald-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 mb-4 bg-slate-800/80 rounded-xl text-green-400 group-hover:text-green-300 transition-all duration-300 backdrop-blur-sm"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))' }}
                      whileHover={{ scale: 1.1, transition: { duration: 0.6, ease: "easeInOut" } }}
                      animate={{ rotate: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }}
                    >
                      {React.cloneElement(feature.icon, { className: "w-6 h-6" })}
                    </motion.div>

                    <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-white group-hover:text-white transition-colors" style={{ textShadow: '0 0 4px #fff' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FERPA & COPPA Compliance Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12 flex justify-center gap-4"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full text-sm">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="font-bold text-green-300 text-xl">{t('landing.ferpaCompliant')}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full text-sm">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="font-bold text-green-300 text-xl">{t('landing.coppaCompliant')}</span>
              </div>
            </motion.div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-12">
            <div className="text-center mb-12 px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4">

                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  {t('landing.lovedByTeachersStudents')}
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-xl text-slate-400 max-w-3xl mx-auto">

                {t('landing.lovedByDesc')}
              </motion.p>
            </div>

            <div className="group w-full max-w-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max animate-infinite-scroll">
                {/* Render the testimonials twice for a seamless loop */}
                {getTestimonials().map((testimonial, index) =>
                  <div key={`testimonial-1-${index}`} className="w-[400px] flex-shrink-0 px-4">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                )}
                {getTestimonials().map((testimonial, index) =>
                  <div key={`testimonial-2-${index}`} className="w-[400px] flex-shrink-0 px-4">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 6. Pricing Section */}
          <section id="pricing" className="px-6 py-16 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16">

              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
                {t('landing.choosePlan')}
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                {t('landing.choosePlanDesc')}
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              <PricingCard
                plan={t('landing.freePlan')}
                price={t('landing.freePrice')}
                features={[
                  t('landing.freeFeature1'),
                  t('landing.freeFeature2'),
                  t('landing.freeFeature3'),
                  t('landing.freeFeature4'),
                  t('landing.freeFeature5')]
                }
                cta={t('landing.startForFree')}
                onCtaClick={handleGetStartedClick} />

              <PricingCard
                plan={t('landing.proPlan')}
                price={t('landing.proPrice')}
                features={[
                  t('landing.proFeature1'),
                  t('landing.proFeature2'),
                  t('landing.proFeature3'),
                  t('landing.proFeature4'),
                  t('landing.proFeature5')]
                }
                cta={t('landing.getStarted')}
                isFeatured
                onCtaClick={handleGetStartedClick} />

              <PricingCard
                plan={t('landing.schoolPlan')}
                price={t('landing.schoolPrice')}
                features={[
                  t('landing.schoolFeature1'),
                  t('landing.schoolFeature2'),
                  t('landing.schoolFeature3'),
                  t('landing.schoolFeature4'),
                  t('landing.schoolFeature5'),
                  t('landing.schoolFeature6'),
                  t('landing.schoolFeature7')]
                }
                cta={t('landing.contactSales')} />

            </div>
          </section>

          {/* Contact Form Section */}
          <section id="contact" className="px-6 py-16 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
                {t('landing.getInTouch')}
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                {t('landing.getInTouchDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}>

              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                {contactFormSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-300">{t('landing.thankYouMessage')}</p>
                  </motion.div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('landing.contactName')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={t('landing.yourName')}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('landing.contactEmail')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={t('landing.yourEmail')}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      {t('landing.contactSubject')}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={t('landing.contactSubjectPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      {t('landing.contactMessage')}
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder={t('landing.contactMessagePlaceholder')}
                      required
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={contactFormSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 rounded-xl py-6 text-lg font-semibold shadow-2xl shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                      {contactFormSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t('landing.sending')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Mail className="w-5 h-5" />
                          {t('landing.sendMessage')}
                        </span>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-sm text-slate-400 text-center">
                    {t('landing.orEmailDirectly')} {' '}
                    <a href="mailto:contact@schoolace.org" className="text-indigo-400 hover:text-indigo-300 underline">
                      contact@schoolace.org
                    </a>
                  </p>
                </form>
              </div>
            </motion.div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative pt-12 pb-8 bg-black/20 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Top section with columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Column 1: Logo & Tagline */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">Schoolace</span>
                </div>
                <p className="text-slate-400 text-sm">Education, Supercharged by ACE AI</p>
              </div>

              {/* Column 2: Platform */}
              <div>
                <h4 className="font-semibold text-white mb-4">{t('landing.platformTitle')}</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.forTeachers')}</a></li>
                  <li><a href="#student-features" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.forStudents')}</a></li>
                  <li><a href="#co-pilot" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.aiCapabilities')}</a></li>
                </ul>
              </div>

              {/* Column 3: Company */}
              <div>
                <h4 className="font-semibold text-white mb-4">{t('landing.companyTitle')}</h4>
                <ul className="space-y-3">
                  <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.testimonials')}</a></li>
                  <li><a href="mailto:contact@schoolace.org" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.contact')}</a></li>
                </ul>
              </div>

              {/* Column 4: Legal */}
              <div>
                <h4 className="font-semibold text-white mb-4">{t('landing.legalTitle')}</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to={createPageUrl('TermsOfService')} className="text-slate-400 hover:text-white transition-colors text-sm">
                      {t('landing.termsOfService')}
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-400 hover:text-white transition-colors text-sm">
                      {t('landing.privacyPolicy')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Middle section with status and badges */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-full text-sm">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300">{t('landing.allSystemsOperational')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium text-sm">{t('landing.ferpaCompliant')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium text-sm">{t('landing.coppaCompliant')}</span>
                </div>
              </div>
            </div>

            {/* Bottom section with copyright and social links */}
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-center">
              <p className="text-slate-500 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} {t('landing.copyright')}
              </p>
              <div className="flex justify-center items-center gap-6">
                <a href="https://www.linkedin.com/company/schoolace/about/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        @keyframes float-2 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-120deg); }
          66% { transform: translate(20px, -20px) rotate(-240deg); }
        }

        @keyframes float-3 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(20px, 20px) rotate(90deg); }
          66% { transform: translate(-30px, -10px) rotate(180deg); }
        }

        @keyframes float-4 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(-20px, -20px) rotate(-90deg); }
          66% { transform: translate(30px, 10px) rotate(180deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }

        @keyframes slide-diagonal {
          0% { transform: translate(-100px) translateY(-100px) rotate(45deg); }
          100% { transform: translateX(100px) translateY(100px) rotate(45deg); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes border-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes border-comet {
          0% { transform: translate(-50%, -110%) rotate(0deg); }
          25% { transform: translate(calc(100% + 10px), -50%) rotate(90deg); }
          50% { transform: translate(calc(50%), calc(100% + 10px)) rotate(180deg); }
          75% { transform: translate(-110%, 50%) rotate(270deg); }
          100% { transform: translate(-50%, -110%) rotate(360deg); }
        }

        .animate-float-1 { animation: float-1 20s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 25s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 18s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 22s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
        .animate-slide-diagonal { animation: slide-diagonal 8s linear infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; background-size: 200% 200%; }
        .animate-border-spin { animation: border-spin 3s linear infinite; }
        .animate-border-comet { animation: border-comet 4s linear infinite; }

        .bg-grid-pattern {
          --grid-color: rgba(200, 200, 255, 0.07);
          background-image: radial-gradient(circle at 1px 1px, var(--grid-color) 1px, transparent 0);
          background-size: 20px 20px;
        }
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .animate-infinite-scroll {
          animation: infinite-scroll 13s linear infinite;
        }

        .group:hover .animate-infinite-scroll {
            animation-play-state: paused;
        }

        /* Updated vertical scroll for seamless loop */
        @keyframes vertical-scroll-seamless-loop {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .animate-vertical-scroll-seamless-loop {
          animation: vertical-scroll-seamless-loop 20s linear infinite;
        }

        .animate-vertical-scroll-seamless-loop:hover {
          animation-play-state: paused;
        }
        html {
            scroll-behavior: smooth;
        }
      `}</style>
    </div>);
}