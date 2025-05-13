
import React from "react";
import { Button } from "@/components/ui/button";
import { Package, Fuel } from "lucide-react";

type ShopProductSearchResultsProps = {
  searchResults: any[];
  searchType: string;
  onSelectShop: (shop: any) => void;
};

const ShopProductSearchResults: React.FC<ShopProductSearchResultsProps> = ({ searchResults, searchType, onSelectShop }) => {
  if (searchResults.length > 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Search Results</h3>
        <div className="space-y-4">
          {searchResults.map((shop) => (
            <div key={shop.id} className="bg-card p-4 rounded-lg shadow-sm flex justify-between items-center">
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                  {shop.type === "gas" ? (
                    <Package className="h-6 w-6 text-primary" />
                  ) : (
                    <Fuel className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{shop.name}</h4>
                  <p className="text-muted-foreground text-sm">Distance: {shop.distance}</p>
                  <p className="text-sm mt-1">
                    {shop.type === "gas"
                      ? `Available bottles: ${shop.bottles?.join(", ")}`
                      : `Products: ${shop.products?.some(p => p.name) 
                          ? shop.products.map(p => p.name).join(", ") 
                          : shop.products?.join(", ")}`}
                  </p>
                  {shop.type === "gas" && shop.bottleMarks?.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Brands: {shop.bottleMarks.join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <Button size="sm" onClick={() => onSelectShop(shop)}>
                Select
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-8 text-center py-12 bg-secondary/30 rounded-lg">
      <p className="text-muted-foreground">
        {searchType === "gas"
          ? "Select a bottle mark and size to see available options"
          : "Select a fuel type to see available stations"}
      </p>
    </div>
  );
};

export default ShopProductSearchResults;
