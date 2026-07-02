import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUrl, Min, MinLength, MaxLength, IsInt } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'High-quality audio experience' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @MinLength(1)
  category: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stockQuantity: number;
}
