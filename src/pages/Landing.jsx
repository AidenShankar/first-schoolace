import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, BookOpen, PenTool, BarChart, CheckCircle, GraduationCap, Brain, Sparkles, Users, Calendar, Activity, Crown, SlidersHorizontal, BrainCircuit, ShieldCheck, Mail, Edit, Linkedin, Shield, Lock, Eye, Unlock, Check, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Contact } from '@/entities/Contact';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '../components/i18n/useTranslation';
import LanguageSelector from '../components/i18n/LanguageSelector';
import AIPreviewSection from '../components/landing/AIPreviewSection';
import AwardCarouselModal from '../components/landing/AwardCarouselModal';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid
} from "recharts";

// --- Components ---

const HeaderNav = () => {
  const { t } = useTranslation();
  return (
    <nav className="hidden md:flex items-center gap-8">
      <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.features')}</a>
      <a href="#impact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.impact')}</a>
      <a href="#testimonials" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.testimonials')}</a>
      <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{t('landing.pricing')}</a>
    </nav>
  );
};

const Header = ({ onSignIn }) => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Schoolace</span>
        </div>

        <HeaderNav />

        <div className="flex items-center gap-4">
           <LanguageSelector />
           <Button 
            variant="ghost" 
            className="text-slate-300 hover:text-white hover:bg-white/10 hidden sm:flex"
            onClick={onSignIn}
          >
            {t('landing.signIn')}
          </Button>
          <Button 
            onClick={onSignIn}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            {t('landing.getStarted')}
          </Button>
        </div>
      </div>
    </header>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 group">
    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
      {React.cloneElement(icon, { className: "w-6 h-6 text-indigo-400 group-hover:text-indigo-300" })}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="text-center p-6 border-r border-slate-800 last:border-0">
    <div className="text-4xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</div>
  </div>
);

const PricingCard = ({ plan, price, features, cta, isFeatured, onCtaClick }) => (
  <div className={`relative p-8 rounded-3xl border flex flex-col h-full ${isFeatured ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'bg-slate-950 border-slate-800'}`}>
    {isFeatured && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
        Most Popular
      </div>
    )}
    <h3 className="text-lg font-medium text-slate-400 mb-2">{plan}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-white">{price}</span>
      {price !== 'Custom' && <span className="text-slate-500">/month</span>}
    </div>
    <ul className="space-y-4 mb-8 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-slate-300">
          <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    <Button 
      onClick={onCtaClick}
      className={`w-full py-6 rounded-xl font-semibold ${isFeatured ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
    >
      {cta}
    </Button>
  </div>
);

const Footer = ({ t }) => (
  <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Schoolace</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Empowering education with advanced AI. Streamlining workflows for teachers and personalized learning for students.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
            <li><a href="#impact" className="hover:text-indigo-400 transition-colors">Impact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
            <li><a href="mailto:contact@schoolace.org" className="hover:text-indigo-400 transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to={createPageUrl('PrivacyPolicy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to={createPageUrl('TermsOfService')} className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Schoolace Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="https://www.linkedin.com/company/schoolace/about/" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const { t } = useTranslation();
  const [showAwardModal, setShowAwardModal] = useState(false);

  const handleSignInClick = async () => {
    const redirectUrl = window.location.origin + createPageUrl('Dashboard');
    await base44.auth.redirectToLogin(redirectUrl);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30">
      <Header onSignIn={handleSignInClick} />

      <main className="pt-32">
        {/* Hero Section */}
        <section className="px-6 lg:px-8 max-w-7xl mx-auto text-center mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 cursor-pointer hover:bg-indigo-500/20 transition-colors" onClick={() => setShowAwardModal(true)}>
              <Crown className="w-4 h-4" />
              <span>Award Winning EdTech Platform</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Focus on Teaching, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Let AI Handle the Rest.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Schoolace is the all-in-one AI platform that automates grading, lesson planning, and administrative tasks while providing personalized tutoring for every student.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                onClick={handleSignInClick}
                className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold shadow-lg shadow-indigo-500/25 transition-all w-full sm:w-auto"
              >
                Start for Free
              </Button>
              <Button 
                variant="outline"
                className="h-12 px-8 rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-lg font-medium w-full sm:w-auto"
                onClick={() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See Impact
              </Button>
            </div>
          </motion.div>

          {/* AI Preview - Framed as a product shot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl shadow-indigo-500/10 overflow-hidden"
          >
             <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
             <AIPreviewSection />
          </motion.div>
        </section>

        {/* Trusted By / Stats */}
        <section className="border-y border-slate-800 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard value="180+" label="Mins Saved / Week" />
              <StatCard value="95%" label="Teacher Satisfaction" />
              <StatCard value="5x" label="Faster Grading" />
              <StatCard value="24/7" label="Student Support" />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Excel</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Comprehensive tools designed for modern educators and students, powered by advanced AI models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Bot />}
              title="AI Co-Pilot" 
              description="Your intelligent teaching assistant. Draft emails, create rubrics, and generate lesson plans in seconds."
            />
            <FeatureCard 
              icon={<Activity />}
              title="Automated Grading" 
              description="Instant, consistent grading for assignments and quizzes with detailed feedback for students."
            />
            <FeatureCard 
              icon={<Brain />}
              title="Personalized Tutoring" 
              description="Students get 24/7 access to an AI tutor that knows their curriculum and learning style."
            />
            <FeatureCard 
              icon={<BarChart />}
              title="Real-time Analytics" 
              description="Track student progress, identify learning gaps, and make data-driven decisions effortlessly."
            />
            <FeatureCard 
              icon={<ShieldCheck />}
              title="Enterprise Security" 
              description="FERPA and COPPA compliant. Your data is encrypted, secure, and never sold."
            />
             <FeatureCard 
              icon={<Users />}
              title="Classroom Management" 
              description="Streamline communication, scheduling, and resource sharing in one central hub."
            />
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-24 bg-slate-900/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Measurable Impact in <br />
                  <span className="text-indigo-400">Just One Week</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Schools using Schoolace report significant improvements in both teacher productivity and student engagement. Our platform pays for itself in time saved alone.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                       <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Drastic reduction in lesson prep time</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                       <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Increased student participation metrics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                       <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Higher accuracy in grading consistency</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                   <h3 className="font-semibold text-white">Efficiency Gains</h3>
                   <div className="text-xs text-slate-500">Last 30 Days</div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'W1', val: 20 }, { name: 'W2', val: 45 }, { name: 'W3', val: 75 }, { name: 'W4', val: 100 }
                    ]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                        itemStyle={{ color: '#818cf8' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg">Start for free, upgrade as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              plan="Free" 
              price="$0" 
              features={["Basic AI Tools", "Up to 3 Classes", "Manual Grading", "Community Support"]}
              cta="Get Started"
              onCtaClick={handleSignInClick}
            />
            <PricingCard 
              plan="Pro Teacher" 
              price="$21" 
              isFeatured={true}
              features={["Unlimited AI Tools", "Unlimited Classes", "Automated Grading", "Priority Support", "Advanced Analytics"]}
              cta="Start Free Trial"
              onCtaClick={handleSignInClick}
            />
            <PricingCard 
              plan="School / District" 
              price="Custom" 
              features={["Volume Discounts", "SSO Integration", "Admin Dashboard", "Dedicated Success Manager", "Custom AI Models"]}
              cta="Contact Sales"
              onCtaClick={() => window.location.href = "mailto:contact@schoolace.org"}
            />
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Educators & Students</h2>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-8">
             <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-slate-300 mb-6">"Schoolace has completely transformed how I manage my classroom. The AI grading alone saves me 10+ hours a week."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">K</div>
                  <div>
                    <div className="text-white font-medium">Dr. Kraver</div>
                    <div className="text-slate-500 text-sm">History Teacher</div>
                  </div>
                </div>
             </div>
             <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-slate-300 mb-6">"I was struggling with Chemistry until I started using the AI tutor. It explains things in a way that actually makes sense to me."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">E</div>
                  <div>
                    <div className="text-white font-medium">Ethan Chen</div>
                    <div className="text-slate-500 text-sm">Student</div>
                  </div>
                </div>
             </div>
             <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-slate-300 mb-6">"The personalized learning paths help me stay on top of my assignments and understand where I need to focus."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
                  <div>
                    <div className="text-white font-medium">Sophie He</div>
                    <div className="text-slate-500 text-sm">Student</div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-3xl p-12 relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Classroom?</h2>
               <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">Join thousands of educators and students who are already using Schoolace to achieve more.</p>
               <Button 
                onClick={handleSignInClick}
                className="h-14 px-10 rounded-full bg-white text-indigo-900 hover:bg-slate-100 text-lg font-bold transition-all"
              >
                Get Started Now
              </Button>
             </div>
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          </div>
        </section>

      </main>

      <Footer t={t} />

      {/* Award Modal */}
      {showAwardModal && <AwardCarouselModal onClose={() => setShowAwardModal(false)} />}
    </div>
  );
}