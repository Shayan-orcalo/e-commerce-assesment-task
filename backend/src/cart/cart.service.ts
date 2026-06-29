import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productsService: ProductsService,
  ) {}

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) cart = await this.cartModel.create({ userId, items: [] });
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const populated = await cart.populate({ path: 'items.productId', model: 'Product' });
    return this.formatCart(populated);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.stockQuantity < quantity)
      throw new BadRequestException(`Only ${product.stockQuantity} items in stock`);

    const cart = await this.getOrCreateCart(userId);
    const existingIdx = cart.items.findIndex(
      (i) => i.productId.toString() === productId,
    );

    if (existingIdx >= 0) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > product.stockQuantity)
        throw new BadRequestException(`Only ${product.stockQuantity} items available`);
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({ _id: new Types.ObjectId(), productId: new Types.ObjectId(productId), quantity });
    }

    await cart.save();
    const populated = await cart.populate({ path: 'items.productId', model: 'Product' });
    return this.formatCart(populated);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i._id.toString() === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i._id.toString() !== itemId) as any;
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await cart.populate({ path: 'items.productId', model: 'Product' });
    return this.formatCart(populated);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    cart.items = cart.items.filter((i) => i._id.toString() !== itemId) as any;
    await cart.save();
    const populated = await cart.populate({ path: 'items.productId', model: 'Product' });
    return this.formatCart(populated);
  }

  async clearCart(userId: string) {
    await this.cartModel.findOneAndUpdate({ userId }, { items: [] }).exec();
    return { message: 'Cart cleared' };
  }

  // Used by orders service
  async getRawCart(userId: string): Promise<CartDocument | null> {
    return this.cartModel.findOne({ userId }).populate({ path: 'items.productId', model: 'Product' }).exec();
  }

  private formatCart(cart: CartDocument) {
    const json = cart.toJSON() as any;
    json.items = json.items.map((item: any) => ({
      id: item._id?.toString() || item.id,
      productId: item.productId?._id?.toString() || item.productId?.id || item.productId?.toString(),
      quantity: item.quantity,
      product: item.productId && typeof item.productId === 'object' ? item.productId : undefined,
    }));
    return json;
  }
}
