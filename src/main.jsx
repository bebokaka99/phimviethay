import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './index.css'
// 1. IMPORT NÀY
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. PHẢI CÓ BỌC NGOÀI CÙNG NÀY */}
    <HelmetProvider>
        <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
)