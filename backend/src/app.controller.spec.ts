import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';
import { RestaurantDesignSupervisorAgent } from './restaurant-design-supervisor.agent';
import { RestaurantKnowledgeService } from './restaurant-knowledge.service';
import { RestaurantPhotoAgent } from './restaurant-photo.agent';
import { SpecializedFoodAgent } from './specialized-food.agent';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: RestaurantDiscoveryAgent, useValue: { discoverRestaurants: jest.fn() } },
        { provide: RestaurantKnowledgeService, useValue: { readDb: jest.fn(), syncAll: jest.fn() } },
        { provide: SpecializedFoodAgent, useValue: { discoverByFoodType: jest.fn() } },
        { provide: RestaurantPhotoAgent, useValue: { findPhotoForRestaurant: jest.fn() } },
        { provide: RestaurantDesignSupervisorAgent, useValue: { auditRestaurantVisuals: jest.fn() } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return API health', () => {
      expect(appController.getHealth()).toMatchObject({
        status: 'ok',
        service: 'nyc-family-planner-api',
      });
    });
  });
});
