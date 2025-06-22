const { Shop, User, ShopLocation,BottleMark, GasBottle, ShopProduct, FuelInventory } = require('../models');
const sequelize = require('../models').sequelize;

exports.getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, radius = 5, type } = req.query;

    if (!lat || !lng || !type) {
      return res.status(400).json({ message: 'Latitude, longitude and type are required' });
    }

    // TEMP: return all shops with location data
    // const shops = await Shop.findAll({
    //   include: [
    //     {
    //       model: ShopLocation,
    //       attributes: ['latitude', 'longitude', 'city', 'region']
    //     },
    //     {
    //       model: GasBottle,
    //       required: type === 'gas',
    //     },
    //     {
    //       model: ShopProduct,
    //       required: type === 'petrol',
    //     }
    //   ]
    // });
    const query = `
      SELECT s.*, sl.latitude, sl.longitude, sl.city, sl.region
      FROM "Shops" s
      JOIN "ShopLocations" sl ON sl.shop_id = s.id
      WHERE (
        6371 * acos(
          cos(radians(:lat)) * cos(radians(sl.latitude)) *
          cos(radians(sl.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(sl.latitude))
        )
      ) <= :radius
    `;

    const [shops] = await sequelize.query(query, {
      replacements: { lat, lng, radius },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ shops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching nearby shops' });
  }
};

exports.searchShops = async (req, res) => {
  try {
    const { type, lat, lng, BottleMark, bottleSize, fuelType } = req.query;

    const gasBottleWhere = {};
    const fuelWhere = {};

    // Gas search logic
    if (type === 'gas' && BottleMark) {
      const mark = await BottleMark.findOne({ where: { name: BottleMark } });
      if (!mark) {
        return res.status(400).json({ message: `Bottle mark "${BottleMark}" not found` });
      }
      gasBottleWhere.brand_id = mark.id;
      if (bottleSize) gasBottleWhere.size = bottleSize;
    }

    // Fuel search logic
    if (type === 'petrol' && fuelType) {
      fuelWhere.fuel_type = fuelType;
    }

    // Final query
    const shops = await Shop.findAll({
      include: [
        {
          model: GasBottle,
          where: type === 'gas' ? gasBottleWhere : undefined,
          required: type === 'gas',
        },
        {
          model: FuelInventory,
          where: type === 'petrol' ? fuelWhere : undefined,
          required: type === 'petrol',
        },
        {
          model: ShopLocation,
        },
      ],
    });

    res.json(shops);
  } catch (error) {
    console.error("❌ Search failed:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};



exports.getShopDetails = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id, {
      include: [
        { model: GasBottle },
        { model: ShopProduct },
        { model: FuelInventory },
        { model: ShopLocation }
      ]
    });

    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch shop details' });
  }
};

exports.createShop = async (req, res) => {
  try {
    const { name, niu_uin, location, latitude, longitude, city, region } = req.body;

    const shop = await Shop.create({
      name,
      niu_uin,
      location,
      user_id: req.user.id
    });

    await ShopLocation.create({
      shop_id: shop.id,
      latitude,
      longitude,
      address: location,
      city,
      region
    });

    res.status(201).json({ shop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create shop' });
  }
};
