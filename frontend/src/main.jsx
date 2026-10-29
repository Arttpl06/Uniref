import React from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import LoginPage from './pages/LoginPage.jsx'
import PasswordNewPage from './pages/PasswordNewPage.jsx'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage.jsx'
import PasswordVerificationPage from './pages/PasswordVerificationPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { BrowserRouter, Routes, Route} from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/RegisterPage" element={<RegisterPage/>}/> 
          <Route path="/LoginPage" element={<LoginPage />}></Route>
          <Route path="/PasswordNewPage" element={<PasswordNewPage />}></Route>
          <Route path="/PasswordRecoveryPage" element={<PasswordRecoveryPage />}></Route>
          <Route path="/PasswordVerificationPage" element={<PasswordVerificationPage />}></Route>
       </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
