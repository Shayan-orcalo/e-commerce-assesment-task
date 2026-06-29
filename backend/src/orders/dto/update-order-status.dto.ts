import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['processing', 'shipped', 'delivered', 'cancelled'] })
  @IsIn(['processing', 'shipped', 'delivered', 'cancelled'])
  status: string;
}
