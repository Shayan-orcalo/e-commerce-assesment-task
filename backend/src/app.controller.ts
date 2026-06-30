import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'LuxeShop API is running',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
    };
  }
}
