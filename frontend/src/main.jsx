import React from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import LoginPage from './pages/LoginPage.jsx'
import PasswordNewPage from './pages/PasswordNewPage.jsx'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage.jsx'
import PasswordVerificationPage from './pages/PasswordVerificationPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import Livros from './pages/livros.jsx'
import InicioPage from './pages/inicoPage.jsx'
import Dicionarios from './pages/dicionarios.jsx'
import RelatorioTec from './pages/relatorioTecnico.jsx'
import DisertacaoTese from './pages/disertacoesTeses.jsx'
import Ref from './pages/Ref.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/RegisterPage" element={<RegisterPage />} />
          <Route path="/PasswordNewPage" element={<PasswordNewPage />} />
          <Route path="/PasswordRecoveryPage" element={<PasswordRecoveryPage />} />
          <Route path="/PasswordVerificationPage" element={<PasswordVerificationPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/InicioPage" element={<InicioPage />} />
            <Route path="/Ref" element={<Ref />} />
            <Route path="/Livros" element={<Livros />} />
            <Route path="/Dicionários" element={<Dicionarios />} />
            <Route path="/Enciclopédias" element={<Dicionarios />} />
            <Route path="/Relatório Técnico" element={<RelatorioTec />} />
            <Route path="/Teses, Dissertações e TCC's" element={<DisertacaoTese />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
