import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Health check used by Render and the README. */
  @Get()
  getHealth() {
    return this.appService.getHealth();
  }
}
