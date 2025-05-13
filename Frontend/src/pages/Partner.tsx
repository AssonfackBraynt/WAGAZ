
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Partner = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <section>
          <h1 className="text-3xl font-bold mb-2">Become a WAGAZ Partner</h1>
          <p className="text-muted-foreground mb-8">
            Join our network of gas shops and petrol stations to grow your business.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Gas Shop Partners</CardTitle>
              <CardDescription>For gas bottle and cylinder retailers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="list-disc ml-5">Increased visibility to customers in your area</li>
                <li className="list-disc ml-5">Simple inventory management system</li>
                <li className="list-disc ml-5">Online ordering and delivery coordination</li>
                <li className="list-disc ml-5">Business analytics and reports</li>
              </ul>
              <Button className="w-full">Apply as Gas Shop</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Petrol Station Partners</CardTitle>
              <CardDescription>For fuel stations and service centers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="list-disc ml-5">Real-time fuel availability updates</li>
                <li className="list-disc ml-5">Premium placement in search results</li>
                <li className="list-disc ml-5">Service offering management</li>
                <li className="list-disc ml-5">Customer feedback and ratings</li>
              </ul>
              <Button className="w-full">Apply as Petrol Station</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-semibold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Apply</h3>
              <p className="text-muted-foreground">Complete our simple application form with your business details.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-semibold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Setup</h3>
              <p className="text-muted-foreground">Our team will help you set up your partner dashboard and train your staff.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-semibold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Grow</h3>
              <p className="text-muted-foreground">Start receiving orders and grow your business with WAGAZ.</p>
            </div>
          </div>
        </div>

        <div className="text-center bg-accent p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Already a Partner?</h2>
          <p className="text-muted-foreground mb-6">
            Log in to your partner dashboard to manage your business.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">Partner Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Partner;
