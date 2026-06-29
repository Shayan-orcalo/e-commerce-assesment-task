import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class OrderItem {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', default: null })
  productId: Types.ObjectId | null;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  priceAtPurchase: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = Order & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.items) {
        ret.items = ret.items.map((item: any) => ({
          id: item._id?.toString(),
          productId: item.productId?.toString() || null,
          productName: item.productName,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        }));
      }
      return ret;
    },
  },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
