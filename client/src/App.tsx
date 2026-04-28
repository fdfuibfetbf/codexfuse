import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/Landing';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import ForgotPage from '@/pages/auth/Forgot';
import ResetPage from '@/pages/auth/Reset';
import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '@/pages/app/Dashboard';
import ChatPage from '@/pages/app/Chat';
import ImageStudioPage from '@/pages/app/ImageStudio';
import VoiceStudioPage from '@/pages/app/VoiceStudio';
import CodePage from '@/pages/app/Code';
import TemplatesPage from '@/pages/app/Templates';
import TemplateRunnerPage from '@/pages/app/TemplateRunner';
import DocumentsPage from '@/pages/app/Documents';
import TranslatePage from '@/pages/app/Translate';
import OcrPage from '@/pages/app/Ocr';
import DetectorPage from '@/pages/app/Detector';
import PlagiarismPage from '@/pages/app/Plagiarism';
import SearchPage from '@/pages/app/Search';
import BotsPage from '@/pages/app/Bots';
import BrandVoicesPage from '@/pages/app/BrandVoices';
import AgentsPage from '@/pages/app/Agents';
import WorkflowsPage from '@/pages/app/Workflows';
import VideoPage from '@/pages/app/Video';
import MusicPage from '@/pages/app/Music';
import HistoryPage from '@/pages/app/History';
import SettingsPage from '@/pages/app/Settings';
import WorkspacesPage from '@/pages/app/Workspaces';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/Dashboard';
import AdminUsersPage from '@/pages/admin/Users';
import AdminPlansPage from '@/pages/admin/Plans';
import AdminTemplatesPage from '@/pages/admin/Templates';
import AdminUsagePage from '@/pages/admin/Usage';
import AdminSettingsPage from '@/pages/admin/Settings';
import RequireAuth from '@/components/RequireAuth';
import { ToastViewport } from '@/components/ui/Toast';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/reset" element={<ResetPage />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
          <Route path="image" element={<ImageStudioPage />} />
          <Route path="voice" element={<VoiceStudioPage />} />
          <Route path="code" element={<CodePage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/:slug" element={<TemplateRunnerPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="translate" element={<TranslatePage />} />
          <Route path="ocr" element={<OcrPage />} />
          <Route path="detector" element={<DetectorPage />} />
          <Route path="plagiarism" element={<PlagiarismPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="bots" element={<BotsPage />} />
          <Route path="brand-voices" element={<BrandVoicesPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="video" element={<VideoPage />} />
          <Route path="music" element={<MusicPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth requireAdmin>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="usage" element={<AdminUsagePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </>
  );
}
