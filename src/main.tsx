import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Gate from './pages/Gate';
import Home from './pages/Home';
import Portal from './pages/Portal';
import CommandCenter, { AgentsPage } from './pages/CommandCenter';
import DomainPage from './pages/DomainPage';

const Guard = ({ children }: { children: React.ReactElement }) =>
  sessionStorage.getItem('unlocked') ? children : <Navigate to="/" replace />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Gate />} />
        <Route path="/inicio" element={<Guard><Home /></Guard>} />
        <Route path="/portal" element={<Guard><Portal /></Guard>}>
          <Route index element={<CommandCenter />} />
          <Route path="agentes" element={<AgentsPage />} />
          <Route path=":slug" element={<DomainPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
