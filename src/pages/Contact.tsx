
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name || !email || !message) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Layout>
      <motion.div 
        className="max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about Budgetify? We're here to help. Reach out to our team using the form below or through our contact information.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <motion.div variants={itemVariants} className="md:col-span-1 space-y-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Email Us</h3>
                  <p className="text-muted-foreground">support@budgetify.com</p>
                  <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Call Us</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-5PM EST</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Visit Us</h3>
                  <p className="text-muted-foreground">123 Finance Street</p>
                  <p className="text-muted-foreground">New York, NY 10001</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="p-6 shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="message" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Your message here..."
                    rows={5}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : "Send Message"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Is my financial data secure?</h3>
              <p className="text-muted-foreground">Yes, we use industry-standard encryption to protect all your financial data. Plus, we never store your bank credentials on our servers.</p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Can I export my financial data?</h3>
              <p className="text-muted-foreground">Yes, Budgetify allows you to export your data in CSV or PDF formats for your records or for use in other applications.</p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Is Budgetify free to use?</h3>
              <p className="text-muted-foreground">Yes, Budgetify offers a free plan with all essential features. We also offer premium plans with additional features for power users.</p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">How do I get started?</h3>
              <p className="text-muted-foreground">Simply create an account, set up your budget categories, and start tracking your expenses. Our onboarding process will guide you through each step.</p>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Contact;
