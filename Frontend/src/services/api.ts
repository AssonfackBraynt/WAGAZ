const API_BASE_URL = 'http://93.127.162.162:5000';

const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    verifyPassword: '/auth/verify-password',
  },
  // Shop endpoints
  shops: {
    search: '/shops/search',
    getById: '/shops/:id',
    getByLocation: '/shops/nearby',
  },
  // Gas bottle endpoints
  gasBottles: {
    getByShop: '/products/gas-bottles/:shopId',
    update: '/products/gas-bottles/:id',
    create: '/products/gas-bottles',
  },
  // Shop products endpoints
  shopProducts: {
    getByShop: '/products/shop-products/:shopId',
    update: '/products/shop-products/:id',
    create: '/products/shop-products',
  },
  // Fuel inventory endpoints
  fuel: {
    getByShop: '/products/:shopId/fuel-inventory',
    update: '/products/fuel/:id',
  },
  // Sales analytics endpoints
  analytics: {
    getSales: '/shops/:shopId/sales',
    getWallet: '/users/:userId/wallet',
  },
  // User endpoints
  users: {
    getProfile: '/users/profile',
    updateProfile: '/users/profile',
  },
};

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // TODO: Add your authentication token here
  const token = localStorage.getItem('auth-token'); // Replace with your token storage method

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Shop Services
export const shopService = {
  // TODO: Implement search shops by type, location, products
  searchShops: async (searchParams: {
    type: 'gas' | 'petrol';
    location?: { lat: number; lng: number };
    bottleMark?: string;
    bottleSize?: string;
    fuelType?: string;
    searchTerm?: string;
  }) => {
    // TODO: Replace with actual API call
    const queryParams = new URLSearchParams();

    if (searchParams.location) {
    queryParams.append("lat", searchParams.location.lat.toString());
    queryParams.append("lng", searchParams.location.lng.toString());
  }

    Object.entries(searchParams).forEach(([key, value]) => {
    if (key !== "location" && value) {
      queryParams.append(key, value.toString());
    }
  });

    return apiCall(`${API_ENDPOINTS.shops.search}?${queryParams}`);
  },

  // TODO: Get shops near user location
  getNearbyShops: async (lat: number, lng: number, type: 'gas' | 'petrol', radius: number = 5) => {
    return apiCall(`${API_ENDPOINTS.shops.getByLocation}?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`);
  },

  // TODO: Get shop details by ID
  getShopById: async (shopId: string) => {
    return apiCall(API_ENDPOINTS.shops.getById.replace(':id', shopId));
  },
};

// Gas Bottle Services
export const gasBottleService = {
  // TODO: Get gas bottles inventory for a shop
  getByShop: async (shopId: string) => {
    return apiCall(API_ENDPOINTS.gasBottles.getByShop.replace(':shopId', shopId));
  },

  createBottle: async (data: { shop_id: string; name: string; size: string; filled: number; total: number; unitPrice: number; }) => {
    return apiCall(API_ENDPOINTS.gasBottles.create, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },


  // TODO: Update gas bottle inventory (filled/total counts)
  updateInventory: async (
    bottleId: string,
    updates: { filled: number; total: number; unitPrice: number }
  ) => {
    return apiCall(API_ENDPOINTS.gasBottles.update.replace(':id', bottleId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Shop Products Services
export const shopProductService = {
  // TODO: Get shop products for petrol stations
  getByShop: async (shopId: string) => {
    return apiCall(API_ENDPOINTS.shopProducts.getByShop.replace(':shopId', shopId));
  },

  // TODO: Update product price and quantity
  updateProduct: async (productId: string, price: number, quantity: number, imageBase64?: string) => {
    return apiCall(API_ENDPOINTS.shopProducts.update.replace(':id', productId), {
      method: 'PUT',
      body: JSON.stringify({ price, quantity, ...(imageBase64 && { imageBase64 }) }),
    });
  },

  // TODO: Create new product
  createProduct: async (data: { shop_id: string; category: string, productType: string; variant: string; price: number; quantity: number; image: string }) => {
    console.log("<<<<<<<<<<<<<<<<<<<>..................", data);

    return apiCall(API_ENDPOINTS.shopProducts.create, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Fuel Services
export const fuelService = {
  // TODO: Get fuel inventory for petrol station
  getByShop: async (shopId: string) => {
    return apiCall(API_ENDPOINTS.fuel.getByShop.replace(':shopId', shopId));
  },

  // TODO: Update fuel inventory (tank levels, prices)
  updateFuelInventory: async (fuelId: string, data: {
    tank_capacity_liters: number;
    price_per_liter: number;
    remaining_liters: number;
  }) => {
    console.log('Updating fuel inventory with data:', data);
    
    return apiCall(API_ENDPOINTS.fuel.update.replace(':id', fuelId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Analytics Services
export const analyticsService = {
  // TODO: Get sales data for dashboard
  getSalesData: async (shopId: string, period: 'month' | 'week' | 'year' = 'month') => {
    return apiCall(`${API_ENDPOINTS.analytics.getSales.replace(':shopId', shopId)}?period=${period}`);
  },

  // TODO: Get wallet transactions
  getWalletData: async (userId: string) => {
    return apiCall(API_ENDPOINTS.analytics.getWallet.replace(':userId', userId));
  },
};

// User Services
export const userService = {
  // TODO: Get user profile
  getProfile: async () => {
    return apiCall(API_ENDPOINTS.users.getProfile);
  },

  // TODO: Update user profile
  updateProfile: async (profileData: any) => {
    return apiCall(API_ENDPOINTS.users.updateProfile, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Authentication Services
export const authService = {
  // TODO: User login
  login: async (loginData: {
    email: string,
    password: string
  }) => {
    console.log('Login data:++++++++++++++', loginData);

    return apiCall(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData),
    });
  },

  verifyPassword: async (userId: string, password: string) => {
    return apiCall(API_ENDPOINTS.auth.verifyPassword, {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });
  },

  // TODO: User registration
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    password: string;
    userType: 'customer' | 'partner';
  }) => {
    return apiCall(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // TODO: User logout
  logout: async () => {
    return apiCall(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    });
  },
};
