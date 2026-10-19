import { Routes, Route } from "react-router-dom";
import { useEnterToNextField } from "./hooks/useEnterToNextField";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import ClaimProfile from "./pages/ClaimProfile";
import EditMyProfile from "./pages/dashboards/EditMyProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
// import Browse from './pages/Browse'
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import CreateMyProfile from "./pages/dashboards/CreateMyProfile";
import ComingSoon from "./pages/ComingSoon";
import Settings from "./pages/Settings";
import ServicesPage from "./pages/dashboards/ServicesPage";
import HireRequestsPage from "./pages/dashboards/HireRequestsPage";
import ManagerProfileForm from "./pages/dashboards/ManagerProfileForm";
import MyManagerPage from "./pages/dashboards/MyManagerPage";
import MyTalentsPage from "./pages/manager/MyTalentsPage";
import ManagedTalentPage from "./pages/manager/ManagedTalentPage";
import DashboardLayout from "./components/dashboard-panel/DashboardLayout";
import BusinessProfileForm from "./pages/dashboards/BusinessProfileForm";
import ForgotPassword from "./pages/ForgotPassword";
import BusinessesPage from "./pages/directory/BusinessesPage";
import ManagersPage from "./pages/directory/ManagersPage";
import BusinessDetailPage from "./pages/directory/BusinessDetailPage";
import ManagerDetailPage from "./pages/directory/ManagerDetailPage";
import MyProfileRedirect from "./pages/MyProfileRedirect";
import CampaignsPage from "./pages/campaigns/CampaignsPage";
import CampaignDetailPage from "./pages/campaigns/CampaignDetailPage";
import MyCampaignsPage from "./pages/campaigns/MyCampaignsPage";
import CampaignFormPage from "./pages/campaigns/CampaignFormPage";
import CampaignApplicantsPage from "./pages/campaigns/CampaignApplicantsPage";
import MyApplicationsPage from "./pages/campaigns/MyApplicationsPage";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import AdminPersonEditor from "./pages/admin/AdminPersonEditor";
import AdminLayout from "./components/admin-panel/AdminLayout";
import AdminOverviewPage from "./pages/admin-panel/AdminOverviewPage";
import AdminClaimsPage from "./pages/admin-panel/AdminClaimsPage";
import AdminClaimDetailPage from "./pages/admin-panel/AdminClaimDetailPage";
import AdminUsersPage from "./pages/admin-panel/AdminUsersPage";
import AdminReportsPage from "./pages/admin-panel/AdminReportsPage";
import AdminReportDetailPage from "./pages/admin-panel/AdminReportDetailPage";
import AdminAuditLogPage from "./pages/admin-panel/AdminAuditLogPage";
import AdminBusinessesPage from "./pages/admin-panel/AdminBusinessesPage";
import AdminBusinessDetailPage from "./pages/admin-panel/AdminBusinessDetailPage";
import ReportProfile from "./pages/ReportProfile";
import AgreementsPage from "./pages/agreements/AgreementsPage";
import ShortlistsPage from "./pages/shortlists/ShortlistsPage";
import ShortlistDetailPage from "./pages/shortlists/ShortlistDetailPage";
import AgreementNewPage from "./pages/agreements/AgreementNewPage";
import AgreementDetailPage from "./pages/agreements/AgreementDetailPage";
import AdminAgreementsPage from "./pages/admin-panel/AdminAgreementsPage";
import AdminManagersPage from "./pages/admin-panel/AdminManagersPage";
import AdminNewsletterPage from "./pages/admin-panel/AdminNewsletterPage";
import LegalPage from "./pages/LegalPage";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import AdminManagerDetailPage from "./pages/admin-panel/AdminManagerDetailPage";
import AdminAgreementDetailPage from "./pages/admin-panel/AdminAgreementDetailPage";

function App() {
  // Enter moves to the next field in every form; the last field submits
  useEnterToNextField();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        {/* <Route path="/browse" element={<Browse />} /> */}
        <Route path="/about" element={<About />} />
        <Route
          path="/privacy"
          element={<LegalPage key="privacy" page="privacy" />}
        />
        <Route path="/terms" element={<LegalPage key="terms" page="terms" />} />
        <Route
          path="/newsletter/unsubscribe"
          element={<NewsletterUnsubscribe />}
        />
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/businesses/:id" element={<BusinessDetailPage />} />
        <Route path="/managers/:id" element={<ManagerDetailPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        {/* Talent / business dashboard ke pages: admin panel jaisa sidebar */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile/edit"
            element={
              <ProtectedRoute roles={["talent"]}>
                <EditMyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile/new"
            element={
              <ProtectedRoute roles={["talent"]}>
                <CreateMyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/services"
            element={
              <ProtectedRoute roles={["talent"]}>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns"
            element={
              <ProtectedRoute roles={["business"]}>
                <MyCampaignsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/new"
            element={
              <ProtectedRoute roles={["business"]}>
                <CampaignFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/:id"
            element={
              <ProtectedRoute roles={["business"]}>
                <CampaignApplicantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/:id/edit"
            element={
              <ProtectedRoute roles={["business"]}>
                <CampaignFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/applications"
            element={
              <ProtectedRoute roles={["talent"]}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/business"
            element={
              <ProtectedRoute roles={["business"]}>
                <BusinessProfileForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute roles={["representative"]}>
                <ManagerProfileForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/talents"
            element={
              <ProtectedRoute roles={["representative"]}>
                <MyTalentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/talents/:personId"
            element={
              <ProtectedRoute roles={["representative"]}>
                <ManagedTalentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-manager"
            element={
              <ProtectedRoute roles={["talent"]}>
                <MyManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hire-requests"
            element={
              <ProtectedRoute roles={["talent", "business", "representative"]}>
                <HireRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agreements"
            element={
              <ProtectedRoute roles={["business", "talent", "representative"]}>
                <AgreementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agreements/new"
            element={
              <ProtectedRoute roles={["business"]}>
                <AgreementNewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agreements/:id"
            element={
              <ProtectedRoute roles={["business", "talent", "representative"]}>
                <AgreementDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shortlists"
            element={
              <ProtectedRoute roles={["business"]}>
                <ShortlistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shortlists/:id"
            element={
              <ProtectedRoute roles={["business"]}>
                <ShortlistDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute roles={["talent"]}>
              <MyProfileRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <ComingSoon page="inbox" icon={faEnvelope} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/people/:slug" element={<Profile />} />
        <Route
          path="/people/:slug/claim"
          element={
            <ProtectedRoute roles={["talent"]}>
              <ClaimProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard/people/new"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPersonEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/people/:id/edit"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPersonEditor />
            </ProtectedRoute>
          }
        />
        {/* Admin panel: sidebar ke saath, sirf admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="claims" element={<AdminClaimsPage />} />
          <Route path="claims/:id" element={<AdminClaimDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="reports/:id" element={<AdminReportDetailPage />} />
          <Route path="businesses" element={<AdminBusinessesPage />} />
          <Route path="businesses/:id" element={<AdminBusinessDetailPage />} />
          <Route path="managers" element={<AdminManagersPage />} />
          <Route path="managers/:id" element={<AdminManagerDetailPage />} />
          <Route path="agreements" element={<AdminAgreementsPage />} />
          <Route path="agreements/:id" element={<AdminAgreementDetailPage />} />
          <Route path="audit-logs" element={<AdminAuditLogPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
        </Route>
        <Route path="/people/:slug/report" element={<ReportProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;