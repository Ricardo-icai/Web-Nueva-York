import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import type { TripInput } from './app.service';
import { RestaurantDiscoveryAgent } from './restaurant-discovery.agent';
import { RestaurantKnowledgeService } from './restaurant-knowledge.service';
import { SpecializedFoodAgent } from './specialized-food.agent';
import { RestaurantPhotoAgent } from './restaurant-photo.agent';
import { RestaurantDesignSupervisorAgent } from './restaurant-design-supervisor.agent';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly restaurantDiscoveryAgent: RestaurantDiscoveryAgent,
    private readonly restaurantKnowledgeService: RestaurantKnowledgeService,
    private readonly specializedFoodAgent: SpecializedFoodAgent,
    private readonly restaurantPhotoAgent: RestaurantPhotoAgent,
    private readonly restaurantDesignSupervisorAgent: RestaurantDesignSupervisorAgent,
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
}
