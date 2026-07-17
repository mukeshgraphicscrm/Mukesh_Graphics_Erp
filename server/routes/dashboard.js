const express = require('express');
const { db } = require('../firebase');

const router = express.Router();

router.get('/kpi', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not initialized' });
  
  try {
    // This is a stub. In a real app, you would run aggregate queries.
    // For demo purposes, we might fetch all and reduce, or use Firestore aggregation if available.
    
    // Stubbed response matching the mockup
    const kpi = {
      totalOrders: { value: 0, subtitle: '0 this week' },
      runningJobs: { value: 0, subtitle: '0 stages active' },
      completedMonth: { value: 0, subtitle: '0% vs last month' },
      pendingDispatches: { value: 0, subtitle: '0 scheduled today' },
      pendingPayments: { value: '₹0', subtitle: '₹0 overdue' },
      monthlyRevenue: { value: '₹0', subtitle: 'Current Month' },
      monthlyProfit: { value: '₹0', subtitle: '0% margin' },
      activeCustomers: { value: 0, subtitle: '0 new this month' },
    };

    const charts = {
      revenueLine: [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Apr', value: 0 },
        { name: 'May', value: 0 },
        { name: 'Jun', value: 0 },
      ],
      orderStatus: [
        { name: 'Completed', value: 0, color: '#16A34A' },
        { name: 'Running', value: 0, color: '#2563EB' },
        { name: 'Pending', value: 0, color: '#D97706' },
        { name: 'Delayed', value: 0, color: '#DC2626' },
      ],
      productionStages: [
        { name: 'Printing', value: 0 },
        { name: 'Coating', value: 0 },
        { name: 'Lamination', value: 0 },
        { name: 'Die Cutting', value: 0 },
        { name: 'Folding', value: 0 },
        { name: 'Packing', value: 0 },
      ],
      recentActivities: []
    };

    res.json({ kpi, charts });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
