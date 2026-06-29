import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async findAll(query: ProductQueryDto) {
    const { search, category, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = query;
    const filter: any = {};

    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const sortMap: Record<string, any> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sortMap[sort]).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { data: data.map((p) => p.toJSON()), total, page, limit };
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Product not found');
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product.toJSON();
  }

  async getSuggestions(productId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(productId)) return [];
    const product = await this.productModel.findById(productId).exec();
    if (!product) return [];

    // Same category, excluding current product
    const suggestions = await this.productModel
      .find({ category: product.category, _id: { $ne: product._id } })
      .limit(4)
      .exec();

    // Pad with other products if less than 4
    if (suggestions.length < 4) {
      const existingIds = [product._id, ...suggestions.map((s) => s._id)];
      const extras = await this.productModel
        .find({ _id: { $nin: existingIds } })
        .limit(4 - suggestions.length)
        .exec();
      suggestions.push(...extras);
    }

    return suggestions.map((p) => p.toJSON());
  }

  async create(dto: CreateProductDto): Promise<any> {
    const product = await this.productModel.create(dto);
    return product.toJSON();
  }

  async update(id: string, dto: UpdateProductDto): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Product not found');
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product.toJSON();
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Product not found');
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    await this.productModel.findByIdAndDelete(id).exec();
  }

  // Used by orders service — decrement stock atomically
  async decrementStock(id: string, quantity: number): Promise<boolean> {
    const result = await this.productModel.findOneAndUpdate(
      { _id: id, stockQuantity: { $gte: quantity } },
      { $inc: { stockQuantity: -quantity } },
      { new: true },
    ).exec();
    return result !== null;
  }
}
