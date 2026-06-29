import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    },
  },
})
export class User {
  @ApiProperty()
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @ApiProperty({ enum: ['customer', 'admin'] })
  @Prop({ enum: ['customer', 'admin'], default: 'customer' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
