
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTACallSection = () => (
  <section className="py-16 bg-accent">
    <div className="container px-4 md:px-6 text-center">
      <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
      <p className="max-w-[600px] mx-auto text-muted-foreground mb-8">
        Join thousands of customers who trust WAGAZ for their energy needs.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/shop">
          <Button size="lg">Find Gas Near Me</Button>
        </Link>
        <Link to="/partner">
          <Button size="lg" variant="outline">Become a Partner</Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CTACallSection;
