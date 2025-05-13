
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, TrendingUp, Wallet, Edit, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mock data for gas bottles
const initialGasBottles = [
  { id: 1, name: 'Oilibia 12KG', image: '/placeholder.svg', total: 25, filled: 18 },
  { id: 2, name: 'Oilibia 6KG', image: '/placeholder.svg', total: 40, filled: 32 },
  { id: 3, name: 'MRS 12KG', image: '/placeholder.svg', total: 15, filled: 10 },
  { id: 4, name: 'MRS 6KG', image: '/placeholder.svg', total: 30, filled: 20 },
  { id: 5, name: 'Tradex 6KG', image: '/placeholder.svg', total: 20, filled: 15 },
  { id: 6, name: 'Camgaz 3KG', image: '/placeholder.svg', total: 15, filled: 8 },
];

// Mock data for products in petrol station shop
const initialShopProducts = [
  { id: 1, name: 'Engine Oil 1L', price: 5000, quantity: 24 },
  { id: 2, name: 'Windshield Washer Fluid', price: 2500, quantity: 18 },
  { id: 3, name: 'Air Freshener', price: 1200, quantity: 32 },
  { id: 4, name: 'Snacks', price: 500, quantity: 50 },
  { id: 5, name: 'Water Bottle', price: 300, quantity: 60 },
  { id: 6, name: 'Car Wipes', price: 1800, quantity: 15 },
];

// Mock sales data
const monthlySales = {
  gas: [
    { name: 'Oilibia 12KG', units: 24 },
    { name: 'Oilibia 6KG', units: 43 },
    { name: 'MRS 12KG', units: 18 },
    { name: 'MRS 6KG', units: 35 },
    { name: 'Tradex 6KG', units: 22 },
    { name: 'Camgaz 3KG', units: 12 },
  ],
  products: [
    { name: 'Engine Oil 1L', units: 18 },
    { name: 'Windshield Washer Fluid', units: 12 },
    { name: 'Air Freshener', units: 24 },
    { name: 'Snacks', units: 80 },
    { name: 'Water Bottle', units: 95 },
    { name: 'Car Wipes', units: 10 },
  ],
  fuel: [
    { name: 'Gasoil', liters: 1240 },
    { name: 'Super', liters: 950 },
  ]
};

// Mock wallet data
const walletTransactions = [
  { id: 1, date: '2025-04-21', amount: 45000, type: 'credit', description: 'Payment for 3x 12KG bottles' },
  { id: 2, date: '2025-04-18', amount: 30000, type: 'credit', description: 'Payment for 5x 6KG bottles' },
  { id: 3, date: '2025-04-15', amount: 15000, type: 'debit', description: 'Inventory restock payment' },
  { id: 4, date: '2025-04-10', amount: 60000, type: 'credit', description: 'Payment for 2x 12KG and 5x 6KG bottles' },
];

const PartnerDashboard = () => {
  // Get the partner type from localStorage
  const partnerType = localStorage.getItem('wagaz-partner-type') || 'gas';
  const [businessType, setBusinessType] = useState<'gas' | 'petrol'>(partnerType as 'gas' | 'petrol');
  const [gasBottles, setGasBottles] = useState(initialGasBottles);
  const [shopProducts, setShopProducts] = useState(initialShopProducts);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [lastAuthenticated, setLastAuthenticated] = useState<number | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [balance, setBalance] = useState(120000); // Mock balance
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('wagaz-logged-in');
    const userType = localStorage.getItem('wagaz-user-type');
    
    if (!isLoggedIn || userType !== 'partner') {
      navigate('/login');
      toast("Please login as a partner to access the dashboard");
    }
  }, [navigate]);

  const needsAuthentication = () => {
    if (!lastAuthenticated) return true;
    
    // Check if 30 minutes have passed since last authentication
    const thirtyMinutesInMs = 30 * 60 * 1000;
    return Date.now() - lastAuthenticated > thirtyMinutesInMs;
  };

  const handleEditGasBottle = (item: any) => {
    if (needsAuthentication()) {
      setEditingItem(item);
    } else {
      // Skip authentication
      setEditingItem(item);
    }
  };

  const handleAuthenticateAndUpdate = (password: string) => {
    // In a real app, this would validate against the server
    if (password === '789456123') {
      setLastAuthenticated(Date.now());
      return true;
    }
    return false;
  };

  const handleUpdateBottle = (id: number, filled: number, total: number) => {
    setGasBottles(prev => 
      prev.map(bottle => 
        bottle.id === id ? { ...bottle, filled, total } : bottle
      )
    );
    toast("Inventory updated successfully");
  };

  const handleUpdateProduct = (id: number, price: number, quantity: number) => {
    setShopProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, price, quantity } : product
      )
    );
    toast("Product updated successfully");
  };

  // Remove the effect that switches between gas and petrol views automatically

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Partner Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your {businessType === 'gas' ? 'gas bottle inventory' : 'petrol station'}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant={businessType === 'gas' ? 'default' : 'outline'} 
            onClick={() => {
              setBusinessType('gas');
              localStorage.setItem('wagaz-partner-type', 'gas');
            }}
          >
            Gas Shop View
          </Button>
          <Button 
            variant={businessType === 'petrol' ? 'default' : 'outline'} 
            onClick={() => {
              setBusinessType('petrol');
              localStorage.setItem('wagaz-partner-type', 'petrol');
            }}
          >
            Petrol Station View
          </Button>
        </div>
      </div>

      {businessType === 'gas' && (
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="inventory">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="sales">
              <TrendingUp className="mr-2 h-4 w-4" />
              Sales Analytics
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gasBottles.map((bottle) => (
                <Card key={bottle.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{bottle.name}</CardTitle>
                    <CardDescription>Gas Bottle</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="aspect-square bg-secondary/50 rounded-md flex items-center justify-center mb-3">
                      <img src={bottle.image} alt={bottle.name} className="w-1/2 h-auto" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Filled: <strong>{bottle.filled}</strong></span>
                      <span>Total: <strong>{bottle.total}</strong></span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleEditGasBottle(bottle)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Update Stock
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Edit Dialog with Password Authentication */}
            <Dialog open={editingItem !== null} onOpenChange={() => setEditingItem(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {needsAuthentication() ? 'Authentication Required' : 'Update Inventory'}
                  </DialogTitle>
                  <DialogDescription>
                    {needsAuthentication() 
                      ? 'Please enter your password to make changes to inventory.' 
                      : `Update stock levels for ${editingItem?.name}`}
                  </DialogDescription>
                </DialogHeader>
                
                {needsAuthentication() ? (
                  // Authentication Form
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="auth-password">Password</Label>
                      <Input id="auth-password" type="password" />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        const passwordInput = document.getElementById('auth-password') as HTMLInputElement;
                        if (handleAuthenticateAndUpdate(passwordInput.value)) {
                          // If password is correct, the lastAuthenticated state is set
                          // and we force a re-render to show the edit form
                          setEditingItem({...editingItem});
                        } else {
                          toast("Incorrect password", {
                            icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
                          });
                        }
                      }}>Authenticate</Button>
                    </DialogFooter>
                  </div>
                ) : (
                  // Update Form (shown after authentication)
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="filled-bottles">Filled Bottles</Label>
                      <Input 
                        id="filled-bottles" 
                        type="number" 
                        defaultValue={editingItem?.filled} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total-bottles">Total Bottles</Label>
                      <Input 
                        id="total-bottles" 
                        type="number" 
                        defaultValue={editingItem?.total} 
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        const filledInput = document.getElementById('filled-bottles') as HTMLInputElement;
                        const totalInput = document.getElementById('total-bottles') as HTMLInputElement;
                        
                        handleUpdateBottle(
                          editingItem.id,
                          parseInt(filledInput.value),
                          parseInt(totalInput.value)
                        );
                        
                        setEditingItem(null);
                      }}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Update Inventory
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Gas bottle sales for the current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlySales.gas.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-primary/80 rounded-full" style={{ width: `${item.units * 3}px` }}></div>
                        <span className="text-sm font-medium">{item.units} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                <CardDescription>Your current balance and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/10 p-6 rounded-lg text-center mb-6">
                  <h3 className="text-muted-foreground">Current Balance</h3>
                  <p className="text-3xl font-bold">{balance.toLocaleString()} FCFA</p>
                </div>
                
                <h4 className="font-semibold mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {walletTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-500'}>
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString()} FCFA
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {businessType === 'petrol' && (
        <Tabs defaultValue="fuel" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="fuel">Fuel Inventory</TabsTrigger>
            <TabsTrigger value="shop">Station Shop</TabsTrigger>
            <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fuel" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gasoil</CardTitle>
                  <CardDescription>Current inventory status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Tank Level</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Price</span>
                      <span className="font-bold">640 FCFA/L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining Volume</span>
                      <span>15,000 liters</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Update Stock & Price</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Super</CardTitle>
                  <CardDescription>Current inventory status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Tank Level</span>
                        <span>62%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Price</span>
                      <span className="font-bold">680 FCFA/L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining Volume</span>
                      <span>12,400 liters</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Update Stock & Price</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="shop" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Shop Products</h3>
              <Button variant="outline" size="sm">Add New Product</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopProducts.map((product) => (
                <Card key={product.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground text-sm">Price:</span>
                      <span className="font-medium">{product.price.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">In Stock:</span>
                      <span className="font-medium">{product.quantity}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      setEditingItem(product);
                    }}>
                      Edit Product
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Edit Product Dialog */}
            <Dialog open={editingItem !== null && 'price' in editingItem} 
                   onOpenChange={() => setEditingItem(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update details for {editingItem?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price (FCFA)</Label>
                    <Input 
                      id="product-price" 
                      type="number" 
                      defaultValue={editingItem?.price} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-quantity">Quantity in Stock</Label>
                    <Input 
                      id="product-quantity" 
                      type="number" 
                      defaultValue={editingItem?.quantity} 
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      if (!editingItem) return;
                      
                      const priceInput = document.getElementById('product-price') as HTMLInputElement;
                      const quantityInput = document.getElementById('product-quantity') as HTMLInputElement;
                      
                      handleUpdateProduct(
                        editingItem.id,
                        parseInt(priceInput.value),
                        parseInt(quantityInput.value)
                      );
                      
                      setEditingItem(null);
                    }}>
                      Update Product
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fuel Sales</CardTitle>
                <CardDescription>Liters sold this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlySales.fuel.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-primary/80 rounded-full" style={{ width: `${item.liters / 10}px` }}></div>
                        <span className="text-sm font-medium">{item.liters} liters</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shop Product Sales</CardTitle>
                <CardDescription>Units sold this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlySales.products.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-primary/80 rounded-full" style={{ width: `${item.units * 2}px` }}></div>
                        <span className="text-sm font-medium">{item.units} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PartnerDashboard;
