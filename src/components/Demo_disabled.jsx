import React, { useState } from 'react';
import { Home } from 'lucide-react';

export default function Demo() {
  const [loading, setLoading] = useState(true);
  const demoUrl = "https://mimir-internal-admin-7k6mnc7qga-uc.a.run.app/student-dashboard";

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 z-50 flex flex-col">
       
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