const { Order, OrderItem, User, Shop } = require('../models');

exports.createOrder = async (req, res) => {
  const { shop_id, total_amount, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one order item is required.' });
  }

  try {
    const order = await Order.create({
      user_id: req.user.id,
      shop_id,
      total_amount,
      status: 'pending'
    });

    const itemRecords = items.map(item => ({
      order_id: order.id,
      product_type: item.product_type,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    await OrderItem.bulkCreate(itemRecords);

    res.status(201).json({ order_id: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem }]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Optional: verify shop ownership using req.user.id

    await order.update({ status });
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};
