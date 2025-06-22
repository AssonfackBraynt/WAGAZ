import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import { getGasImage } from '../utils/getGasImage.js'; // Utility function to get gas bottle image
import { toast } from "sonner";
import { convertImageToBase64 } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Gas bottle brands from backend (mock data)
const gasBottleBrands = [
  "Tradex",
  "Oil Libya",
  "Camgaz",
  "SHV Energy",
  "Gazelle",
  "other"
];

// Gas bottle sizes
const gasBottleSizes = ["3kg", "6kg", "12kg"];

// Product categories and their types for petrol stations
const productCategories = {
  shop: [
    { type: "Engine Oil", variants: ["5L", "3L", "2L", "1L"] },
    { type: "Snacks", variants: ["Biscuits", "Cookies", "Chips", "Crackers"] },
    { type: "Drinks", variants: ["Top Ananas", "Djino", "Coca Cola", "Sprite", "Water"] }
  ],
  fuel: [
    { type: "Super", variants: ["Regular"] },
    { type: "Gasoil", variants: ["Premium"] },
    { type: "Diesel", variants: ["Standard", "Premium"] }
  ]
};

type NewProductDialogProps = {
  onAdd: (product: {
    name: string;
    category: string;
    productType?: string;
    variant?: string;
    amount: number;
    unitPrice: number;
    image?: string;
    size?: string;
  }) => void;
  businessType: 'gas' | 'petrol';
};

const NewProductDialog: React.FC<NewProductDialogProps> = ({ onAdd, businessType }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [variant, setVariant] = useState("");
  const [amount, setAmount] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [useCustomName, setUseCustomName] = useState(false);
  const [customName, setCustomName] = useState("");
  const [bottleSize, setBottleSize] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // New states for adding custom options
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [showAddProductType, setShowAddProductType] = useState(false);
  const [newProductType, setNewProductType] = useState("");
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState("");

  // Dynamic data that can be updated
  const [dynamicBrands, setDynamicBrands] = useState(gasBottleBrands);
  const [dynamicCategories, setDynamicCategories] = useState(productCategories);

  // Function to get automatic image for gas bottles
  const getGasBottleImage = (imagePath: string) => {
    return getGasImage(imagePath);
  };



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let finalName = "";
    let finalCategory = "";
    let finalImage = "";
    let base64Image: string | undefined;

    if (businessType === 'gas') {
      const brandName = useCustomName ? customName : name;
      finalName = bottleSize ? `${brandName} ${bottleSize}` : brandName;
      finalCategory = "gas";

      // Auto-attach image for gas bottles
      if (brandName && bottleSize) {
        const imagePath = `gasImages/${brandName.toLowerCase()}-${bottleSize}.jpg`;
        finalImage = imagePath; // store this in DB
      }
    } else {
      console.log("Adding shop product: xxxxxxxxxxxxxxxxxxxxx");
      
      if (productImage) {
        try {
          base64Image = await convertImageToBase64(productImage);
        } catch (err) {
          toast.error("Failed to convert image");
          return;
        }
      }

      finalName = productType;
      finalCategory = category;
      finalImage = base64Image;
      console.log("Final image:", finalImage, "Base64:", base64Image, "Product Image:", productImage);
      

      // Use uploaded image for shop products (not fuel)
      if (category === "shop" && imagePreview) {
        finalImage = imagePreview;
      }
    }

    if (!finalName || !finalCategory) return;

    onAdd({
      name: finalName,
      category: finalCategory,
      productType,
      variant,
      amount,
      unitPrice,
      image: finalImage || undefined,
      size: bottleSize || undefined
    });

    // Reset form
    resetForm();
  }

  const resetForm = () => {
    setName("");
    setCategory("");
    setProductType("");
    setVariant("");
    setAmount(1);
    setUnitPrice(0);
    setUseCustomName(false);
    setCustomName("");
    setBottleSize("");
    setProductImage(null);
    setImagePreview("");
    setShowAddBrand(false);
    setNewBrand("");
    setShowAddProductType(false);
    setNewProductType("");
    setShowAddVariant(false);
    setNewVariant("");
    setOpen(false);
  };

  const handleNameChange = (value: string) => {
    if (value === "other") {
      setUseCustomName(true);
      setName("");
    } else {
      setUseCustomName(false);
      setName(value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvailableVariants = () => {
    if (!category || !productType) return [];

    const categoryData = dynamicCategories[category as keyof typeof dynamicCategories];
    const typeData = categoryData?.find(item => item.type === productType);
    return typeData?.variants || [];
  };

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      const updatedBrands = [...dynamicBrands.filter(b => b !== "other"), newBrand.trim(), "other"];
      setDynamicBrands(updatedBrands);
      setName(newBrand.trim());
      setNewBrand("");
      setShowAddBrand(false);
    }
  };

  const handleAddProductType = () => {
    if (newProductType.trim() && category) {
      const updatedCategories = { ...dynamicCategories };
      updatedCategories[category as keyof typeof dynamicCategories] = [
        ...updatedCategories[category as keyof typeof dynamicCategories],
        { type: newProductType.trim(), variants: [] }
      ];
      setDynamicCategories(updatedCategories);
      setProductType(newProductType.trim());
      setNewProductType("");
      setShowAddProductType(false);
    }
  };

  const handleAddVariant = () => {
    if (newVariant.trim() && category && productType) {
      const updatedCategories = { ...dynamicCategories };
      const categoryData = updatedCategories[category as keyof typeof dynamicCategories];
      const typeIndex = categoryData.findIndex(item => item.type === productType);

      if (typeIndex !== -1) {
        categoryData[typeIndex].variants.push(newVariant.trim());
        setDynamicCategories(updatedCategories);
        setVariant(newVariant.trim());
      }

      setNewVariant("");
      setShowAddVariant(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" />
          {businessType === 'gas' ? 'New Gas Bottle' : 'New Product'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New {businessType === 'gas' ? 'Gas Bottle' : 'Product'}
          </DialogTitle>
          <DialogDescription>
            Enter details for the new {businessType === 'gas' ? 'gas bottle' : 'product'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {businessType === 'gas' ? (
            <>
              <div>
                <Label htmlFor="bottle-brand">Gas Bottle Brand</Label>
                {!useCustomName ? (
                  <div className="flex gap-2">
                    <Select value={name} onValueChange={handleNameChange} required>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select bottle brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicBrands.map(brand => (
                          <SelectItem value={brand} key={brand}>
                            {brand === "other" ? "Other (Enter custom name)" : brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="custom-brand"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="Enter new bottle brand"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseCustomName(false);
                        setCustomName("");
                      }}
                    >
                      Choose from list instead
                    </Button>
                  </div>
                )}

              </div>

              <div>
                <Label htmlFor="bottle-size">Bottle Size</Label>
                <Select value={bottleSize} onValueChange={setBottleSize} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bottle size" />
                  </SelectTrigger>
                  <SelectContent>
                    {gasBottleSizes.map(size => (
                      <SelectItem value={size} key={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="product-category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Shop" defaultValue={"shop"}/>
                  </SelectTrigger>
                  <SelectContent defaultValue={"shop"}>
                    <SelectItem value="shop">Shop Products</SelectItem>
                    {/* <SelectItem value="fuel">Fuel/Petrol</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              {category && (
                <div>
                  <Label htmlFor="product-type">Product Type</Label>
                  <div className="flex gap-2">
                    <Select value={productType} onValueChange={setProductType} required>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicCategories[category as keyof typeof dynamicCategories]?.map(item => (
                          <SelectItem value={item.type} key={item.type}>
                            {item.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddProductType(true)}
                    >
                      Other
                    </Button>
                  </div>

                  {showAddProductType && (
                    <div className="mt-2 p-3 border rounded-md bg-muted/50">
                      <Label htmlFor="new-product-type">Add New Product Type</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="new-product-type"
                          value={newProductType}
                          onChange={e => setNewProductType(e.target.value)}
                          placeholder="Enter product type"
                        />
                        <Button type="button" size="sm" onClick={handleAddProductType}>
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddProductType(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {productType && getAvailableVariants().length > 0 && (
                <div>
                  <Label htmlFor="product-variant">Variant/Size</Label>
                  <div className="flex gap-2">
                    <Select value={variant} onValueChange={setVariant}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select variant (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableVariants().map(variantOption => (
                          <SelectItem value={variantOption} key={variantOption}>
                            {variantOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddVariant(true)}
                    >
                      Other
                    </Button>
                  </div>

                  {showAddVariant && (
                    <div className="mt-2 p-3 border rounded-md bg-muted/50">
                      <Label htmlFor="new-variant">Add New Variant</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="new-variant"
                          value={newVariant}
                          onChange={e => setNewVariant(e.target.value)}
                          placeholder="Enter variant name"
                        />
                        <Button type="button" size="sm" onClick={handleAddVariant}>
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddVariant(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image upload for shop products only (not fuel) */}
              {category === "shop" && (
                <div>
                  <Label htmlFor="product-image">Product Image (Optional)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('product-image')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </Button>
                      {productImage && (
                        <span className="text-sm text-muted-foreground">
                          {productImage.name}
                        </span>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="w-20 h-20 border rounded-md overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="prod-amount">
              {businessType === 'gas' ? 'Quantity (Bottles)' : 'Quantity (Amount)'}
            </Label>
            <Input
              id="prod-amount"
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <div>
            <Label htmlFor="prod-unit-price">Unit Price (FCFA)</Label>
            <Input
              id="prod-unit-price"
              type="number"
              min={0}
              value={unitPrice}
              onChange={e => setUnitPrice(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-1" />
              Add {businessType === 'gas' ? 'Gas Bottle' : 'Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProductDialog;
