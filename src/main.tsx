
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </AuthProvider>
);
