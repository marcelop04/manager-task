import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
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
            <Link to="/" className="nav-link">
              Inicio
            </Link>
            <Link to="/kanban" className="nav-link">
              Kanban
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Redirección para SPA */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
