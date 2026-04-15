import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Code, Brain, Lightbulb, Heart, ArrowLeft, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950 text-white">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 backdrop-blur-sm bg-black/30 border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SchoolACE</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            About the Founder
          </h1>
          <p className="text-slate-400 text-xl">The story behind SchoolACE</p>
        </motion.div>

        {/* Founder Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 md:p-12 backdrop-blur-xl mb-10"
        >
          {/* Avatar + Name */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 flex-shrink-0">
              <span className="text-5xl font-extrabold text-white">A</span>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-1">Aiden Shankar</h2>
              <p className="text-indigo-400 font-semibold text-lg mb-2">Founder & Developer, SchoolACE</p>
              <p className="text-slate-400 text-sm mb-3">Building the future of education with AI</p>
              <a
                href="https://www.linkedin.com/in/aidenshankar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 transition-all duration-200 text-sm font-medium"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>

          {/* Story Sections */}
          <div className="space-y-8">
            <StorySection
              icon={<Code className="w-6 h-6" />}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
              borderColor="border-cyan-500/20"
              title="A Passion for Coding Since Age 8"
              delay={0.3}
            >
              I've been coding since I was 8 years old. What started as curiosity, tinkering with simple programs and figuring out how things worked under the hood, quickly grew into a deep passion. Writing code wasn't just a hobby; it was a way of thinking, problem-solving, and creating things that didn't exist before.
            </StorySection>

            <StorySection
              icon={<Brain className="w-6 h-6" />}
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              borderColor="border-purple-500/20"
              title="Discovering AI & Machine Learning"
              delay={0.4}
            >
              As I got older, I discovered the world of AI and machine learning, and it completely changed the way I saw technology. The idea that you could build systems that learn, adapt, and improve over time was incredible to me. I dove deep into it, studying algorithms, experimenting with models, and continuously expanding my knowledge. My passion for technology only grew stronger.
            </StorySection>

            <StorySection
              icon={<Lightbulb className="w-6 h-6" />}
              color="text-yellow-400"
              bgColor="bg-yellow-500/10"
              borderColor="border-yellow-500/20"
              title="The Spark That Started SchoolACE"
              delay={0.5}
            >
              The idea for SchoolACE came during the summer when I took a step back and looked around me. I thought about my teachers spending countless hours on grading, lesson planning, and administrative tasks that pulled them away from actually teaching. And I thought about my friends, who were struggling in class, not because they weren't smart, but because they weren't getting personalized support or timely feedback.
            </StorySection>

            <StorySection
              icon={<Heart className="w-6 h-6" />}
              color="text-pink-400"
              bgColor="bg-pink-500/10"
              borderColor="border-pink-500/20"
              title="Building Something That Matters"
              delay={0.6}
            >
              I realized there was a real problem here, one that AI could genuinely solve. So I built SchoolACE: a platform that gives teachers back their time through AI-powered grading and tools, while giving every student the personalized learning companion they deserve. This isn't just a product — it's something I built because I care deeply about education and believe every student deserves the best support possible, regardless of class size or resources. That belief drives every feature we ship.
            </StorySection>
          </div>
        </motion.div>

        {/* Advisor Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 md:p-10 backdrop-blur-xl mb-10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Advisors</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 flex-shrink-0">
              <span className="text-3xl font-extrabold text-white">H</span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Hari Shankar</h3>
              <p className="text-emerald-400 font-semibold mb-2">Advisor</p>
              <a
                href="https://www.linkedin.com/in/haris-profile/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 transition-all duration-200 text-sm font-medium"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-slate-400 mb-6 text-lg">Ready to experience it yourself?</p>
          <Link to={createPageUrl('Landing')}>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl shadow-indigo-500/30 transition-all duration-300">
              Explore SchoolACE →
            </button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

function StorySection({ icon, color, bgColor, borderColor, title, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`flex gap-5 p-6 rounded-2xl border ${bgColor} ${borderColor}`}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} border ${borderColor} ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className={`text-lg font-bold mb-2 ${color}`}>{title}</h3>
        <p className="text-slate-300 leading-relaxed">{children}</p>
      </div>
    </motion.div>
  );
}