
import React from "react";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Easy Location",
    desc: "Find the nearest gas shops and petrol stations with a single tap."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Quick Orders",
    desc: "Order gas bottles or check petrol availability with our streamlined process."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Best Prices",
    desc: "Compare prices and get the best deals on gas and petrol products."
  },
];

const FeaturesSection = () => (
  <section className="py-16 bg-gradient-to-br from-[#FDE1D3] via-[#FEC6A1]/80 to-[#F1F0FB] section-padding">
    <div className="container px-4 md:px-6">
      <h2 className="text-3xl font-bold text-center mb-12 text-primary">Why Choose WAGAZ?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white/80 card-gradient rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-xl mb-2 text-foreground">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.desc}</p>
          </div>
        ))}

        {/* Delivery Logo Feature */}
        <div className="bg-white/90 card-gradient rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition">
          <img
            src="/lovable-uploads/9fa470ee-bff6-460c-b6e1-f820d6041899.png"
            alt="WAGAZ home delivery"
            className="h-20 w-auto mb-3 drop-shadow-lg"
            style={{ background: "#fff7ef", borderRadius: "1rem", padding: "0.5rem" }}
          />
          <h3 className="font-semibold text-xl mb-2 text-foreground">Home Delivery Service</h3>
          <p className="text-muted-foreground">
            WAGAZ brings gas to your doorstep! Enjoy safe and reliable home delivery of your gas and petrol needs, right when you need them.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;

