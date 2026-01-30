export const themes = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      background: '#f8fafc', // slate-50
      card: '#ffffff',
      text: '#0f172a', // slate-900
      textMuted: '#64748b', // slate-500
      primary: '#4f46e5', // indigo-600
      primaryForeground: '#ffffff',
      secondary: '#e2e8f0', // slate-200
      accent: '#8b5cf6', // purple-500
      border: '#e2e8f0', // slate-200
      headerBg: 'rgba(255, 255, 255, 0.8)',
    }
  },
  {
    id: 'serika',
    name: 'Serika',
    colors: {
      background: '#e1e1e3',
      card: '#f2f2f2',
      text: '#323437',
      textMuted: '#646669',
      primary: '#e2b714',
      primaryForeground: '#323437',
      secondary: '#d1d1d1',
      accent: '#ca4754',
      border: '#d1d1d1',
      headerBg: 'rgba(225, 225, 227, 0.9)',
    }
  },
  {
    id: 'carbon',
    name: 'Carbon',
    colors: {
      background: '#313131',
      card: '#2b2b2b',
      text: '#f6f6f6',
      textMuted: '#616161',
      primary: '#f66e0d',
      primaryForeground: '#ffffff',
      secondary: '#1f1f1f',
      accent: '#f5e6c8',
      border: '#444444',
      headerBg: 'rgba(49, 49, 49, 0.9)',
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282a36',
      card: '#44475a',
      text: '#f8f8f2',
      textMuted: '#6272a4',
      primary: '#bd93f9',
      primaryForeground: '#282a36',
      secondary: '#6272a4',
      accent: '#ff79c6',
      border: '#6272a4',
      headerBg: 'rgba(40, 42, 54, 0.9)',
    }
  },
  {
    id: 'magic_girl',
    name: 'Magic Girl',
    colors: {
      background: '#ffffff',
      card: '#f5f5f5',
      text: '#00ac8c',
      textMuted: '#eea8c7',
      primary: '#ffb8d1',
      primaryForeground: '#ffffff',
      secondary: '#93e8d3',
      accent: '#f5b1cc',
      border: '#e0e0e0',
      headerBg: 'rgba(255, 255, 255, 0.9)',
    }
  },
  {
    id: 'botanical',
    name: 'Botanical',
    colors: {
      background: '#7b9c98',
      card: '#7b9c98',
      text: '#eaf1f3',
      textMuted: '#495e57',
      primary: '#eaf1f3',
      primaryForeground: '#495e57',
      secondary: '#495e57',
      accent: '#eaf1f3',
      border: '#495e57',
      headerBg: 'rgba(123, 156, 152, 0.9)',
    }
  },
  {
      id: 'miami',
      name: 'Miami',
      colors: {
          background: '#f35588',
          card: '#05dfd7',
          text: '#ffffff',
          textMuted: '#a3f7bf',
          primary: '#fff591',
          primaryForeground: '#05dfd7',
          secondary: '#a3f7bf',
          accent: '#05dfd7',
          border: '#fff591',
          headerBg: 'rgba(243, 85, 136, 0.9)',
      }
  },
  {
      id: 'terminal',
      name: 'Terminal',
      colors: {
          background: '#191919',
          card: '#191919',
          text: '#79a617',
          textMuted: '#484848',
          primary: '#79a617',
          primaryForeground: '#191919',
          secondary: '#484848',
          accent: '#79a617',
          border: '#484848',
          headerBg: 'rgba(25, 25, 25, 0.9)',
      }
  }
];

export const getTheme = (themeId) => {
  return themes.find(t => t.id === themeId) || themes[0];
};