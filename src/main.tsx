import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Gate from './pages/Gate';
import Home from './pages/Home';
import Portal from './pages/Portal';
import Cockpit, { Decisions, DataCatalog } from './pages/Cockpit';
import ModulePage from './pages/ModulePage';

const Guard = ({ children }: { children: React.ReactElement }) =>
  sessionStorage.getItem('unlocked') ? children : <Navigate to="/" replace />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Gate />} />
        <Route path="/inicio" element={<Guard><Home /></Guard>} />
        <Route path="/portal" element={<Guard><Portal /></Guard>}>
          <Route index element={<Cockpit />} />
          <Route path="decisoes" element={<Decisions />} />
          <Route path="dados" element={<DataCatalog />} />
          <Route path=":slug/:section?" element={<ModulePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
