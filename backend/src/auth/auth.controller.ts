import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FourtyTwoGuard, JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('42')
  async fortyTwoLogin() {
    return {
      msg: 'done',
    };
  }

  @UseGuards(FourtyTwoGuard)
  @Get('42/callback')
  async fortyTwoLoginCallback(@Req() req) {
    return this.authService.callback(req.user);
  }
}
