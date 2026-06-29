import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Product {
  @ApiProperty()
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty()
  @Prop({ default: '' })
  description: string;

  @ApiProperty()
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ nullable: true })
  @Prop({ default: null })
  imageUrl: string;

  @ApiProperty()
  @Prop({ required: true, trim: true })
  category: string;

  @ApiProperty()
  @Prop({ default: 0, min: 0 })
  stockQuantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
