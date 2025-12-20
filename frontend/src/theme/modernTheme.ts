import { createTheme, type PaletteMode } from '@mui/material';

// Cyber Emerald Design System
// Dark Main: Midnight Navy (#0F172A)
// Light Main: Slate 50 (#F8FAFC)
// Primary: Emerald Green (#10B981)
// Secondary: Electric Blue (#3B82F6)
// Accent: Amber Glow (#F59E0B)

export const getModernTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#10B981', // Emerald Green
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3B82F6', // Electric Blue
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#F59E0B', // Amber Glow
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: mode === 'dark' ? '#0F172A' : '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0F172A' : '#F8FAFC',
      paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#F8FAFC' : '#0F172A',
      secondary: mode === 'dark' ? '#94A3B8' : '#64748B',
    },
    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#334155 #0F172A' : '#CBD5E1 #F1F5F9',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'dark' ? '#334155' : '#CBD5E1',
            borderRadius: '20px',
            border: `2px solid ${mode === 'dark' ? '#0F172A' : '#F8FAFC'}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 28px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 10px 20px -5px ${mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))'
            : 'none',
          borderRadius: 24,
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: mode === 'dark'
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            borderColor: 'rgba(16, 185, 129, 0.2)',
            boxShadow: mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.1)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 15px rgba(16, 185, 129, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.8)',
            borderRadius: 14,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(16, 185, 129, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: '#10B981',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          },
        },
      },
    },
  },
});

// Extend the theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}
