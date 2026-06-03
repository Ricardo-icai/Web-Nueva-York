import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';
import { RestaurantKnowledgeService } from './restaurant-knowledge.service';
import { RestaurantWebEnrichmentAgent } from './restaurant-web-enrichment.agent';
import { SpecializedFoodAgent } from './specialized-food.agent';
import { RestaurantPhotoAgent } from './restaurant-photo.agent';
import { RestaurantDesignSupervisorAgent } from './restaurant-design-supervisor.agent';
import { PatriotEventsAgent } from './patriot-events.agent';
import { NycTransitAgent } from './nyc-transit.agent';
import { HomeVisualCuratorAgent } from './home-visual-curator.agent';
import { CultureCuratorAgent } from './culture-curator.agent';

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
    RestaurantDesignSupervisorAgent,
    PatriotEventsAgent,
    NycTransitAgent,
    HomeVisualCuratorAgent,
    CultureCuratorAgent,
  ],
})
export class AppModule {}
