import React from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import LoginPage from './pages/LoginPage.jsx'
import PasswordNewPage from './pages/PasswordNewPage.jsx'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage.jsx'
import PasswordVerificationPage from './pages/PasswordVerificationPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>,
)
