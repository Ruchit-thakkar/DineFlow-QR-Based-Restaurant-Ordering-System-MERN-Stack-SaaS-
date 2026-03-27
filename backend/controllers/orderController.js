const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, totalAmount } = req.body;
    const order = await Order.create({ tableId, items, totalAmount, status: 'PENDING' });
    
    // Populate table name for real-time notification
    const populatedOrder = await Order.findById(order._id).populate('tableId', 'name');
    
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('new_order', populatedOrder);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('tableId', 'name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const validTransitions = {
      'PENDING': ['MAKING'],
      'MAKING': ['READY'],
      'READY': ['CONFIRMED'],
      'CONFIRMED': []
    };
    
    if (validTransitions[order.status] && validTransitions[order.status].includes(status)) {
      order.status = status;
      await order.save();
      
      const updatedOrder = await Order.findById(order._id).populate('tableId', 'name');
      const io = req.app.get('io');
      io.emit('order_updated', updatedOrder);

      return res.json(updatedOrder);
    } else {
      return res.status(400).json({ message: `Invalid transition from ${order.status} to ${status}` });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // 24 hours only
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const orders = await Order.find({ createdAt: { $gte: yesterday } });
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'CONFIRMED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
      
    res.json({ totalOrders, pendingOrders, confirmedOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const { computeBillData } = require('../utils/computeBill');

exports.getOrderBill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('tableId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const billDetails = await computeBillData(order);
    res.json({ order, billDetails });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const confirmedOrders = await Order.find({ status: 'CONFIRMED' }).populate('tableId', 'name');

    // 1. Today's Revenue
    const todayRevenue = confirmedOrders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Best Selling Items
    const itemSales = {};
    confirmedOrders.forEach(o => {
      o.items.forEach(item => {
        itemSales[item.title] = (itemSales[item.title] || 0) + item.quantity;
      });
    });
    const bestSellers = Object.entries(itemSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 3. Peak Hours (Last 7 days for better average, or just all time for now)
    const hourlyData = Array(24).fill(0);
    confirmedOrders.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      hourlyData[hour]++;
    });
    const peakHours = hourlyData.map((count, hour) => ({
      hour: `${hour}:00`,
      orders: count
    }));

    // 4. Table Performance
    const tableStats = {};
    confirmedOrders.forEach(o => {
      const tableName = o.tableId?.name || 'Unknown';
      if (!tableStats[tableName]) {
        tableStats[tableName] = { name: tableName, revenue: 0, orders: 0 };
      }
      tableStats[tableName].revenue += o.totalAmount;
      tableStats[tableName].orders += 1;
    });
    const tablePerformance = Object.values(tableStats)
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      todayRevenue,
      totalOrders: confirmedOrders.length,
      bestSellers,
      peakHours,
      tablePerformance
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
