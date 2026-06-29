import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async createOrder(userId: string, items: Array<{ productId: string; quantity: number }>) {
    if (!items || items.length === 0)
      throw new BadRequestException('Cart is empty');

    const orderItems: any[] = [];
    let total = 0;

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (product.stockQuantity < item.quantity)
        throw new ConflictException(`Insufficient stock for: ${product.name}`);

      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      orderItems.push({
        _id: new Types.ObjectId(),
        productId: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    for (const item of items) {
      const success = await this.productsService.decrementStock(item.productId, item.quantity);
      if (!success)
        throw new ConflictException(`Insufficient stock for product: ${item.productId}`);
    }

    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      total: Math.round(total * 100) / 100,
      status: 'pending',
      items: orderItems,
    });

    return order.toJSON();
  }

  async findUserOrders(userId: string) {
    const uid = new Types.ObjectId(userId);
    const orders = await this.orderModel
      .find({ userId: uid })
      .sort({ createdAt: -1 })
      .exec();
    return orders.map((o) => o.toJSON());
  }

  async findUserOrderById(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) throw new NotFoundException('Order not found');
    const uid = new Types.ObjectId(userId);
    const order = await this.orderModel.findOne({ _id: orderId, userId: uid }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order.toJSON();
  }

  async findAllOrders() {
    const orders = await this.orderModel
      .find()
      .populate({ path: 'userId', model: 'User', select: 'name email' })
      .sort({ createdAt: -1 })
      .exec();

    return orders.map((o) => {
      const json = o.toJSON() as any;
      if (o.userId && typeof o.userId === 'object') {
        const u = o.userId as any;
        json.user = { id: u._id?.toString(), name: u.name, email: u.email };
      }
      return json;
    });
  }

  async updateStatus(orderId: string, status: string) {
    if (!Types.ObjectId.isValid(orderId)) throw new NotFoundException('Order not found');
    const order = await this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order.toJSON();
  }
}
