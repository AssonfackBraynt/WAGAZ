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
import MapPlaceholder from "@/components/MapPlaceholder";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ShopProductSearchResults from "@/components/ShopProductSearchResults";
import NewProductDialog from "@/components/NewProductDialog";

const mockShops = [
  {
    id: 1,
    name: "Gas Station Alpha",
    distance: "0.5 km",
    type: "petrol",
    products: [
      { name: "Gasoil", category: "fuel" },
      { name: "Super", category: "fuel" },
      { name: "Engine Oil", category: "oil" }
    ],
    bottleMarks: []
  },
  {
    id: 2,
    name: "Petrol Express",
    distance: "1.2 km",
    type: "petrol",
    products: [
      { name: "Gasoil", category: "fuel" },
      { name: "Super", category: "fuel" },
      { name: "Air", category: "service" }
    ],
    bottleMarks: []
  },
  {
    id: 3,
    name: "Gas Bottle Supply",
    distance: "0.8 km",
    type: "gas",
    bottles: ["12kg", "6kg", "3kg"],
    bottleMarks: ["Oilibia", "MRS", "Tradex"]
  },
  {
    id: 4,
    name: "Camgaz Center",
    distance: "1.5 km",
    type: "gas",
    bottles: ["12kg", "6kg", "3kg"],
    bottleMarks: ["Camgaz", "Tradex"]
  },
  {
    id: 5,
    name: "MRS Gas Shop",
    distance: "2.1 km",
    type: "gas",
    bottles: ["12kg", "6kg"],
    bottleMarks: ["MRS", "Oilibia"]
  },
];

const initialCustomProducts: any[] = []; // for demo: added by NewProductDialog

const Shop = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"gas" | "petrol">("gas");
  const [bottleMark, setBottleMark] = useState("");
  const [bottleSize, setBottleSize] = useState("6kg");
  const [fuelType, setFuelType] = useState("");
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customProducts, setCustomProducts] = useState<any[]>(initialCustomProducts);

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

  function handleSearch() {
    let results = [];
    if (searchType === "gas") {
      results = mockShops.filter(
        (shop) =>
          shop.type === "gas" &&
          (!bottleMark || shop.bottleMarks?.includes(bottleMark)) &&
          (!bottleSize || shop.bottles?.includes(bottleSize))
      );
    } else {
      results = mockShops.filter(
        (shop) =>
          shop.type === "petrol" &&
          (!fuelType || shop.products?.some((prod: any) => prod.name.toLowerCase() === fuelType.toLowerCase()))
      );
    }

    // Search term filter (supports name, category, bottle mark, bottle size)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter((shop) => {
        // Search shop name
        if (shop.name.toLowerCase().includes(term)) return true;

        // Petrol: search name/category in products
        if (shop.type === "petrol" && shop.products) {
          if (
            shop.products.some(
              (prod: any) =>
                prod.name.toLowerCase().includes(term) ||
                prod.category?.toLowerCase().includes(term)
            )
          )
            return true;
        }
        // Gas: search in bottle Marks or bottle size
        if (shop.type === "gas") {
          if (shop.bottleMarks?.some((mark: string) => mark.toLowerCase().includes(term))) return true;
          if (shop.bottles?.some((size: string) => size.toLowerCase().includes(term))) return true;
        }
        return false;
      });
    }
    setSearchResults(results);
  }

  function allowLocation() {
    setShowLocationPrompt(false);
    setSearchResults(mockShops.filter((shop) => shop.type === searchType));
    toast("Location access granted");
  }

  function handleSelectShop(shop: any) {
    toast(`Selected ${shop.name}`);
    if (isAuthenticated) {
      toast("Proceeding to order form...");
    } else {
      navigate("/login");
    }
  }

  function handleAddProduct(product: any) {
    setCustomProducts((prev) => [...prev, product]);
    toast("Product added");
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex justify-between items-center">
        Find Gas & Petrol Services
        <NewProductDialog onAdd={handleAddProduct} />
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
                    <Button onClick={handleSearch} size="sm">
                      Search
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

                <Button className="w-full" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <MapPlaceholder />
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
