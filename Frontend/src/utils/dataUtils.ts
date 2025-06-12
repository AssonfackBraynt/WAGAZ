
// Data transformation utilities for converting between frontend and backend formats

// TODO: These interfaces should match backend API response formats
export interface ApiShop {
  id: string;
  name: string;
  type: 'gas' | 'petrol';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance?: string; // calculated on frontend
 products?: ApiProduct[];
  gasBottles?: ApiGasBottle[];
  fuelInventory?: ApiFuelInventory[];
}

export interface ApiGasBottle {
  id: string;
  shopId: string;
  name: string; // e.g., "Shell 6kg"
  brand: string; // e.g., "Shell"
  size: string; // e.g., "6kg"
  filled: number;
  total: number;
  unitPrice: number;
  image?: string; // Auto-assigned based on brand and size
  updatedAt: string;
}

export interface ApiProduct {
  id: string;
  shopId: string;
  name: string;
  category: string; // 'shop' | 'fuel' | 'gas'
  type?: string; // For shop products: 'Engine Oil', 'Snacks', 'Drinks'
  variant?: string; // For shop products: specific variant like '5L', 'Coca Cola'
  price: number;
  quantity: number;
  image?: string; // For shop products only (not fuel)
  size?: string; // For gas bottles
  updatedAt: string;
}

export interface ApiShopProduct {
  id: string;
  shopId: string;
  name: string;
  category: 'shop';
  type: string; // 'Engine Oil', 'Snacks', 'Drinks'
  variant?: string;
  price: number;
  quantity: number;
  image?: string; // Uploaded by shop owner
  updatedAt: string;
}

export interface ApiFuelInventory {
  id: string;
  shopId: string;
  fuelType: 'gasoil' | 'super' | 'diesel';
  category: 'fuel';
  tankLevelPercentage: number;
  pricePerLiter: number;
  remainingLiters: number;
  updatedAt: string;
}

// Gas bottle image utilities
export const getGasBottleImagePath = (brand: string, size: string): string => {
  // Returns the path where gas bottle images are stored in the database
  const brandKey = brand.toLowerCase().replace(/\s+/g, '-');
  return `/images/gas-bottles/${brandKey}-${size}.jpg`;
};

export const createGasBottleProduct = (
  brand: string, 
  size: string, 
  quantity: number, 
  unitPrice: number,
  shopId: string
): ApiGasBottle => {
  return {
    id: `gas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shopId,
    name: `${brand} ${size}`,
    brand,
    size,
    filled: quantity,
    total: quantity,
    unitPrice,
    image: getGasBottleImagePath(brand, size),
    updatedAt: new Date().toISOString(),
  };
};

export const createShopProduct = (
  name: string,
  category: string,
  type: string,
  variant: string | undefined,
  quantity: number,
  price: number,
  shopId: string,
  image?: string
): ApiShopProduct => {
  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shopId,
    name,
    category: 'shop',
    type,
    variant,
    price,
    quantity,
    image,
    updatedAt: new Date().toISOString(),
  };
};

export const createFuelProduct = (
  fuelType: 'gasoil' | 'super' | 'diesel',
  pricePerLiter: number,
  remainingLiters: number,
  shopId: string
): ApiFuelInventory => {
  return {
    id: `fuel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shopId,
    fuelType,
    category: 'fuel',
    tankLevelPercentage: 100, // Assuming full when added
    pricePerLiter,
    remainingLiters,
    updatedAt: new Date().toISOString(),
  };
};

export type DisplayProduct =
  | {
      id: string;
      shopId: string;
      updatedAt: string;
      name: string;
      category: 'gas';
      amount: number;
      unitPrice: number;
      image?: string;
      brand: string;
      size: string;
    }
  | {
      id: string;
      shopId: string;
      updatedAt: string;
      name: string;
      category: 'shop';
      type: string;
      variant?: string;
      amount: number;
      unitPrice: number;
      image?: string;
    }
  | {
      id: string;
      shopId: string;
      updatedAt: string;
      name: string;
      category: 'fuel';
      fuelType: 'gasoil' | 'super' | 'diesel';
      pricePerLiter: number;
      remainingLiters: number;
      tankLevel: number;
    };

// Transform product data for the frontend
export const transformProductForDisplay = (
  product: ApiProduct | ApiGasBottle | ApiShopProduct | ApiFuelInventory
): DisplayProduct => {
  const baseProduct = {
    id: product.id,
    shopId: product.shopId,
    updatedAt: product.updatedAt,
  };

  // Handle gas bottles
  if ('brand' in product && 'size' in product) {
    return {
      ...baseProduct,
      name: product.name,
      category: 'gas',
      amount: product.filled,
      unitPrice: product.unitPrice,
      image: product.image,
      brand: product.brand,
      size: product.size,
    };
  }

  // Handle shop products
  if ('type' in product && product.category === 'shop') {
    return {
      ...baseProduct,
      name: product.name,
      category: product.category,
      type: product.type,
      variant: product.variant,
      amount: product.quantity,
      unitPrice: product.price,
      image: product.image,
    };
  }

  // Handle fuel products
  if ('fuelType' in product) {
    return {
      ...baseProduct,
      name: product.fuelType,
      category: 'fuel',
      fuelType: product.fuelType,
      pricePerLiter: product.pricePerLiter,
      remainingLiters: product.remainingLiters,
      tankLevel: product.tankLevelPercentage,
    };
  }

  // If none of the above match, throw an error
  throw new Error('Unknown product type');
};

// Utility functions for data transformation
export const transformShopData = (apiShop: ApiShop, userLocation?: { lat: number; lng: number }) => {
  // TODO: Calculate distance based on user location and shop location
  const distance = userLocation 
    ? calculateDistance(userLocation, apiShop.location)
    : 'Unknown';

  return {
    ...apiShop,
    distance: `${distance} km`,
  };
};

export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { latitude: number; longitude: number }
): number => {
  // TODO: Implement proper distance calculation using Haversine formula
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(point2.latitude - point1.lat);
  const dLng = deg2rad(point2.longitude - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.latitude)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
  };

// Image handling utilities
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};



// Product categorization helpers
export const getProductsByCategory = (products: (ApiProduct | ApiGasBottle | ApiShopProduct | ApiFuelInventory)[]) => {
  const categorized = {
    gas: [] as any[],
    shop: [] as any[],
    fuel: [] as any[],
  };

  products.forEach(product => {
    const transformed = transformProductForDisplay(product);
    if (transformed.category === 'gas') {
      categorized.gas.push(transformed);
    } else if (transformed.category === 'shop') {
      categorized.shop.push(transformed);
    } else if (transformed.category === 'fuel') {
      categorized.fuel.push(transformed);
    }
  });

  return categorized;
};

// Error handling utilities
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  return defaultMessage;
};

// Local storage utilities for offline functionality
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return defaultValue;
  }
};

// Constants for available options
export const GAS_BOTTLE_BRANDS = [
  "Tradex",
  "Shell", 
  "Total",
  "SHV Energy",
  "Gazelle",
  "other"
];

export const GAS_BOTTLE_SIZES = ["3kg", "6kg", "12kg"];

export const PRODUCT_CATEGORIES = {
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

// TODO: Remove these constants once API is connected
export const REMOVED_MOCK_DATA = {
  shops: 'mockShops array removed from Shop.tsx',
  gasBottles: 'initialGasBottles array removed from PartnerDashboard.tsx',
  shopProducts: 'initialShopProducts array removed from PartnerDashboard.tsx', 
  salesData: 'monthlySales object removed from PartnerDashboard.tsx',
  walletTransactions: 'walletTransactions array removed from PartnerDashboard.tsx',
};
