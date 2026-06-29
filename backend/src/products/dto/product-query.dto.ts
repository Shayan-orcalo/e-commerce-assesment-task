import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'newest'], default: 'newest' })
  @IsOptional() @IsIn(['price_asc', 'price_desc', 'newest']) sort?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 12 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number;
}
