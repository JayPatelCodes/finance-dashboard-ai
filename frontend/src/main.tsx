import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0e1530',
            color: '#e8eeff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#22c97a', secondary: '#0e1530' },
            duration: 3000,
          },
          error: {
            iconTheme: { primary: '#f05c5c', secondary: '#0e1530' },
            duration: 4000,
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
)
