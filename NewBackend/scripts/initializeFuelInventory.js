const { Shop, FuelInventory } = require('../models');
const { v4: uuidv4 } = require('uuid');

const FUEL_TYPES = ['gasoil', 'super', 'diesel', 'kerosene'];

const initializeFuelInventory = async () => {
  try {
    const shops = await Shop.findAll();

    for (const shop of shops) {
      for (const type of FUEL_TYPES) {
        // Check if inventory for this fuel type already exists
        const exists = await FuelInventory.findOne({
          where: { shop_id: shop.id, fuel_type: type }
        });

        if (!exists) {
          await FuelInventory.create({
            id: uuidv4(),
            shop_id: shop.id,
            fuel_type: type,
            tank_level_percentage: 0,
            price_per_liter: 0,
            remaining_liters: 0,
          });
          console.log(`✅ Created ${type} fuel inventory for shop ${shop.name}`);
        }
      }
    }

    console.log("🎉 Fuel inventory initialized for all shops.");
    process.exit();
  } catch (err) {
    console.error("❌ Error initializing fuel inventory:", err);
    process.exit(1);
  }
};

initializeFuelInventory();
