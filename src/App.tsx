
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BudgetSheets from "./pages/BudgetSheets";
import Investment from "./pages/Investment";
import Analytics from "./pages/Analytics";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import Contact from "./pages/Contact";
import News from "./pages/News";
import Companions from "./pages/Companions";
import SplitExpenses from "./pages/SplitExpenses";
import ChatbotDialog from "./components/chat/ChatbotDialog";
import VoiceCommandListener from "./components/voice/VoiceCommandListener";
import SignupPrompt from "./components/auth/SignupPrompt";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="app-theme">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/investment" element={<Investment />} />
              <Route path="/news" element={<News />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/budget-diary" element={<BudgetSheets />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/companions" element={<Companions />} />
              <Route path="/split-expenses" element={<SplitExpenses />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
            <SignupPrompt />
            <ChatbotDialog />
            <VoiceCommandListener />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
