import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';seline';
import AppRoutes from './routes';

// Create a custom theme (optional)
const theme = createTheme({
  palette: {  document.getElementById('root') as HTMLElement
    primary: {
      main: '#1976d2',
    },
    background: {tMode>
      default: '#f5f5f5',me={theme}>
    },<CssBaseline />
  },
  typography: {
    fontFamily: [act.StrictMode>
      '-apple-system',
      'BlinkMacSystemFont',      '"Segoe UI"',      'Roboto',      '"Helvetica Neue"',      'Arial',      'sans-serif',    ].join(','),  },});function App() {  return (    <ThemeProvider theme={theme}>      <CssBaseline /> {/* Provides consistent baseline styles */}      <BrowserRouter>        <AuthProvider>          <AppRoutes />        </AuthProvider>      </BrowserRouter>    </ThemeProvider>  );}export default App;