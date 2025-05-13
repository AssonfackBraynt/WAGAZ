
import React from "react";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import CTACallSection from "@/components/CTACallSection";

const Index = () => (
  <div className="flex flex-col min-h-screen">
    <Hero />
    <FeaturesSection />
    <CTACallSection />
  </div>
);

export default Index;
