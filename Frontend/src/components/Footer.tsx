
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const isLoggedIn = !!localStorage.getItem('wagaz-logged-in');
  const userType = localStorage.getItem('wagaz-user-type'); // 'partner' or 'user'
  const partnerType = localStorage.getItem('wagaz-partner-type'); // 'gas' or 'petrol'

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">WAGAZ</h3>
            <p className="text-muted-foreground">Your Energy. Our Mission.</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {isLoggedIn && userType === 'partner' ? (
                <li>
                  <Link to="/partner-dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link>
                </li>
              ) : (
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
                </li>
              )}
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary">Shop</Link>
              </li>
              <li>
                <Link to="/partner" className="text-muted-foreground hover:text-primary">Partner</Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-primary">My Account</Link>
                  </li>
                  {userType === 'partner' && (
                    <li>
                      <Link to="/partner-dashboard" className="text-muted-foreground hover:text-primary">
                        {partnerType === 'gas' ? 'Gas Shop' : 'Petrol Station'}
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-primary">Login / Register</Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: info@wagaz.com</li>
              <li>Phone: +123 456 7890</li>
              <li>Address: 123 Energy Street</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Newsletter</h4>
            <p className="text-muted-foreground mb-2">Stay updated with our latest offers</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-3 py-2 bg-background border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground px-3 py-2 rounded-r-md">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} WAGAZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
