
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import GlassmorphicCard from "@/components/ui/GlassmorphicCard";
import { BarChart4, PieChart, DollarSign, TrendingUp, Shield, Clock } from "lucide-react";

const Index = () => {
  // Refs for intersection observer
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Setup intersection observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slideUp");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);
  
  // Features list
  const features = [
    {
      title: "Budget Tracking",
      description: "Set and track your budget across multiple categories to keep your spending in check.",
      icon: <BarChart4 className="w-10 h-10 text-budget-blue" />,
    },
    {
      title: "Investment Monitoring",
      description: "Track your investments and watch your money grow over time.",
      icon: <TrendingUp className="w-10 h-10 text-budget-green" />,
    },
    {
      title: "Visual Analytics",
      description: "Understand your finances with intuitive charts and reports.",
      icon: <PieChart className="w-10 h-10 text-budget-purple" />,
    },
    {
      title: "Secure & Private",
      description: "Your financial data stays on your device and is never sent to any server.",
      icon: <Shield className="w-10 h-10 text-budget-red" />,
    },
    {
      title: "Real-time Updates",
      description: "See your financial picture update in real-time as you add transactions.",
      icon: <Clock className="w-10 h-10 text-budget-yellow" />,
    },
    {
      title: "Free Forever",
      description: "Budgetify is completely free to use with no hidden fees or premium features.",
      icon: <DollarSign className="w-10 h-10 text-budget-blue" />,
    },
  ];

  return (
    <Layout withPadding={false}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-muted/30" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_50%_40%,rgba(105,120,255,0.1),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
          <div className="flex flex-col items-center text-center animate-fadeIn">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
              Effortlessly manage your finances
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
              Take control of your finances with{" "}
              <span className="text-primary">Budgetify</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
              A beautiful, intuitive budget tracking app that helps you understand and
              improve your financial health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="rounded-full px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Login
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-r from-primary/10 to-budget-purple/10 rounded-3xl opacity-60" />
            
            <GlassmorphicCard
              className="p-4 md:p-8 transform-gpu transition-all duration-500 hover:translate-y-[-5px] hover:shadow-xl"
              glowEffect
            >
              <img 
                src="https://placehold.co/1200x675/0EA5E9/FFFFFF?text=Budgetify+Dashboard+Preview&font=montserrat" 
                alt="Budgetify Dashboard Preview"
                className="rounded-lg w-full shadow-lg transition-all duration-500 hover:shadow-2xl"
              />
            </GlassmorphicCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your finances
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                ref={(el) => (featureRefs.current[index] = el)}
                className="opacity-0"
              >
                <GlassmorphicCard 
                  className="h-full transition-all duration-300 hover:translate-y-[-5px]"
                  hoverEffect
                >
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassmorphicCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 to-budget-purple/10 rounded-3xl blur-3xl opacity-60" />
            <GlassmorphicCard className="p-12 text-center" glowEffect>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to take control of your finances?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of users who have already started their journey to
                financial freedom with Budgetify.
              </p>
              <Link to="/signup">
                <Button size="lg" className="rounded-full px-8">
                  Create Free Account
                </Button>
              </Link>
            </GlassmorphicCard>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
