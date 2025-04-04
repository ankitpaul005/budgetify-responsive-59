
import React from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const TermsOfService = () => {
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
          Terms of Service
        </motion.h1>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Budgetify, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p>
              Budgetify provides financial management tools including budget tracking, investment monitoring, and financial analytics. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">4. User Content</h2>
            <p>
              You retain ownership of any content you input into Budgetify. By providing content, you grant us a license to use, store, and display that content in connection with providing the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">5. Prohibited Uses</h2>
            <p>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Use the service to transmit harmful code or content</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">6. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE OR UNINTERRUPTED.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
            <p>
              BUDGETIFY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">8. Financial Disclaimer</h2>
            <p>
              Budgetify is not a financial advisor, and the information provided through our service should not be considered financial advice. Users should consult with qualified financial professionals for personalized advice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at terms@budgetify.com.
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

export default TermsOfService;
