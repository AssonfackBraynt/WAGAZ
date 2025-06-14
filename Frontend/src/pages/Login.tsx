import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { authService } from '@/services/api';
import LocationSelector from '@/components/LocationSelector';

const Login = () => {
  const navigate = useNavigate();
  const [isPartner, setIsPartner] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Check if already logged in
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
  const [locationData, setLocationData] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

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

  const handleLocationSelect = (selectedLocation: { address: string; latitude: number; longitude: number }) => {
    setLocation(selectedLocation.address);
    setLocationData({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    // Console log the login data being sent to backend
    const loginData = {
      email,
      password
    };

    try {
      const response = await authService.login(loginData);
      // console.log(">>>>>>>>>>>>>>>>>>");

      if (response.success) {

        localStorage.setItem('wagaz-logged-in', 'true');
        localStorage.setItem('wagaz-user-type', response.user.userType || 'customer');
        localStorage.setItem('wagaz-user-email', email);
        localStorage.setItem('userId', response.user.id);

        // console.log('=== LOGIN RESPONSE FROM BACKEND ===');
        // console.log('Response:', JSON.stringify(response, null, 2));
        // console.log('=== END LOGIN RESPONSE ===');

        if (response.token) {
          localStorage.setItem('auth-token', response.token);
        }

        setIsLoggedIn(true);

        if (response.user.userType === 'partner') {
          localStorage.setItem('selectedShopId', response.shopId);
          navigate('/partner-dashboard', { replace: true });
        } else {
          navigate('/shop', { replace: true });
        }

        toast.success('Login successful!');
      } else {
        setLoginError(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Invalid email or password');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    // Basic validation
    if (!firstName || !lastName || !regEmail || !regPassword || !phoneNumber) {
      toast.error("Please fill out all required fields");
      setIsRegistering(false);
      return;
    }

    if (regPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsRegistering(false);
      return;
    }

    // Set whatsapp number to phone number if not provided
    const finalWhatsappNumber = phoneNumber || whatsappNumber;

    // Partner-specific validation
    if (isPartner) {
      if (!shopName || !niu || !location || !locationData) {
        toast.error("Please fill out all shop information and select a verified location");
        setIsRegistering(false);
        return;
      }
    }

    try {
      // Fix the userType typing issue
      const userType: "partner" | "customer" = isPartner ? 'partner' : 'customer';

      const userData = {
        firstName,
        lastName,
        email: regEmail,
        phone: phoneNumber,
        whatsappNumber: finalWhatsappNumber,
        password: regPassword,
        userType,
        ...(isPartner && {
          shopName,
          niu,
          location,
          latitude: locationData?.latitude,
          longitude: locationData?.longitude
        })
      };

      // Console log the registration data being sent to backend
      console.log('=== REGISTRATION DATA BEING SENT TO BACKEND ===');
      console.log('Endpoint: POST /auth/register');
      console.log('User Type:', userType);
      console.log('Data:', JSON.stringify(userData, null, 2));
      console.log('=== END REGISTRATION DATA ===');

      const response = await authService.register(userData);


      if (response.success) {
        toast.success(`Registration successful! You can now login as ${isPartner ? 'partner' : 'customer'}`);

        // Reset form
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
        setLocationData(null);
        setSameAsPhone(false);
        setIsPartner(false);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Check if it's a 409 conflict (user already exists)
      if (error.message && error.message.includes('409')) {
        toast.error("User already exists with this email. Please try logging in instead.");
        // Switch to login tab and pre-fill email
        setActiveTab('login');
        setEmail(regEmail);
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    try {
      // TODO: Call logout API to invalidate session on backend
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      setIsLoggedIn(false);
      setEmail('');
      setPassword('');
      setIsPartner(false);
      localStorage.removeItem('wagaz-logged-in');
      localStorage.removeItem('wagaz-user-type');
      localStorage.removeItem('wagaz-user-email');
      localStorage.removeItem('auth-token');
      navigate('/');
    }
  };

  // Show logged-in state
  if (isLoggedIn) {
    const userType = localStorage.getItem('wagaz-user-type');
    const userEmail = localStorage.getItem('wagaz-user-email');

    return (
      <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                Welcome, {userType === 'partner' ? 'Shop Partner' : 'WAGAZ User'}!
              </CardTitle>
              <CardDescription>
                You have successfully logged in as <b>{userEmail}</b>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userType === 'partner' ? (
                <div>
                  <p className="mb-2">Access your partner dashboard to manage your shop.</p>
                  <div className="bg-primary/10 rounded p-3 mb-2">
                    <span className="font-semibold">Shop Partner Actions:</span>
                    <ul className="list-disc ml-5 text-sm">
                      <li>View new orders</li>
                      <li>Manage inventory</li>
                      <li>Update prices</li>
                      <li>See delivery requests</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Welcome to WAGAZ! Find gas and petrol services near you.</p>
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
            <CardFooter className="space-x-2">
              <Button
                className="flex-1"
                onClick={() => navigate(userType === 'partner' ? '/partner-dashboard' : '/shop')}
              >
                Continue to {userType === 'partner' ? 'Dashboard' : 'Shop'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="username"
                        required
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
                        required
                      />
                    </div>
                  </div>
                  {loginError && (
                    <div className="text-destructive text-sm mt-4">
                      {loginError}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
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
                        <LocationSelector
                          onLocationSelect={handleLocationSelect}
                          initialValue={location}
                          required={isPartner}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isRegistering}>
                    {isRegistering ? 'Creating Account...' : (isPartner ? 'Register as Partner' : 'Register')}
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
