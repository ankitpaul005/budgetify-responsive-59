
import React from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Layout>
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 
          className="text-3xl font-bold mb-8 border-b pb-4"
          variants={itemVariants}
        >
          Privacy Policy
        </motion.h1>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              This Privacy Policy outlines how Budgetify collects, uses, and protects your personal information when you use our application. We are committed to ensuring the privacy and security of your data.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <p>
              When you use Budgetify, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal information such as name and email address when you create an account</li>
              <li>Financial data you input into the application including transactions, budget categories, and investment information</li>
              <li>Usage information such as how you interact with our application</li>
              <li>Device information including your IP address, browser type, and operating system</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve our services</li>
              <li>To personalize your experience</li>
              <li>To communicate with you about your account and updates</li>
              <li>To analyze usage patterns and improve our application</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">4. Data Storage</h2>
            <p>
              Budgetify uses secure storage methods to protect your financial data. For local storage implementations, your data is stored directly on your device. For cloud-based features, we use industry-standard encryption and security practices.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">5. Data Sharing</h2>
            <p>
              We do not sell your personal information to third parties. We may share anonymized, aggregated data for analytical purposes. In some cases, we may work with third-party service providers who assist us in operating our application, but they are bound by confidentiality agreements.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">7. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@budgetify.com.
            </p>
          </div>

          <p className="text-sm text-muted-foreground pt-6">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default PrivacyPolicy;
