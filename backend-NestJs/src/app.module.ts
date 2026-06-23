import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { BugReportsModule } from './bug-reports/bug-reports.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { ApiDocsModule } from './api-docs/api-docs.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    UsersModule,
    OrdersModule,
    OrderItemsModule,
    CartModule,
    ReviewsModule,
    NotificationsModule,
    TransactionsModule,
    ShipmentsModule,
    BugReportsModule,
    PaymentMethodsModule,
    ExchangeRateModule,
    ApiDocsModule,
  ],
})
export class AppModule {}
