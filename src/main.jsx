import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './index.css'

// --- THÊM DÒNG IMPORT NÀY ---
import { HelmetProvider } from 'react-helmet-async'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- THÊM HELMETPROVIDER WRAPPER --- */}
    <HelmetProvider>
        <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
)