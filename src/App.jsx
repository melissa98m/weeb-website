import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import OfflineBanner from "./components/OfflineBanner";
import { useTheme } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PersonnelRoute from "./routes/PersonnelRoute";
import StaffRoute from "./routes/StaffRoute";
import RedactionRoute from "./routes/RedactionRoute";
import Formations from "./pages/Formations";
import { ChatProvider } from "./context/ChatContext";
import ChatWidget from "./components/chat/ChatWidget";

const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Legal = lazy(() => import("./pages/Legal"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const FormationModal = lazy(() => import("./components/Formations/FormationModal"));
const Feedbacks = lazy(() => import("./pages/Feedbacks"));
const Messages = lazy(() => import("./pages/Messages"));
const PersonnelFormationAdmin = lazy(() => import("./pages/admin/PersonnelFormationAdmin"));
const FormationsManager = lazy(() => import("./pages/admin/FormationsManager"));
const ArticlesManager = lazy(() => import("./pages/admin/ArticlesManager"));
const GenresManager = lazy(() => import("./pages/admin/GenresManager"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const NewsletterManager = lazy(() => import("./pages/admin/NewsletterManager"));
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const AdminChatPanel = lazy(() => import("./pages/admin/AdminChatPanel"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const SearchResults = lazy(() => import("./pages/SearchResults"));

function App() {
  const { theme } = useTheme();

  return (
    <ChatProvider>
    <div className="text-white font-sans overflow-x-hidden relative">
      <Header />
      <main
        className={`pt-[24px] md:pt-[58px] min-h-screen ${
          theme === "dark" ? "bg-background text-white" : "bg-light text-dark"
        }`}
      >
        <Suspense fallback={<div className="p-6">Chargement...</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/mentions-legales" element={<Legal />} />
            <Route path="/politique-confidentialite" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/formation/:id" element={<FormationModal />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Auth-required (non admin layout) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedbacks"
              element={
                <StaffRoute>
                  <AdminLayout>
                    <Feedbacks />
                  </AdminLayout>
                </StaffRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <StaffRoute>
                  <AdminLayout>
                    <Messages />
                  </AdminLayout>
                </StaffRoute>
              }
            />

            <Route
              path="/admin/formations"
              element={
                <PersonnelRoute>
                  <AdminLayout>
                    <FormationsManager />
                  </AdminLayout>
                </PersonnelRoute>
              }
            />

            <Route
              path="/admin/user-formations"
              element={
                <PersonnelRoute>
                  <AdminLayout>
                    <PersonnelFormationAdmin />
                  </AdminLayout>
                </PersonnelRoute>
              }
            />
            <Route
              path="/admin/articles"
              element={
                <RedactionRoute>
                  <AdminLayout>
                    <ArticlesManager />
                  </AdminLayout>
                </RedactionRoute>
              }
            />
            <Route
              path="/admin/genres"
              element={
                <RedactionRoute>
                  <AdminLayout>
                    <GenresManager />
                  </AdminLayout>
                </RedactionRoute>
              }
            />
            <Route
              path="/admin/newsletter"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <NewsletterManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <StaffRoute>
                  <AdminLayout>
                    <AnalyticsPage />
                  </AdminLayout>
                </StaffRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <StaffRoute>
                  <AdminLayout>
                    <AdminChatPanel />
                  </AdminLayout>
                </StaffRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminHome />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
      <OfflineBanner />
      <ChatWidget />
    </div>
    </ChatProvider>
  );
}

export default App;
