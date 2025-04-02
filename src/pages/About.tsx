
import React from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const About = () => {
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

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      bio: "Financial expert with over 10 years of experience in personal finance and technology."
    },
    {
      name: "Samantha Chen",
      role: "CTO",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      bio: "Full-stack developer specializing in secure financial applications and data visualization."
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Product",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      bio: "Product specialist passionate about creating intuitive user experiences for financial tools."
    },
    {
      name: "Emily Patel",
      role: "Financial Advisor",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      bio: "Certified financial planner helping to ensure Budgetify provides sound financial guidance."
    }
  ];

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
          <Badge variant="outline" className="mb-4 text-primary">About Us</Badge>
          <h1 className="text-4xl font-bold mb-6">Our Mission is to Make Financial Management Simple</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Budgetify was created with one goal in mind: to help people take control of their finances through intuitive tools and actionable insights.
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div 
          variants={itemVariants} 
          className="mb-16 flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold">Our Story</h2>
            <p>
              Budgetify was born out of personal frustration with complicated financial tools. Our founder, Alex Johnson, struggled to find a simple yet powerful application to manage personal finances.
            </p>
            <p>
              In 2019, Alex decided to build the solution he couldn't find. What started as a personal project soon gained attention from friends and family who faced similar challenges. Today, Budgetify helps thousands of users worldwide to track, manage, and optimize their finances.
            </p>
            <p>
              Our team has grown but our mission remains the same: to make financial management accessible to everyone through intuitive design and powerful features.
            </p>
          </div>
          <div className="md:w-1/2">
            <motion.img 
              src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Team working together" 
              className="rounded-lg shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Simplicity</h3>
              <p>We believe financial tools should be easy to use without sacrificing functionality. We focus on intuitive design that makes managing finances straightforward.</p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Transparency</h3>
              <p>We're committed to being open about how we build and operate our platform. We believe in clear communication and no hidden fees or surprises.</p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Empowerment</h3>
              <p>Our ultimate goal is to empower users with the knowledge and tools they need to make better financial decisions and achieve their goals.</p>
            </Card>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover:shadow-md transition-shadow"
              >
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="text-center bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            We're constantly evolving and improving Budgetify based on user feedback. We'd love for you to be a part of our growing community.
          </p>
          <motion.a 
            href="/signup"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Create Your Free Account
          </motion.a>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default About;
