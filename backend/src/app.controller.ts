import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get('media/hero-image')
  getHeroImage() {
    return this.appService.getHeroImage();
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
