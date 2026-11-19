import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { ToastProvider } from './ui/toast';
import Gate from './pages/Gate';
import Home from './pages/Home';
import Portal from './pages/Portal';
import Cockpit, { Decisions, DataCatalog } from './pages/Cockpit';
import ModulePage from './pages/ModulePage';
import { CustomerList, CustomerDetail, EmployeeList, EmployeeDetail, AssetList, AssetDetail } from './pages/View360';

const Guard = ({ children }: { children: React.ReactElement }) =>
  sessionStorage.getItem('unlocked') ? children : <Navigate to="/" replace />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Gate />} />
        <Route path="/inicio" element={<Guard><Home /></Guard>} />
        <Route path="/portal" element={<Guard><Portal /></Guard>}>
          <Route index element={<Cockpit />} />
          <Route path="decisoes" element={<Decisions />} />
          <Route path="dados" element={<DataCatalog />} />
          <Route path="360/clientes" element={<CustomerList />} />
          <Route path="360/clientes/:id" element={<CustomerDetail />} />
          <Route path="360/colaboradores" element={<EmployeeList />} />
          <Route path="360/colaboradores/:id" element={<EmployeeDetail />} />
          <Route path="360/ativos" element={<AssetList />} />
          <Route path="360/ativos/:id" element={<AssetDetail />} />
          <Route path=":slug/:section?" element={<ModulePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
    </ToastProvider>
  </StrictMode>
);
