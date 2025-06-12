const { Shop, User, ShopLocation, GasBottle, ShopProduct, FuelInventory } = require('../models');

exports.getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, radius = 1, type } = req.query;

    if (!lat || !lng || !type) {
      return res.status(400).json({ message: 'Latitude, longitude and type are required' });
    }

    // TEMP: return all shops with location data
    const shops = await Shop.findAll({
      include: [
        {
          model: ShopLocation,
          attributes: ['latitude', 'longitude', 'city', 'region']
        },
        {
          model: GasBottle,
          required: type === 'gas',
        },
        {
          model: ShopProduct,
          required: type === 'petrol',
        }
      ]
    });

    res.json({ shops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching nearby shops' });
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
