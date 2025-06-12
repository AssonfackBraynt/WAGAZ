const { User, Shop, ShopLocation } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const { firstName, lastName, phone, whatsappNumber, password, userType, shopName, niu, location, latitude, longitude } = req.body;

    if (!firstName || !lastName || !phone || !email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const existing = await User.findOne({ where: { email, phone } });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      whatsappNumber,
      password_hash: hash,
      userType
    });

    let shop = null;

    // If user is a partner, create a shop and shop location
    if (userType === 'partner') {
      if (!shopName || !niu || !location || !latitude || !longitude) {
        return res.status(400).json({ message: "Missing shop information" });
      }

      // Create shop
      shop = await Shop.create({
        name: shopName,
        niu_uin: niu,
        location,
        user_id: user.id
      });

      // Create shop location
      await ShopLocation.create({
        shop_id: shop.id,
        latitude,
        longitude,
        address: location.address,
        city: location.city || null,
        region: location.region || null
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
       user: { id: user.id, email: user.email, userType: user.userType },
      ...(shop ? { shopId: shop.id } : {}) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, email: user.email, userType: user.userType } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
