import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'mock_pi_1234567890', description: 'Payment intent ID from payment step' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Cart items to order' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
