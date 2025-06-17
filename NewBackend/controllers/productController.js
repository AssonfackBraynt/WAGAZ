const { BottleMark, GasBottle, ShopProduct, FuelInventory } = require('../models');
const db = require('../firebase/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// ─── Gas Bottles ─────────────────────────────────────────────
exports.addGasBottle = async (req, res) => {
  try {
    const { shop_id, name, size, filled, total, unitPrice } = req.body;

    if (!['3kg', '6kg', '12kg'].includes(size)) {
      return res.status(400).json({ message: 'Invalid size. Must be 3kg, 6kg, or 12kg.' });
    }

    // Look for an existing bottle mark
    let bottleMark = await BottleMark.findOne({ where: { name, size } });

    // If it doesn't exist, create it
    if (!bottleMark) {
      bottleMark = await BottleMark.create({
        name,
        size,
        image: '/assets/gasImages/default.png' // adjust path to the images on the frontend
      });
    }

    // Now use the bottleMark id (brand_id) to create the gas bottle
    const newBottle = await GasBottle.create({ shop_id, brand_id: bottleMark.id, size, filled, total, unit_price: unitPrice });
    res.status(201).json(newBottle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add gas bottle' });
  }
};

exports.getGasBottlesByShop = async (req, res) => {
  try {
    // console.log("yooooooooooooooooooooooo");

    const { shop_id } = req.params;
    console.log('shop_id param:', req.params);

    const bottles = await GasBottle.findAll({
      where: { shop_id },
      include: [
        {
          model: BottleMark,
          attributes: ['name', 'image', 'size']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formatted = bottles.map(bottle => ({
      id: bottle.id,
      name: bottle.BottleMark.name,
      image: bottle.BottleMark.image,
      size: bottle.BottleMark.size,
      filled: bottle.filled,
      total: bottle.total,
      unitPrice: bottle.unit_price,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve gas bottles' });
  }
};


exports.updateGasBottle = async (req, res) => {
  try {
    const { id } = req.params;
    const { filled, total, unitPrice } = req.body;

    console.log(`Updating gas bottle with id: ${id}`, req.body);

    const bottle = await GasBottle.findByPk(id);
    if (!bottle) {
      console.log(`Gas bottle with id ${id} not found`);
      return res.status(404).json({ message: 'Gas bottle not found' });
    }

    await bottle.update({
      filled,
      total,
      unit_price: unitPrice, // map camelCase to DB column
      updated_at: new Date(),
    });

    res.json(bottle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update gas bottle' });
  }
};

// ─── Shop Products ───────────────────────────────────────────
exports.addShopProduct = async (req, res) => {
  try {
    const { shop_id, category, productType, variant, price, quantity, image } = req.body;

    if (!shop_id || !category || !productType || price == null || quantity == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let imageId = null;

    // Save image in Firestore (base64 or object)
    if (image != null) {
      const imageDocRef = await db.collection('product_images').add({
        imageBase64: image,
        createdAt: new Date().toISOString(),
      });

       imageId = imageDocRef.id;
    }

    const product = await ShopProduct.create({
      shop_id,
      category,
      productType,
      variant,
      price,
      quantity,
      image: imageId,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product' });
  }
};

exports.getShopProductsByShop = async (req, res) => {
  const { shop_id } = req.params;
  if (!shop_id) return res.status(400).json({ error: "Missing shop_id" });

  try {
    const products = await ShopProduct.findAll({ where: { shop_id } });

    // Fetch Firestore image for each product
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      let imageBase64 = null;

      if (product.image) {
        try {
          const imageDoc = await db.collection('product_images').doc(product.image).get();
          if (imageDoc.exists) {
            imageBase64 = imageDoc.data().imageBase64;
          }
        } catch (err) {
          console.warn(`Could not fetch Firestore image for product ${product.id}:`, err.message);
        }
      }

      return {
        ...product.dataValues,
        image: imageBase64, // Replace Firestore doc ID with base64 image
      };
    }));

    return res.status(200).json(enrichedProducts);
  } catch (error) {
    console.error("getShopProductsByShop error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

exports.updateShopProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, quantity, imageBase64 } = req.body;

    const product = await ShopProduct.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let updatedFields = { price, quantity, updated_at: new Date() };

    // Handle Firestore image update
    if (imageBase64) {
      try {
        const newDocId = uuidv4(); // New Firestore doc ID
        await db.collection('product_images').doc(newDocId).set({ imageBase64 });

        // Optional: delete old image
        if (product.image) {
          await db.collection('product_images').doc(product.image).delete().catch(() => { });
        }

        updatedFields.image = newDocId;
      } catch (err) {
        console.error("Failed to update image in Firestore:", err.message);
      }
    }

    await product.update(updatedFields);
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update product' });
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

exports.getFuelInventoryByShop = async (req, res) => {
  try {
    const { shopId } = req.params; // path param
    const fuel = await FuelInventory.findAll({ where: { shop_id: shopId } });
    res.json(fuel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve fuel inventory' });
  }
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