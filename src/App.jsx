import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import { useTheme } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PersonnelRoute from "./routes/PersonnelRoute";

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
const Formations = lazy(() => import("./pages/Formations"));
const FormationModal = lazy(() => import("./components/Formations/FormationModal"));
const Feedbacks = lazy(() => import("./pages/Feedbacks"));
const Messages = lazy(() => import("./pages/Messages"));
const PersonnelFormationAdmin = lazy(() => import("./pages/admin/PersonnelFormationAdmin"));
const FormationsManager = lazy(() => import("./pages/admin/FormationsManager"));
const ArticlesManager = lazy(() => import("./pages/admin/ArticlesManager"));
const GenresManager = lazy(() => import("./pages/admin/GenresManager"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

function App() {
  const { theme } = useTheme();

  return (
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
                <ProtectedRoute>
                  <AdminLayout>
                    <Feedbacks />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Messages />
                  </AdminLayout>
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <AdminLayout>
                    <ArticlesManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/genres"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <GenresManager />
                  </AdminLayout>
                </ProtectedRoute>
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
    </div>
  );
}

export default App;
