import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RestaurantDiscoveryAgent],
})
export class AppModule {}
