// Helper to convert hex to HSL (approximate, for reference, but we will hardcode HSL for precision)
// Format: "H S% L%" (no commas, space separated)

export const themes = [
  {
    id: 'default',
    name: 'Default (Light)',
    type: 'light',
    colors: {
      // Main App Gradient (Hex/RGB for standard CSS vars is fine, but HSL is consistent)
      '--app-bg-from': '#f8fafc', // slate-50
      '--app-bg-via': '#eff6ff', // blue-50
      '--app-bg-to': '#eef2ff', // indigo-50
      
      // Header Gradient
      '--header-bg-from': '#4f46e5', // indigo-600
      '--header-bg-via': '#7c3aed', // violet-600
      '--header-bg-to': '#2563eb', // blue-600
      '--text-main-header': '#ffffff',

      // Shadcn UI Variables (HSL)
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '221.2 83.2% 53.3%', // indigo-600
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96.1%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96.1%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96.1%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '221.2 83.2% 53.3%',
      '--radius': '0.5rem',
      
      // Custom text vars for non-shadcn elements if needed
      '--text-main': '#0f172a',
      '--text-muted': '#64748b',
    }
  },
  {
    id: 'dark',
    name: 'Midnight (Dark)',
    type: 'dark',
    colors: {
      '--app-bg-from': '#0f172a', // slate-900
      '--app-bg-via': '#1e1b4b', // indigo-950
      '--app-bg-to': '#172554', // blue-950
      
      '--header-bg-from': '#312e81', // indigo-900
      '--header-bg-via': '#4c1d95', // violet-900
      '--header-bg-to': '#1e3a8a', // blue-900
      '--text-main-header': '#ffffff',

      '--background': '222.2 84% 4.9%', // slate-950
      '--foreground': '210 40% 98%', // slate-50
      '--card': '222.2 84% 4.9%', // slate-950 (or slightly lighter: 217 33% 17%)
      '--card-foreground': '210 40% 98%',
      '--popover': '222.2 84% 4.9%',
      '--popover-foreground': '210 40% 98%',
      '--primary': '217.2 91.2% 59.8%', // blue-500
      '--primary-foreground': '222.2 47.4% 11.2%',
      '--secondary': '217.2 32.6% 17.5%',
      '--secondary-foreground': '210 40% 98%',
      '--muted': '217.2 32.6% 17.5%',
      '--muted-foreground': '215 20.2% 65.1%',
      '--accent': '217.2 32.6% 17.5%',
      '--accent-foreground': '210 40% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '217.2 32.6% 17.5%',
      '--input': '217.2 32.6% 17.5%',
      '--ring': '212.7 26.8% 83.9%',
      '--radius': '0.5rem',

      '--text-main': '#f8fafc',
      '--text-muted': '#94a3b8',
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'light',
    colors: {
      '--app-bg-from': '#f0fdf4', // green-50
      '--app-bg-via': '#dcfce7', // green-100
      '--app-bg-to': '#f0fdfa', // teal-50
      
      '--header-bg-from': '#166534', // green-800
      '--header-bg-via': '#15803d', // green-700
      '--header-bg-to': '#0f766e', // teal-700
      '--text-main-header': '#ffffff',

      '--background': '150 30% 98%', 
      '--foreground': '160 50% 10%', 
      '--card': '0 0% 100%',
      '--card-foreground': '160 50% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '160 50% 10%',
      '--primary': '142 76% 36%', // green-600
      '--primary-foreground': '355.7 100% 97.3%',
      '--secondary': '150 30% 90%',
      '--secondary-foreground': '160 50% 10%',
      '--muted': '150 30% 90%',
      '--muted-foreground': '160 30% 40%',
      '--accent': '150 30% 90%',
      '--accent-foreground': '160 50% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '150 30% 85%',
      '--input': '150 30% 85%',
      '--ring': '142 76% 36%',
      '--radius': '0.5rem',

      '--text-main': '#052e16',
      '--text-muted': '#3f6212',
    }
  },
  {
    id: 'rose',
    name: 'Rose',
    type: 'light',
    colors: {
      '--app-bg-from': '#fff1f2', // rose-50
      '--app-bg-via': '#ffe4e6', // rose-100
      '--app-bg-to': '#fce7f3', // pink-100
      
      '--header-bg-from': '#be123c', // rose-700
      '--header-bg-via': '#e11d48', // rose-600
      '--header-bg-to': '#db2777', // pink-600
      '--text-main-header': '#ffffff',

      '--background': '350 50% 98%',
      '--foreground': '350 40% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '350 40% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '350 40% 10%',
      '--primary': '346 87% 43%', // rose-600
      '--primary-foreground': '355.7 100% 97.3%',
      '--secondary': '350 40% 94%',
      '--secondary-foreground': '350 40% 10%',
      '--muted': '350 40% 94%',
      '--muted-foreground': '350 20% 50%',
      '--accent': '350 40% 94%',
      '--accent-foreground': '350 40% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '350 30% 90%',
      '--input': '350 30% 90%',
      '--ring': '346 87% 43%',
      '--radius': '0.75rem',

      '--text-main': '#881337',
      '--text-muted': '#9f1239',
    }
  },
  {
    id: 'serika',
    name: 'Serika (Yellow)',
    type: 'dark',
    colors: {
      '--app-bg-from': '#323437', 
      '--app-bg-via': '#323437', 
      '--app-bg-to': '#2c2e31', 
      
      '--header-bg-from': '#e2b714', // yellow
      '--header-bg-via': '#e2b714', 
      '--header-bg-to': '#d19d08', 
      '--text-main-header': '#323437', // dark text on yellow header

      '--background': '225 6% 13%', // #323437
      '--foreground': '0 0% 80%', // #e1e1e3
      '--card': '225 6% 13%', // same as bg for flat look, or slightly lighter
      '--card-foreground': '0 0% 80%',
      '--popover': '225 6% 15%',
      '--popover-foreground': '0 0% 80%',
      '--primary': '47 88% 48%', // yellow
      '--primary-foreground': '225 6% 13%', // dark text
      '--secondary': '225 6% 20%',
      '--secondary-foreground': '0 0% 90%',
      '--muted': '225 6% 20%',
      '--muted-foreground': '0 0% 60%',
      '--accent': '225 6% 20%',
      '--accent-foreground': '47 88% 48%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 90%',
      '--border': '225 6% 20%',
      '--input': '225 6% 20%',
      '--ring': '47 88% 48%',
      '--radius': '0.25rem',

      '--text-main': '#e1e1e3',
      '--text-muted': '#646669',
    }
  },
  {
    id: 'carbon',
    name: 'Carbon (Orange)',
    type: 'dark',
    colors: {
      '--app-bg-from': '#313131', 
      '--app-bg-via': '#313131', 
      '--app-bg-to': '#2b2b2b', 
      
      '--header-bg-from': '#f66e0d', // orange
      '--header-bg-via': '#f66e0d', 
      '--header-bg-to': '#cc5000', 
      '--text-main-header': '#ffffff',

      '--background': '0 0% 19%', // #313131
      '--foreground': '0 0% 96%', // #f5e6c8 ish
      '--card': '0 0% 23%',
      '--card-foreground': '0 0% 96%',
      '--popover': '0 0% 23%',
      '--popover-foreground': '0 0% 96%',
      '--primary': '25 95% 53%', // orange
      '--primary-foreground': '0 0% 100%',
      '--secondary': '0 0% 30%',
      '--secondary-foreground': '0 0% 96%',
      '--muted': '0 0% 30%',
      '--muted-foreground': '0 0% 60%',
      '--accent': '0 0% 30%',
      '--accent-foreground': '25 95% 53%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 96%',
      '--border': '0 0% 30%',
      '--input': '0 0% 30%',
      '--ring': '25 95% 53%',
      '--radius': '0.25rem',

      '--text-main': '#f5e6c8',
      '--text-muted': '#b0a690',
    }
  }
];