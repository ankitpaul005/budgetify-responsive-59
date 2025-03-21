
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import IndexPage from "./pages/Index";
import DashboardPage from "./pages/Dashboard";
import InvestmentPage from "./pages/Investment";
import AnalyticsPage from "./pages/Analytics";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import NotFoundPage from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/investments" element={<InvestmentPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
