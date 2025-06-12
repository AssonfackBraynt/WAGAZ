const { GasBottle, ShopProduct, FuelInventory } = require('../models');

// ─── Gas Bottles ─────────────────────────────────────────────
exports.addGasBottle = async (req, res) => {
  try {
    const { shop_id, brand_id, size, filled, total } = req.body;

    if (!['3kg', '6kg', '12kg'].includes(size)) {
      return res.status(400).json({ message: 'Invalid size. Must be 3kg, 6kg, or 12kg.' });
    }

    const bottle = await GasBottle.create({ shop_id, brand_id, size, filled, total });
    res.status(201).json(bottle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add gas bottle' });
  }
};

exports.updateGasBottle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const bottle = await GasBottle.findByPk(id);
    if (!bottle) return res.status(404).json({ message: 'Gas bottle not found' });

    await bottle.update({ ...updates, updated_at: new Date() });
    res.json(bottle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update gas bottle' });
  }
};

// ─── Shop Products ───────────────────────────────────────────
exports.addShopProduct = async (req, res) => {
  try {
    const { shop_id, name, price, quantity } = req.body;
    const product = await ShopProduct.create({ shop_id, name, price, quantity });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product' });
  }
};

exports.updateShopProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await ShopProduct.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.update({ ...updates, updated_at: new Date() });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// ─── Fuel Inventory ──────────────────────────────────────────
exports.addFuelInventory = async (req, res) => {
  try {
    const { shop_id, fuel_type, tank_level_percentage, price_per_liter, remaining_liters } = req.body;
    const fuel = await FuelInventory.create({ shop_id, fuel_type, tank_level_percentage, price_per_liter, remaining_liters });
    res.status(201).json(fuel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add fuel inventory' });
  }
};

exports.updateFuelInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fuel = await FuelInventory.findByPk(id);
    if (!fuel) return res.status(404).json({ message: 'Fuel inventory not found' });

    await fuel.update({ ...updates, updated_at: new Date() });
    res.json(fuel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update fuel inventory' });
  }
};

// product listing
exports.getGasBottlesByShop = async (req, res) => {
  const { shop_id } = req.query;
  const bottles = await GasBottle.findAll({ where: { shop_id } });
  res.json(bottles);
};

exports.getShopProductsByShop = async (req, res) => {
  const { shop_id } = req.query;
  const products = await ShopProduct.findAll({ where: { shop_id } });
  res.json(products);
};

exports.getFuelInventoryByShop = async (req, res) => {
  const { shop_id } = req.query;
  const fuel = await FuelInventory.findAll({ where: { shop_id } });
  res.json(fuel);
};

//salesAnalyticsController
exports.logSale = async (req, res) => {
  try {
    const { shop_id, product_type, product_id, units_sold, revenue, sale_date } = req.body;
    const entry = await SalesAnalytics.create({ shop_id, product_type, product_id, units_sold, revenue, sale_date });
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to log sale' });
  }
};