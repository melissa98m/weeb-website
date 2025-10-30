import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useTheme } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Formations from "./pages/Formations";
import FormationModal from "./components/Formations/FormationModal";
import Feedbacks from "./pages/Feedbacks";
import Messages from "./pages/Messages";
import PersonnelFormationAdmin from "./pages/admin/PersonnelFormationAdmin";
import FormationsManager from "./pages/admin/FormationsManager";
import AdminLayout from "./layouts/AdminLayout";
import PersonnelRoute from "./routes/PersonnelRoute";
import ArticlesManager from "./pages/admin/ArticlesManager";

function App() {
  const { theme } = useTheme();

  return (
    <div className="text-white font-sans overflow-x-hidden relative">
      <Header />
      <main
        className={`pt-[24px] md:pt-[58px] ${
          theme === "dark" ? "bg-background text-white" : "bg-light text-dark"
        }`}
      >
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
