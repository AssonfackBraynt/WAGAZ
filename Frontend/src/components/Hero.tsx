
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Your Energy. Our Mission.",
  subtitle = "Locate gas and petrol services around you in seconds. Order with ease. WAGAZ makes energy accessible.",
  ctaText = "Get Started",
  ctaLink = "/shop",
}) => (
  <section className="py-20 md:py-32 bg-gradient-to-br from-background to-accent">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
          {subtitle}
        </p>
        {ctaText && ctaLink && (
          <Link to={ctaLink}>
            <Button size="lg" className="mt-4 text-lg">
              {ctaText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  </section>
);

export default Hero;
