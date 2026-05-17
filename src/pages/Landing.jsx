import React from 'react';
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

export default function Landing() {
  return (
    <div className="landing-new-root min-h-screen bg-black text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <Hero />
      <Problem />
      <ForEducators />
      <ForStudents />
      <AIToolkit />
      <Traction />
      <Testimonials />
      <Pricing />
      <Privacy />
      <GettingStarted />
      <FinalCTA />
      <Footer />
    </div>
  );
}