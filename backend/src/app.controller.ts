import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AppService } from './app.service';
import type { TripInput } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';
import { RestaurantKnowledgeService } from './restaurant-knowledge.service';
import { SpecializedFoodAgent } from './specialized-food.agent';
import { RestaurantPhotoAgent } from './restaurant-photo.agent';
import { RestaurantDesignSupervisorAgent } from './restaurant-design-supervisor.agent';
import { PatriotEventsAgent } from './patriot-events.agent';
import { NycTransitAgent } from './nyc-transit.agent';
import { HomeVisualCuratorAgent } from './home-visual-curator.agent';
import { CultureCuratorAgent } from './culture-curator.agent';
import { NightlifeCuratorAgent } from './nightlife-curator.agent';
import { FreshnessSupervisorAgent } from './freshness-supervisor.agent';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly restaurantDiscoveryAgent: RestaurantDiscoveryAgent,
    private readonly restaurantKnowledgeService: RestaurantKnowledgeService,
    private readonly specializedFoodAgent: SpecializedFoodAgent,
    private readonly restaurantPhotoAgent: RestaurantPhotoAgent,
    private readonly restaurantDesignSupervisorAgent: RestaurantDesignSupervisorAgent,
    private readonly patriotEventsAgent: PatriotEventsAgent,
    private readonly nycTransitAgent: NycTransitAgent,
    private readonly homeVisualCuratorAgent: HomeVisualCuratorAgent,
    private readonly cultureCuratorAgent: CultureCuratorAgent,
    private readonly nightlifeCuratorAgent: NightlifeCuratorAgent,
    private readonly freshnessSupervisorAgent: FreshnessSupervisorAgent,
  ) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('places/featured')
  getFeaturedPlaces() {
    return this.appService.getFeaturedPlans();
  }

  @Get('restaurants')
  getRestaurants(
    @Query('price') price: string,
    @Query('maxDistanceKm') maxDistanceKm: string,
    @Query('minRating') minRating: string,
    @Query('cuisine') cuisine: string,
    @Query('hotelLat') hotelLat: string,
    @Query('hotelLng') hotelLng: string,
    @Query('maxResults') maxResults: string,
  ) {
    return this.appService.getRestaurants({
      price: price ?? '',
      maxDistanceKm: Number(maxDistanceKm),
      minRating: Number(minRating),
      cuisine: cuisine ?? '',
      hotelLat: Number(hotelLat),
      hotelLng: Number(hotelLng),
      maxResults: Number(maxResults),
    });
  }

  @Get('media/hero-image')
  getHeroImage() {
    return this.appService.getHeroImage();
  }

  @Get('location/search')
  searchLocation(@Query('q') query: string) {
    return this.appService.searchLocation(query ?? '');
  }

  @Get('weather/forecast')
  getWeatherForecast(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appService.getWeatherForecast(Number(lat), Number(lng), startDate, endDate);
  }

  @Post('trips')
  createTrip(@Body() body: TripInput) {
    return this.appService.createTrip(body);
  }

  @Put('trips/:tripId')
  updateTrip(@Param('tripId') tripId: string, @Body() body: TripInput) {
    return this.appService.updateTrip(tripId, body);
  }

  @Get('trips/:tripId')
  getTrip(@Param('tripId') tripId: string) {
    return this.appService.getTripById(tripId);
  }

  @Post('recommendations/day-plan')
  getDayPlan(@Body() body: { tripId: string; date: string }) {
    return this.appService.buildDayPlan(body.tripId, body.date);
  }

  @Get('agents/restaurants/discover')
  discoverRestaurants() {
    return this.restaurantDiscoveryAgent.discoverRestaurants();
  }

  @Post('agents/restaurants/sync')
  syncRestaurantKnowledgeDb() {
    return this.restaurantKnowledgeService.syncAll();
  }

  @Get('restaurants/db')
  async getRestaurantKnowledgeDb() {
    const db = await this.restaurantKnowledgeService.readDb();
    if (db) return db;
    return this.restaurantKnowledgeService.syncAll();
  }

  @Get('agents/restaurants/burgers')
  getBurgerRestaurants() {
    return this.specializedFoodAgent.discoverByFoodType('burgers');
  }

  @Get('agents/restaurants/pizzas')
  getPizzaRestaurants() {
    return this.specializedFoodAgent.discoverByFoodType('pizza');
  }

  @Get('agents/restaurants/photo')
  getPhotoForRestaurant(@Query('name') name: string) {
    return this.restaurantPhotoAgent.findPhotoForRestaurant(name ?? '');
  }

  @Get('agents/restaurants/design-audit')
  auditRestaurantDesign() {
    return this.restaurantDesignSupervisorAgent.auditRestaurantVisuals();
  }

  @Get('agents/patriot-events/briefing')
  getPatriotEventsBriefing() {
    return this.patriotEventsAgent.getBriefing();
  }

  @Post('agents/patriot-events/recommend')
  recommendPatriotEvents(@Body() body: { ageGroup?: string; weather?: string; preference?: string }) {
    return this.patriotEventsAgent.recommend(body);
  }

  @Get('agents/nyc-transit/briefing')
  getNycTransitBriefing() {
    return this.nycTransitAgent.getBriefing();
  }

  @Post('agents/nyc-transit/recommend')
  recommendNycTransit(
    @Body()
    body: {
      destination?: string;
      originLat?: number;
      originLng?: number;
      travelers?: number;
      priority?: 'fastest' | 'fewest_transfers' | 'accessible' | 'scenic';
    },
  ) {
    return this.nycTransitAgent.recommend(body);
  }

  @Get('agents/home-visual-curator/audit')
  auditHomeVisuals() {
    return this.homeVisualCuratorAgent.getHomeVisualAudit();
  }

  @Get('agents/culture-curator/briefing')
  getCultureCuratorBriefing() {
    return this.cultureCuratorAgent.getBriefing();
  }

  @Post('agents/culture-curator/recommend')
  recommendCulture(@Body() body: { ageGroup?: string; weather?: string; preference?: string }) {
    return this.cultureCuratorAgent.recommend(body);
  }

  @Get('agents/nightlife-curator/briefing')
  getNightlifeCuratorBriefing() {
    return this.nightlifeCuratorAgent.getBriefing();
  }

  @Post('agents/nightlife-curator/recommend')
  recommendNightlife(
    @Body()
    body: {
      mood?: string;
      budget?: string;
      music?: string;
      preference?: string;
    },
  ) {
    return this.nightlifeCuratorAgent.recommend(body);
  }

  @Get('agents/freshness-supervisor/briefing')
  getFreshnessSupervisorBriefing() {
    return this.freshnessSupervisorAgent.getBriefing();
  }

  @Get('agents/freshness-supervisor/audit')
  getFreshnessSupervisorAudit() {
    return this.freshnessSupervisorAgent.audit();
  }
}
