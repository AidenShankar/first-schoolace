import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home } from 'lucide-react';

export default function Demo() {
  const [loading, setLoading] = useState(true);
  const demoUrl = "https://mimir-internal-admin-7k6mnc7qga-uc.a.run.app/testbed-schoolace-admin/student-dashboard";

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 z-50 flex flex-col">
       {/* Top Bar overlay */}
       <div className="absolute top-0 left-0 w-full h-16 pointer-events-none z-20 flex items-center justify-between px-6 pt-4">
          <Link 
            to={createPageUrl('Landing')} 
            className="pointer-events-auto bg-black/50 backdrop-blur-md hover:bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all border border-white/10 shadow-lg group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Back to Schoolace</span>
          </Link>
          

       </div>

       {/* Loading State */}
       {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
             <p className="text-indigo-200 font-medium animate-pulse">Loading Interactive Demo...</p>
          </div>
        </div>
       )}

       <iframe 
         src={demoUrl}
         className={`w-full h-full border-0 transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
         onLoad={() => setLoading(false)}
         title="Schoolace Demo Dashboard"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
       />
    </div>
  );
}