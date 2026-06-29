import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class AddItemDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty({ default: 1 }) @IsInt() @Min(1) quantity: number;
}

class UpdateItemDto {
  @ApiProperty() @IsInt() @Min(0) quantity: number;
}

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@CurrentUser() user: any, @Body() body: AddItemDto) {
    return this.cartService.addItem(user.id, body.productId, body.quantity);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(@CurrentUser() user: any, @Param('itemId') itemId: string, @Body() body: UpdateItemDto) {
    return this.cartService.updateItem(user.id, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
