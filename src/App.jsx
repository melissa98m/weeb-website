import { useState } from "react";
import viteLogo from "/vite.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/Login";

function App() {
  return (
    <div className="text-white font-sans">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />}/>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
