import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator, Sigma, MoveDown, CheckCircle2, Sparkles, Variable } from 'lucide-react';

export default function NthPartialSum() {
  const steps = [
    {
      id: 1,
      title: "Write the Sum Forward",
      description: "Start by writing the sum S_n using the first term a_1 and the common difference d.",
      math: (
        <div className="text-xl md:text-2xl font-mono text-slate-700">
          S<sub>n</sub> = a<sub>1</sub> + (a<sub>1</sub> + d) + (a<sub>1</sub> + 2d) + ... + (a<sub>n</sub> - d) + a<sub>n</sub>
        </div>
      ),
      icon: <ArrowRight className="w-6 h-6 text-indigo-500" />
    },
    {
      id: 2,
      title: "Write the Sum Backward",
      description: "Write the exact same sum, but start with the last term (a_n) and go backwards, subtracting d each time.",
      math: (
        <div className="text-xl md:text-2xl font-mono text-slate-700">
          S<sub>n</sub> = a<sub>n</sub> + (a<sub>n</sub> - d) + (a<sub>n</sub> - 2d) + ... + (a<sub>1</sub> + d) + a<sub>1</sub>
        </div>
      ),
      icon: <MoveDown className="w-6 h-6 text-purple-500" />
    },
    {
      id: 3,
      title: "Add the Equations",
      description: "This is the 'magic' step. We line up the terms vertically and add them. The +d and -d terms cancel out!",
      math: (
        <div className="flex flex-col items-center gap-4 w-full overflow-x-auto pb-4">
            <div className="flex flex-col items-start font-mono text-lg md:text-xl text-slate-600 border-b-2 border-slate-300 pb-2 mb-2 w-full min-w-max">
                <div>&nbsp;&nbsp;S<sub>n</sub> = a<sub>1</sub> + (a<sub>1</sub> + d) + ... + (a<sub>n</sub> - d) + a<sub>n</sub></div>
                <div>+ S<sub>n</sub> = a<sub>n</sub> + (a<sub>n</sub> - d) + ... + (a<sub>1</sub> + d) + a<sub>1</sub></div>
            </div>
            <div className="text-xl md:text-3xl font-bold text-indigo-700 min-w-max">
                2S<sub>n</sub> = (a<sub>1</sub> + a<sub>n</sub>) + (a<sub>1</sub> + a<sub>n</sub>) + ... + (a<sub>1</sub> + a<sub>n</sub>)
            </div>
        </div>
      ),
      icon: <Calculator className="w-6 h-6 text-pink-500" />
    },
    {
      id: 4,
      title: "Simplify",
      description: "Since there are n terms in the sequence, you now have the term (a_1 + a_n) added to itself n times.",
      math: (
        <div className="text-2xl md:text-4xl font-bold text-slate-800 font-mono">
          2S<sub>n</sub> = n(a<sub>1</sub> + a<sub>n</sub>)
        </div>
      ),
      icon: <Variable className="w-6 h-6 text-amber-500" />
    },
    {
      id: 5,
      title: "Solve for S_n",
      description: "Divide both sides by 2 to get the final formula.",
      math: (
        <div className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-2">
          S<sub>n</sub> = <span className="inline-block align-middle text-center"><span className="block border-b-2 border-current">n(a<sub>1</sub> + a<sub>n</sub>)</span><span className="block">2</span></span>
        </div>
      ),
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24">
      {/* Hero Section */}
      <div className="relative bg-[#0F172A] text-white overflow-hidden pb-24 pt-24 px-4">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute top-[20%] right-[30%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-indigo-200 mb-6 backdrop-blur-sm">
              <Sigma className="w-3 h-3" />
              <span>Mathematical Proof</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200 leading-tight">
              Direct Prove: nth Partial Sum of Arithmetic Sequence
            </h1>
            <p className="text-xl text-indigo-200/80 max-w-2xl mx-auto mb-8 font-light">
              The "Reverse and Add" Method (Gauss's Trick)
            </p>
          </motion.div>
        </div>
      </div>

      {/* Proof Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 space-y-8">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Step Indicator & Icon */}
              <div className="bg-slate-50/80 p-6 md:w-24 flex md:flex-col items-center justify-between md:justify-start gap-4 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 shadow-sm">
                  {step.id}
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {step.description}
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex items-center justify-center overflow-x-auto">
                  {step.math}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Footer Note */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-slate-400 text-sm py-12"
        >
            <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Powered by ACE AI</span>
            </div>
            <p>Mastering arithmetic sequences one step at a time.</p>
        </motion.div>
      </div>
    </div>
  );
}