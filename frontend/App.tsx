import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Kanban } from "./pages/Kanban";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFound } from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>📋 TaskManager</h1>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">
              Inicio
            </a>
            <a href="/kanban" className="nav-link">
              Kanban
            </a>
            <a href="/dashboard" className="nav-link">
              Dashboard
            </a>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
