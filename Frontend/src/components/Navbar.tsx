
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, Store, LogIn, User, LogOut, Package, Settings, LayoutDashboard, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent session from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('wagaz-logged-in'));
  const [isPartner, setIsPartner] = useState(localStorage.getItem('wagaz-user-type') === 'partner');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('wagaz-user-email'));

  // Track localStorage changes for logout from other tabs
  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem('wagaz-logged-in'));
      setIsPartner(localStorage.getItem('wagaz-user-type') === 'partner');
      setUserEmail(localStorage.getItem('wagaz-user-email'));
    };
    window.addEventListener('storage', syncLoginState);
    return () => window.removeEventListener('storage', syncLoginState);
  }, []);

  // Refresh login state on route change (mainly for SPA transitions)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('wagaz-logged-in'));
    setIsPartner(localStorage.getItem('wagaz-user-type') === 'partner');
    setUserEmail(localStorage.getItem('wagaz-user-email'));
    setIsMobileMenuOpen(false); // Close mobile menu on route change
  }, [location]);

  // Remove the auto-login logic for /shop and leave only the partner dashboard auto-login
  useEffect(() => {
    if (location.pathname === '/partner-dashboard' && !isLoggedIn) {
      // Only auto-login for the partner dashboard if we're not already logged in
      simulateLogin(true);
    }
  // eslint-disable-next-line
  }, [location.pathname]);

  const simulateLogin = (asPartner = false) => {
    // For preview
    setIsLoggedIn(true);
    setIsPartner(asPartner);
    localStorage.setItem('wagaz-logged-in', 'true');
    localStorage.setItem('wagaz-user-type', asPartner ? 'partner' : 'user');
    localStorage.setItem('wagaz-user-email', asPartner ? 'shop@example.com' : 'user@example.com');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsPartner(false);
    setUserEmail('');
    localStorage.removeItem('wagaz-logged-in');
    localStorage.removeItem('wagaz-user-type');
    localStorage.removeItem('wagaz-user-email');
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-primary font-bold text-xl">WAGAZ</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn && isPartner ? (
            // Partner sees "Dashboard"
            <Link to="/partner-dashboard" className={`flex items-center gap-2 ${isActive('/partner-dashboard')}`}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          ) : (
            // User/Not logged in sees "Home"
            <Link to="/" className={`flex items-center gap-2 ${isActive('/')}`}>
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          )}

          {/* "Shop" and "Partner" links always available */}
          <Link to="/shop" className={`flex items-center gap-2 ${isActive('/shop')}`}>
            <MapPin className="h-4 w-4" />
            <span>Shop</span>
          </Link>
          <Link to="/partner" className={`flex items-center gap-2 ${isActive('/partner')}`}>
            <Store className="h-4 w-4" />
            <span>Partner</span>
          </Link>
          
          {/* Only show Login/Register if NOT logged in */}
          {!isLoggedIn ? (
            <Link to="/login" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md">
              <LogIn className="h-4 w-4" />
              <span>Login / Register</span>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-md">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {isPartner && (
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Inventory</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <nav className="container px-4 py-4 space-y-2">
            {isLoggedIn && isPartner ? (
              <Link 
                to="/partner-dashboard" 
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/partner-dashboard')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link 
                to="/" 
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            )}

            <Link 
              to="/shop" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/shop')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MapPin className="h-5 w-5" />
              <span>Shop</span>
            </Link>

            <Link 
              to="/partner" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive('/partner')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Store className="h-5 w-5" />
              <span>Partner</span>
            </Link>

            {!isLoggedIn ? (
              <Link 
                to="/login" 
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary text-primary-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                <span>Login / Register</span>
              </Link>
            ) : (
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Signed in as {userEmail}
                </div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/80 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/80 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                {isPartner && (
                  <Link 
                    to="/inventory" 
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/80 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-5 w-5" />
                    <span>Inventory</span>
                  </Link>
                )}
                <Link 
                  to="/orders" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/80 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/80 hover:text-primary w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
