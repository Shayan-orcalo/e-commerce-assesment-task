import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/order.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async getDashboard() {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Orders by status
    const statusCounts = await this.orderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const ordersByStatus: Record<string, number> = {};
    statuses.forEach((s) => (ordersByStatus[s] = 0));
    statusCounts.forEach((s) => (ordersByStatus[s._id] = s.count));

    // Total revenue (exclude cancelled)
    const revenueResult = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;

    // Top 5 products by units sold
    const topProducts = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          productName: 1,
          unitsSold: 1,
          revenue: 1,
        },
      },
    ]);

    return { totalRevenue: Math.round(totalRevenue * 100) / 100, ordersByStatus, topProducts };
  }
}
