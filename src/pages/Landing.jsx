import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/landing-new/Navbar';
import { Hero } from '@/components/landing-new/Hero';
import { Problem } from '@/components/landing-new/Problem';
import { ForEducators } from '@/components/landing-new/ForEducators';
import { ForStudents } from '@/components/landing-new/ForStudents';
import { AIToolkit } from '@/components/landing-new/AIToolkit';
import { Traction } from '@/components/landing-new/Traction';
import { Testimonials } from '@/components/landing-new/Testimonials';
import { Pricing } from '@/components/landing-new/Pricing';
import { Privacy } from '@/components/landing-new/Privacy';
import { GettingStarted } from '@/components/landing-new/GettingStarted';
import { FinalCTA } from '@/components/landing-new/FinalCTA';
import { Footer } from '@/components/landing-new/Footer';
import { ContactModal } from '@/components/landing-new/ContactModal';

const SIGNIN_URL = '/login?next=/Dashboard';

export default function Landing() {
  const [contactOpen, setContactOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = contactOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [contactOpen]);

  return (
    <div className="landing-new-root min-h-screen bg-black text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar onContactOpen={() => setContactOpen(true)} signinUrl={SIGNIN_URL} />
      <Hero onContactOpen={() => setContactOpen(true)} signinUrl={SIGNIN_URL} />
      <Problem />
      <ForEducators />
      <ForStudents />
      <AIToolkit />
      <Traction />
      <Testimonials />
      <Pricing onContactOpen={() => setContactOpen(true)} signinUrl={SIGNIN_URL} />
      <Privacy />
      <GettingStarted signinUrl={SIGNIN_URL} />
      <FinalCTA onContactOpen={() => setContactOpen(true)} signinUrl={SIGNIN_URL} />
      <Footer />

      <AnimatePresence>
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}