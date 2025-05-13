import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isPartner, setIsPartner] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // Add persistent login check
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('wagaz-logged-in'));
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [niu, setNiu] = useState('');
  const [location, setLocation] = useState('');
  const [locationMatches, setLocationMatches] = useState(false);

  // For checking if the whatsapp number should be the same as phone number
  const [sameAsPhone, setSameAsPhone] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      // If already logged in, redirect accordingly
      const userType = localStorage.getItem('wagaz-user-type');
      if (userType === 'partner') {
        navigate('/partner-dashboard', { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (sameAsPhone) {
      setWhatsappNumber(phoneNumber);
    }
  }, [sameAsPhone, phoneNumber]);

  useEffect(() => {
    // Simulated location matching
    if (location.toLowerCase() === 'mvan') {
      setLocationMatches(true);
    } else {
      setLocationMatches(false);
    }
  }, [location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Partner login
    if (
      isPartner &&
      email.trim() === 'ytrewq' &&
      password === '789456123'
    ) {
      setIsLoggedIn(true);
      // store session
      localStorage.setItem('wagaz-logged-in', 'true');
      localStorage.setItem('wagaz-user-type', 'partner');
      localStorage.setItem('wagaz-user-email', email.trim());
      navigate('/partner-dashboard', { replace: true });
      return;
    }

    // Normal user login
    if (
      !isPartner &&
      email.trim() === 'qwerty' &&
      password === '123456789'
    ) {
      setIsLoggedIn(true);
      // store session
      localStorage.setItem('wagaz-logged-in', 'true');
      localStorage.setItem('wagaz-user-type', 'user');
      localStorage.setItem('wagaz-user-email', email.trim());
      navigate('/shop', { replace: true });
      return;
    }

    setLoginError('Invalid email or password for selected user type.');
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName || !lastName || !regEmail || !regPassword || !phoneNumber) {
      toast("Please fill out all required fields");
      return;
    }

    if (regPassword !== confirmPassword) {
      toast("Passwords do not match");
      return;
    }

    // Set whatsapp number to phone number if not provided
    const finalWhatsappNumber = whatsappNumber || phoneNumber;

    // Partner-specific validation
    if (isPartner) {
      if (!shopName || !niu || !location) {
        toast("Please fill out all shop information");
        return;
      }

      if (niu !== 'A1234567891234Z') {
        toast("Invalid NIU/UIN format (should be A1234567891234Z for simulation)");
        return;
      }

      if (!locationMatches) {
        toast("Please enter a valid location (use 'Mvan' for this simulation)");
        return;
      }
    }

    // Success toast
    toast(`Registration successful! You can now login as ${isPartner ? 'shop partner' : 'user'}`);
    
    // Reset form (in a real app, we would redirect to login)
    setFirstName('');
    setLastName('');
    setRegEmail('');
    setRegPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setWhatsappNumber('');
    setShopName('');
    setNiu('');
    setLocation('');
    setSameAsPhone(false);
  };

  // To simulate logout in the mock dashboard preview:
  const handleContinue = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setIsPartner(false);
    localStorage.removeItem('wagaz-logged-in');
    localStorage.removeItem('wagaz-user-type');
    localStorage.removeItem('wagaz-user-email');
    navigate(isPartner ? '/partner-dashboard' : '/shop'); // Always redirect to correct dashboard/shop
  };

  // Show mock dashboard after login
  if (isLoggedIn) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                Welcome, {isPartner ? 'Shop Partner' : 'WAGAZ User'}!
              </CardTitle>
              <CardDescription>
                You have successfully logged in as <b>{email}</b>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPartner ? (
                <div>
                  <p className="mb-2">This is a simulation of the partner/shop dashboard.</p>
                  <div className="bg-primary/10 rounded p-3 mb-2">
                    <span className="font-semibold">Shop Partner Actions:</span>
                    <ul className="list-disc ml-5 text-sm">
                      <li>View new orders</li>
                      <li>Manage gas price</li>
                      <li>See delivery requests</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2">This is a simulation of the normal user's view.</p>
                  <div className="bg-secondary/60 rounded p-3 mb-2">
                    <span className="font-semibold">User Features:</span>
                    <ul className="list-disc ml-5 text-sm">
                      <li>Locate nearest gas/petrol station</li>
                      <li>Order gas for home delivery</li>
                      <li>Check and compare product prices</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="secondary" onClick={handleContinue}>
                Continue to {isPartner ? 'Dashboard' : 'Shop'}
              </Button>
            </CardFooter>
          </Card>
          <div className="text-center text-muted-foreground text-xs">
            (This is a simulated login screen for preview purposes.)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to WAGAZ</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="text"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is-partner"
                        className="w-4 h-4 border-border rounded"
                        checked={isPartner}
                        onChange={() => setIsPartner(!isPartner)}
                      />
                      <Label htmlFor="is-partner" className="text-sm font-normal">
                        I am a gas shop / petrol station partner
                      </Label>
                    </div>
                  </div>
                  {loginError && (
                    <div className="text-destructive text-sm mt-4">
                      {loginError}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit">
                    {isPartner ? 'Partner Login' : 'Login'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your information to create your WAGAZ account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegistration}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name *</Label>
                        <Input 
                          id="first-name" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name *</Label>
                        <Input 
                          id="last-name" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email *</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number *</Label>
                      <Input 
                        id="phone-number" 
                        type="tel" 
                        placeholder="e.g. +237 612345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="whatsapp-number">WhatsApp Number *</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="same-as-phone"
                            className="w-4 h-4 border-border rounded"
                            checked={sameAsPhone}
                            onChange={() => setSameAsPhone(!sameAsPhone)}
                          />
                          <Label htmlFor="same-as-phone" className="text-xs font-normal">
                            Same as phone
                          </Label>
                        </div>
                      </div>
                      <Input 
                        id="whatsapp-number" 
                        type="tel" 
                        placeholder="e.g. +237 612345678"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        disabled={sameAsPhone}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password *</Label>
                      <Input 
                        id="reg-password" 
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password *</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="register-partner"
                        className="w-4 h-4 border-border rounded"
                        checked={isPartner}
                        onChange={() => setIsPartner(!isPartner)}
                      />
                      <Label htmlFor="register-partner" className="text-sm font-normal">
                        Register as a gas shop / petrol station partner
                      </Label>
                    </div>

                    {/* Partner fields that appear conditionally */}
                    {isPartner && (
                      <div className="space-y-4 border border-border rounded-md p-4 bg-secondary/20">
                        <h3 className="font-medium">Shop Information</h3>
                        <div className="space-y-2">
                          <Label htmlFor="shop-name">Shop/Station Name *</Label>
                          <Input 
                            id="shop-name" 
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required={isPartner}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="niu">NIU/UIN (14 characters) *</Label>
                          <Input 
                            id="niu" 
                            placeholder="A1234567891234Z"
                            value={niu}
                            onChange={(e) => setNiu(e.target.value)}
                            required={isPartner}
                          />
                          <p className="text-xs text-muted-foreground">Use A1234567891234Z for simulation</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location *</Label>
                          <Input 
                            id="location" 
                            placeholder="Search for your location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required={isPartner}
                          />
                          {location && (
                            <div className={`text-xs ${locationMatches ? 'text-green-600' : 'text-red-500'}`}>
                              {locationMatches ? '✓ Location found' : 'Location not found. Use "Mvan" for simulation'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit">
                    {isPartner ? 'Register as Partner' : 'Register'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            By using WAGAZ, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
