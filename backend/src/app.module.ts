import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';
import { RestaurantKnowledgeService } from './restaurant-knowledge.service';
import { RestaurantWebEnrichmentAgent } from './restaurant-web-enrichment.agent';
import { SpecializedFoodAgent } from './specialized-food.agent';
import { RestaurantPhotoAgent } from './restaurant-photo.agent';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    RestaurantDiscoveryAgent,
    RestaurantKnowledgeService,
    RestaurantWebEnrichmentAgent,
    SpecializedFoodAgent,
    RestaurantPhotoAgent,
  ],
})
export class AppModule {}
