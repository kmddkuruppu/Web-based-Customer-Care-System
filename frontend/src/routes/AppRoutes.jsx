import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_PATH, ROLES } from '../utils/constants';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import SubmitComplaint from '../pages/customer/SubmitComplaint';
import MyTickets from '../pages/customer/MyTickets';
import TicketDetails from '../pages/tickets/TicketDetails';
import AgentDashboard from '../pages/agent/AgentDashboard';
import AssignedTickets from '../pages/agent/AssignedTickets';
import EscalatedTickets from '../pages/senior/EscalatedTickets';
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard';
import TicketAssignment from '../pages/supervisor/TicketAssignment';
import Reports from '../pages/manager/Reports';
import UserManagement from '../pages/admin/UserManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? HOME_PATH[user.role] || '/login' : '/login'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={[ROLES.CUSTOMER]} />}>
        <Route element={<MainLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/submit" element={<SubmitComplaint />} />
          <Route path="/customer/tickets" element={<MyTickets />} />
          <Route path="/customer/tickets/:id" element={<TicketDetails />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.AGENT]} />}>
        <Route element={<MainLayout />}>
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/tickets" element={<AssignedTickets />} />
          <Route path="/agent/tickets/:id" element={<TicketDetails />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.SENIOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/senior/escalated" element={<EscalatedTickets />} />
          <Route path="/senior/tickets/:id" element={<TicketDetails />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.SUPERVISOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/tickets" element={<TicketAssignment />} />
          <Route path="/supervisor/tickets/:id" element={<TicketDetails />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.MANAGER]} />}>
        <Route element={<MainLayout />}>
          <Route path="/manager/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
