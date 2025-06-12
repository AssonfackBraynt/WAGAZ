import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ShopProductSearchResults from "@/components/ShopProductSearchResults";
import NewProductDialog from "@/components/NewProductDialog";
import MapComponent from '@/components/MapComponent';
import { shopService } from '@/services/api';

const Shop = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"gas" | "petrol">("gas");
  const [bottleMark, setBottleMark] = useState("");
  const [bottleSize, setBottleSize] = useState("6kg");
  const [fuelType, setFuelType] = useState("");
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customProducts, setCustomProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const isAuthenticated = !!localStorage.getItem('wagaz-logged-in');

  useEffect(() => {
    if (
      searchType &&
      ((searchType === "gas" && bottleMark && bottleSize) ||
        (searchType === "petrol" && fuelType))
    ) {
      handleSearch();
    }
    // eslint-disable-next-line
  }, [searchType, bottleMark, bottleSize, fuelType]);

  async function handleSearch() {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call using shopService
      const searchParams = {
        type: searchType,
        ...(userLocation && { location: userLocation }),
        ...(bottleMark && { bottleMark }),
        ...(bottleSize && { bottleSize }),
        ...(fuelType && { fuelType }),
        ...(searchTerm && { searchTerm }),
      };

      const results = await shopService.searchShops(searchParams);
      setSearchResults(results);
      
      // TODO: Remove this fallback once API is connected
      console.log('Search params:', searchParams);
      toast("Search completed"); // Replace with actual results
      
    } catch (error) {
      console.error('Search failed:', error);
      toast.error("Failed to search shops. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function allowLocation() {
    setShowLocationPrompt(false);
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          
          // TODO: Fetch nearby shops using the location
          loadNearbyShops(location);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error("Could not get your location");
        }
      );
    }
    
    toast("Location access granted");
  }

  async function loadNearbyShops(location: { lat: number; lng: number }) {
    try {
      // TODO: Replace with actual API call
      const nearbyShops = await shopService.getNearbyShops(location.lat, location.lng);
      setSearchResults(nearbyShops.filter((shop: any) => shop.type === searchType));
    } catch (error) {
      console.error('Failed to load nearby shops:', error);
      toast.error("Failed to load nearby shops");
    }
  }

  function handleSelectShop(shop: any) {
    toast(`Selected ${shop.name}`);
    if (isAuthenticated) {
      toast("Proceeding to order form...");
      // TODO: Navigate to order form or implement order logic
    } else {
      navigate("/login");
    }
  }

  function handleAddProduct(product: any) {
    setCustomProducts((prev) => [...prev, product]);
    toast("Product added");
    // TODO: Send new product to backend if needed
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      
      <h1 className="text-3xl font-bold mb-6 flex justify-between items-center">
        Find Gas & Petrol Services
        {/* <NewProductDialog onAdd={handleAddProduct} /> */}
      </h1>
      
      {showLocationPrompt ? (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Enable Location Services</h2>
          <p className="text-muted-foreground mb-6">
            Allow location access to find gas and petrol services near you.
          </p>
          <Button onClick={allowLocation}>Enable Location</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Search Options</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="search-term">Search Products or Shops</Label>
                  <div className="flex gap-2">
                    <input
                      id="search-term"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, brand, etc."
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button onClick={handleSearch} size="sm" disabled={isLoading}>
                      {isLoading ? "..." : "Search"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-type">What are you looking for?</Label>
                  <Select
                    value={searchType}
                    onValueChange={(value) => {
                      setSearchType(value as "gas" | "petrol");
                      setSearchResults([]);
                      setBottleMark("");
                      setBottleSize("6kg");
                      setFuelType("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Gas Bottle</SelectItem>
                      <SelectItem value="petrol">Petrol Station</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                
                {searchType === "gas" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bottle-mark">Bottle Mark</Label>
                      <Select value={bottleMark} onValueChange={setBottleMark}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bottle mark" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oilibia">Oilibia</SelectItem>
                          <SelectItem value="MRS">MRS</SelectItem>
                          <SelectItem value="Tradex">Tradex</SelectItem>
                          <SelectItem value="Camgaz">Camgaz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bottle-type">Bottle Size</Label>
                      <Select value={bottleSize} onValueChange={setBottleSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bottle size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12kg">12kg Bottle</SelectItem>
                          <SelectItem value="6kg">6kg Bottle</SelectItem>
                          <SelectItem value="3kg">3kg Bottle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="petrol-type">Petrol Product</Label>
                    <Select value={fuelType} onValueChange={setFuelType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoil">Gasoil</SelectItem>
                        <SelectItem value="super">Super</SelectItem>
                        <SelectItem value="engine oil">Engine Oil</SelectItem>
                        <SelectItem value="air">Air</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button className="w-full" onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <MapComponent />
            <ShopProductSearchResults
              searchResults={searchResults}
              searchType={searchType}
              onSelectShop={handleSelectShop}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
