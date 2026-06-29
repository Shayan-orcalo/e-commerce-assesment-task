import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsNumber, Min } from 'class-validator';

class CreatePaymentIntentDto {
  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}

@ApiTags('Payments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create a mock payment intent (returns clientSecret)' })
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto.amount);
  }
}
