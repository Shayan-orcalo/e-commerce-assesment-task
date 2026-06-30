import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String, role: { type: String, default: 'customer' },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String, description: String, price: Number, imageUrl: String,
  category: String, stockQuantity: Number,
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
const ProductModel = mongoose.model('Product', productSchema);

const products = [
  { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium audio with active noise cancellation. 30-hour battery life.', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', category: 'Electronics', stockQuantity: 45 },
  { name: 'Smart Watch Pro', description: 'Track fitness, receive notifications, and more. Water resistant.', price: 149.99, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', category: 'Electronics', stockQuantity: 30 },
  { name: 'Mechanical Keyboard', description: 'Tactile cherry MX switches. RGB backlit. Compact tenkeyless layout.', price: 74.99, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', category: 'Electronics', stockQuantity: 25 },
  { name: 'USB-C Hub 7-in-1', description: 'HDMI 4K, USB 3.0, SD card, 100W PD charging. Works with all laptops.', price: 34.99, imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', category: 'Electronics', stockQuantity: 60 },
  { name: 'Classic Oxford Shirt', description: 'Premium cotton Oxford weave. Slim fit, wrinkle-resistant. 6 colours.', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', category: 'Clothing', stockQuantity: 80 },
  { name: 'Slim Fit Chinos', description: 'Stretch twill fabric for all-day comfort. Machine washable.', price: 44.99, imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500', category: 'Clothing', stockQuantity: 55 },
  { name: 'Leather Bifold Wallet', description: 'Genuine full-grain leather. 8 card slots, 2 note compartments.', price: 29.99, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', category: 'Accessories', stockQuantity: 100 },
  { name: 'Atomic Habits', description: 'By James Clear. The #1 bestseller on building good habits and breaking bad ones.', price: 12.99, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', category: 'Books', stockQuantity: 200 },
  { name: 'The Psychology of Money', description: 'Morgan Housel on wealth, greed, and happiness. A modern classic.', price: 11.99, imageUrl: 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=500', category: 'Books', stockQuantity: 150 },
  { name: 'Yoga Mat Premium', description: 'Non-slip eco-friendly TPE material. 6mm thick. Includes carrying strap.', price: 27.99, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', category: 'Sports', stockQuantity: 40 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    console.log('🗑  Cleared existing data');

    const adminHash = await bcrypt.hash('Admin1234!', 12);
    const customerHash = await bcrypt.hash('Customer1234!', 12);

    await UserModel.create([
      { name: 'Admin User', email: 'admin@shop.com', passwordHash: adminHash, role: 'admin' },
      { name: 'John Customer', email: 'customer@shop.com', passwordHash: customerHash, role: 'customer' },
    ]);
    console.log('👤 Created 2 users (admin + customer)');

    await ProductModel.insertMany(products);
    console.log(`📦 Created ${products.length} products`);

    console.log('\n🎉 Seed complete!\n');
    console.log('  Admin:    admin@shop.com    / Admin1234!');
    console.log('  Customer: customer@shop.com / Customer1234!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
