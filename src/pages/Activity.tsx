
import React from "react";
import Layout from "@/components/Layout";
import ActivityLog from "@/components/activity/ActivityLog";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ActivityPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Activity Log</h1>
        <ActivityLog />
      </div>
    </Layout>
  );
};

export default ActivityPage;
