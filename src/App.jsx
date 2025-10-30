import { useState } from "react";
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

function App() {
  const { theme } = useTheme();

  return (
    <div className="text-white font-sans overflow-x-hidden relative">
      <Header />
      <main
        className={`pt-[64px] md:pt-[128px] ${
          theme === "dark" ? "bg-background text-white" : "bg-light text-dark"
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/formation/:id" element={<FormationModal />} />
          <Route
            path="/feedbacks"
            element={
              <ProtectedRoute>
                <Feedbacks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
          path="/admin/formations"
          element={
            <ProtectedRoute>
              <PersonnelFormationAdmin />
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
