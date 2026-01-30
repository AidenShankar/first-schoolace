export const themes = [
  {
    id: 'default',
    name: 'Default',
    type: 'light',
    colors: {
      '--app-bg-from': '#f8fafc', // slate-50
      '--app-bg-via': '#eff6ff', // blue-50
      '--app-bg-to': '#eef2ff', // indigo-50
      '--header-bg-from': '#4f46e5', // indigo-600
      '--header-bg-via': '#9333ea', // purple-600
      '--header-bg-to': '#1d4ed8', // blue-700
      '--primary': '239 84% 67%', // indigo-500 (hsl)
      '--primary-foreground': '0 0% 100%',
      '--text-main': '#0f172a', // slate-900
      '--text-muted': '#64748b', // slate-500
      '--card-bg': '255 255 255', // white
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    type: 'dark',
    colors: {
      '--app-bg-from': '#0f172a', // slate-900
      '--app-bg-via': '#1e1b4b', // indigo-950
      '--app-bg-to': '#172554', // blue-950
      '--header-bg-from': '#312e81', // indigo-900
      '--header-bg-via': '#4c1d95', // violet-900
      '--header-bg-to': '#1e3a8a', // blue-900
      '--primary': '239 84% 67%', // indigo-400
      '--primary-foreground': '0 0% 100%',
      '--text-main': '#f8fafc', // slate-50
      '--text-muted': '#94a3b8', // slate-400
      '--card-bg': '30 41 59', // slate-800
    }
  },
  {
    id: 'serika',
    name: 'Serika',
    type: 'light',
    colors: {
      '--app-bg-from': '#e1e1e3', 
      '--app-bg-via': '#e1e1e3', 
      '--app-bg-to': '#d1d1d3', 
      '--header-bg-from': '#e2b714', // yellow
      '--header-bg-via': '#dca90e', 
      '--header-bg-to': '#d19d08', 
      '--primary': '47 88% 48%', // yellow
      '--primary-foreground': '0 0% 20%',
      '--text-main': '#323437', 
      '--text-muted': '#646669',
      '--card-bg': '255 255 255',
    }
  },
  {
    id: 'carbon',
    name: 'Carbon',
    type: 'dark',
    colors: {
      '--app-bg-from': '#313131', 
      '--app-bg-via': '#313131', 
      '--app-bg-to': '#2b2b2b', 
      '--header-bg-from': '#f66e0d', // orange
      '--header-bg-via': '#e55f00', 
      '--header-bg-to': '#cc5000', 
      '--primary': '25 95% 53%', // orange
      '--primary-foreground': '0 0% 100%',
      '--text-main': '#f5e6c8', 
      '--text-muted': '#b0a690',
      '--card-bg': '49 49 49',
    }
  },
  {
    id: 'blueberry',
    name: 'Blueberry',
    type: 'light',
    colors: {
      '--app-bg-from': '#dae0f5', 
      '--app-bg-via': '#dae0f5', 
      '--app-bg-to': '#cfd7f0', 
      '--header-bg-from': '#5c7da5', 
      '--header-bg-via': '#5c7da5', 
      '--header-bg-to': '#4f6d91', 
      '--primary': '213 28% 50%', 
      '--primary-foreground': '0 0% 100%',
      '--text-main': '#212b43', 
      '--text-muted': '#5c7da5',
      '--card-bg': '255 255 255',
    }
  },
  {
    id: 'miami',
    name: 'Miami',
    type: 'dark',
    colors: {
      '--app-bg-from': '#f35588', 
      '--app-bg-via': '#05dfd7', 
      '--app-bg-to': '#a3f7bf', 
      '--header-bg-from': '#f35588', 
      '--header-bg-via': '#05dfd7', 
      '--header-bg-to': '#f35588', 
      '--primary': '333 86% 64%', 
      '--primary-foreground': '0 0% 100%',
      '--text-main': '#ffffff', 
      '--text-muted': '#f0f0f0',
      '--card-bg': '0 0 0 0.5', // semi-transparent black
    }
  },
  {
    id: 'matrix',
    name: 'Matrix',
    type: 'dark',
    colors: {
      '--app-bg-from': '#000000', 
      '--app-bg-via': '#051a05', 
      '--app-bg-to': '#000000', 
      '--header-bg-from': '#003b00', 
      '--header-bg-via': '#008f11', 
      '--header-bg-to': '#003b00', 
      '--primary': '120 100% 28%', 
      '--primary-foreground': '120 100% 90%',
      '--text-main': '#00ff41', 
      '--text-muted': '#008f11',
      '--card-bg': '10 20 10',
    }
  }
];