import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create order from cart items (mock payment accepted)' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto.items);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List current user orders' })
  getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a specific order (own orders only)' })
  getUserOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findUserOrderById(user.id, id);
  }

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List all orders' })
  getAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
