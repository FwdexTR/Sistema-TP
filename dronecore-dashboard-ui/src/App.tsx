
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ClientHistoryProvider } from "./contexts/ClientHistoryContext";
import { CarsProvider } from "./contexts/CarsContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import TasksPage from "./pages/TasksPage";
import ClientsPage from "./pages/ClientsPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import DronesPage from "./pages/DronesPage";
import CarsPage from "./pages/CarsPage";
import EmployeePaymentsPage from "./pages/EmployeePaymentsPage";
import TaskDataPage from "./pages/TaskDataPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <Index /> : <Navigate to="/tasks" replace />}
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <TasksPage />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute adminOnly>
          <EmployeePaymentsPage />
        </ProtectedRoute>
      } />
      <Route path="/task-data" element={
        <ProtectedRoute adminOnly>
          <TaskDataPage />
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute adminOnly>
          <ClientsPage />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute adminOnly>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute adminOnly>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/drones" element={
        <ProtectedRoute adminOnly>
          <DronesPage />
        </ProtectedRoute>
      } />
      <Route path="/cars" element={
        <ProtectedRoute adminOnly>
          <CarsPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ClientHistoryProvider>
          <CarsProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CarsProvider>
        </ClientHistoryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
