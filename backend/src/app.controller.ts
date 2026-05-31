import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import type { TripInput } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
