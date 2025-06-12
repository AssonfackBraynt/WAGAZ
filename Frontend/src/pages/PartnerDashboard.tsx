import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, TrendingUp, Wallet, Edit, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getGasImage } from '../utils/getGasImage.js';
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
import { gasBottleService, shopProductService, fuelService, analyticsService } from '@/services/api';
import NewProductDialog from '@/components/NewProductDialog';

const PartnerDashboard = () => {
  const partnerType = localStorage.getItem('wagaz-partner-type') || 'gas';
  const [businessType, setBusinessType] = useState<'gas' | 'petrol'>(partnerType as 'gas' | 'petrol');

  // State for data from API
  const [gasBottles, setGasBottles] = useState<any[]>([]);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [fuelInventory, setFuelInventory] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>({});
  const [walletData, setWalletData] = useState<any>({ balance: 0, transactions: [] });

  // UI state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [lastAuthenticated, setLastAuthenticated] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // TODO: Replace with actual shop ID from authenticated user
  const currentShopId = localStorage.getItem('wagaz-shop-id') || 'SHOP_ID_PLACEHOLDER';
  const currentUserId = localStorage.getItem('wagaz-user-id') || 'USER_ID_PLACEHOLDER';

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('wagaz-logged-in');
    const userType = localStorage.getItem('wagaz-user-type');

    if (!isLoggedIn || userType !== 'partner') {
      navigate('/login');
      toast("Please login as a partner to access the dashboard");
      return;
    }

    // Load data based on business type
    loadDashboardData();
  }, [navigate, businessType]);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      if (businessType === 'gas') {
        // TODO: Load gas bottle inventory from API
        const bottles = await gasBottleService.getByShop(currentShopId);
        setGasBottles(bottles);
      } else {
        // TODO: Load petrol station data from API
        const [products, fuel] = await Promise.all([
          shopProductService.getByShop(currentShopId),
          fuelService.getByShop(currentShopId)
        ]);
        setShopProducts(products);
        setFuelInventory(fuel);
      }

      // TODO: Load sales analytics and wallet data
      const [sales, wallet] = await Promise.all([
        analyticsService.getSalesData(currentShopId),
        analyticsService.getWalletData(currentUserId)
      ]);
      setSalesData(sales);
      setWalletData(wallet);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error("Failed to load dashboard data. Please refresh the page.");

      // TODO: Remove these fallbacks once API is connected
      setGasBottles([]);
      setShopProducts([]);
      setFuelInventory([]);
      setSalesData({});
      setWalletData({ balance: 0, transactions: [] });
    } finally {
      setIsLoading(false);
    }
  }

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
      setEditingItem(item);
    }
  };

  const handleAuthenticateAndUpdate = (password: string) => {
    // TODO: Replace with actual authentication API call
    if (password === '789456123') {
      setLastAuthenticated(Date.now());
      return true;
    }
    return false;
  };

  const handleUpdateBottle = async (id: number, filled: number, total: number) => {
    try {
      // TODO: Update gas bottle inventory via API
      await gasBottleService.updateInventory(id.toString(), filled, total);

      // Update local state
      setGasBottles(prev =>
        prev.map(bottle =>
          bottle.id === id ? { ...bottle, filled, total } : bottle
        )
      );
      toast("Inventory updated successfully");
    } catch (error) {
      console.error('Failed to update bottle inventory:', error);
      toast.error("Failed to update inventory. Please try again.");
    }
  };

  const handleUpdateProduct = async (id: number, price: number, quantity: number) => {
    try {
      // TODO: Update shop product via API
      await shopProductService.updateProduct(id.toString(), price, quantity);

      // Update local state
      setShopProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, price, quantity } : product
        )
      );
      toast("Product updated successfully");
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error("Failed to update product. Please try again.");
    }
  };

  const handleUpdateFuelInventory = async (fuelType: string, data: any) => {
    try {
      // TODO: Update fuel inventory via API
      const fuelItem = fuelInventory.find(f => f.fuelType === fuelType);
      if (fuelItem) {
        await fuelService.updateFuelInventory(fuelItem.id, data);

        // Update local state
        setFuelInventory(prev =>
          prev.map(fuel =>
            fuel.fuelType === fuelType ? { ...fuel, ...data } : fuel
          )
        );
        toast("Fuel inventory updated successfully");
      }
    } catch (error) {
      console.error('Failed to update fuel inventory:', error);
      toast.error("Failed to update fuel inventory. Please try again.");
    }
  };

  gasBottles.map((bottle) => {
    const imageSrc = getGasImage(bottle.image); // ✅ Now this has access to each bottle


    const handleAddProduct = (product: {
      name: string;
      category: string;
      amount: number;
      unitPrice: number;
      image?: string;
      size?: string;
    }) => {
      if (businessType === 'gas') {
        // Add gas bottle
        const newBottle = {
          id: Date.now(),
          name: product.name,
          filled: product.amount,
          total: product.amount,
          unitPrice: product.unitPrice,
          image: product.image,
          size: product.size
        };
        setGasBottles(prev => [...prev, newBottle]);
        toast.success("Gas bottle added successfully");
      } else {
        // Add shop product
        const newProduct = {
          id: Date.now(),
          name: product.name,
          category: product.category,
          price: product.unitPrice,
          quantity: product.amount,
          image: product.image
        };
        setShopProducts(prev => [...prev, newProduct]);
        toast.success("Product added successfully");
      }
    };

    if (isLoading) {
      return (
        <div className="container px-4 py-8 mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-4">Loading dashboard...</p>
          </div>
        </div>
      );
    }

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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gas Bottles Inventory</h3>
                <NewProductDialog onAdd={handleAddProduct} businessType="gas" />
              </div>

              {gasBottles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No gas bottles found. Add inventory to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gasBottles.map((bottle) => (
                    <Card key={bottle.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{bottle.name}</CardTitle>
                        <CardDescription>Gas Bottle {bottle.size && `(${bottle.size})`}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="aspect-square bg-secondary/50 rounded-md flex items-center justify-center mb-3">
                          {bottle.image ? (
                            <img src={imageSrc} alt={bottle.name} className="w-full h-full object-cover rounded-md" />  //work baack this
                          ) : (
                            <img src="/placeholder.svg" alt={bottle.name} className="w-1/2 h-auto" />
                          )}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Filled: <strong>{bottle.filled}</strong></span>
                          <span>Total: <strong>{bottle.total}</strong></span>
                        </div>
                        {bottle.unitPrice && (
                          <div className="text-sm mt-2">
                            <span>Price: <strong>{bottle.unitPrice.toLocaleString()} FCFA</strong></span>
                          </div>
                        )}
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
              )}

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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="auth-password">Password</Label>
                        <Input id="auth-password" type="password" />
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          const passwordInput = document.getElementById('auth-password') as HTMLInputElement;
                          if (handleAuthenticateAndUpdate(passwordInput.value)) {
                            setEditingItem({ ...editingItem });
                          } else {
                            toast("Incorrect password", {
                              icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
                            });
                          }
                        }}>Authenticate</Button>
                      </DialogFooter>
                    </div>
                  ) : (
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
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading sales data...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect to backend API to view sales analytics
                    </p>
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
                    <p className="text-3xl font-bold">{walletData.balance.toLocaleString()} FCFA</p>
                  </div>

                  <h4 className="font-semibold mb-3">Recent Transactions</h4>
                  {walletData.transactions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {walletData.transactions.map((transaction: any) => (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {businessType === 'petrol' && (
          <Tabs defaultValue="shop" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="shop">Station Shop</TabsTrigger>
              <TabsTrigger value="fuel">Fuel Inventory</TabsTrigger>
              <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Shop Products</h3>
                {/* <Button variant="outline" size="sm" onClick={() => {
                toast("Feature coming soon - connect to backend API");
              }}>Add New Product</Button> */}
                <NewProductDialog onAdd={handleAddProduct} businessType="petrol" />
              </div>

              {shopProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add products to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shopProducts.map((product) => (
                    <Card key={product.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <CardDescription className="text-xs">{product.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {product.image && (
                          <div className="w-full h-32 bg-secondary/50 rounded-md flex items-center justify-center mb-3">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
                          </div>
                        )}
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
              )}

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

            <TabsContent value="fuel" className="space-y-4">
              {fuelInventory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading fuel inventory...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect to backend API to manage fuel inventory
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fuelInventory.map((fuel) => (
                    <Card key={fuel.id}>
                      <CardHeader>
                        <CardTitle>{fuel.fuelType}</CardTitle>
                        <CardDescription>Current inventory status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Tank Level</span>
                              <span>{fuel.tankLevelPercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${fuel.tankLevelPercentage}%` }}></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Current Price</span>
                            <span className="font-bold">{fuel.pricePerLiter} FCFA/L</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Remaining Volume</span>
                            <span>{fuel.remainingLiters.toLocaleString()} liters</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => {
                          toast("Feature coming soon - connect to backend API");
                        }}>Update Stock & Price</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading sales analytics...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect to backend API to view detailed sales reports
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  });
};

export default PartnerDashboard;
