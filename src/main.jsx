import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
// QUAN TRỌNG: Phải import file này để nhận màu nền và Tailwind
import './index.css' 
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
        <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
)