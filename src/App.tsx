
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
import ActivityPage from "./pages/Activity";
import SettingsPage from "./pages/Settings";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import NotFoundPage from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfServicePage from "./pages/TermsOfService";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import ChatbotDialog from "./components/chat/ChatbotDialog";
import VoiceCommandListener from "./components/voice/VoiceCommandListener";
import SignupPrompt from "./components/auth/SignupPrompt";

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
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              {/* New routes for footer pages */}
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <SignupPrompt />
            <ChatbotDialog />
            <VoiceCommandListener />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
