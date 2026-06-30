import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(private config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createPaymentIntent(amount: number): Promise<{ clientSecret: string; isMock?: boolean }> {
    if (this.stripe) {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method_types: ['card'],
      });
      return { clientSecret: intent.client_secret! };
    }
    return { clientSecret: `pi_mock_${Date.now()}_secret_demo`, isMock: true };
  }
}
