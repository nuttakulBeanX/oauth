import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientsService } from '../clients/clients.service';
import { AuthGuard } from './auth.guard';

@Controller('oauth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientsService: ClientsService,
  ) {}

  @Get('authorize')
  async authorize(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('response_type') responseType: string,
  ) {
    // Validate client and redirect URI
    await this.clientsService.validateClient(clientId, redirectUri);
    
    // Return login form view (in real implementation, you'd render a template)
    return {
      client_id: clientId,
      redirect_uri: redirectUri,
    };
  }

  @Post('authorize')
  async handleAuthorize(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('client_id') clientId: string,
    @Body('redirect_uri') redirectUri: string,
  ) {
    const user = await this.authService.validateUser(username, password);
    const code = await this.authService.generateAuthCode(clientId, user.id, redirectUri);
    
    return {
      redirect_uri: `${redirectUri}?code=${code}`,
    };
  }

  @Post('token')
  async token(
    @Body('grant_type') grantType: string,
    @Body('code') code: string,
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
  ) {
    // Validate client credentials
    await this.clientsService.validateClientCredentials(clientId, clientSecret);
    
    if (grantType !== 'authorization_code') {
      throw new Error('Unsupported grant type');
    }

    return this.authService.generateToken(code);
  }

  @Get('userinfo')
  @UseGuards(AuthGuard)
  getUserInfo(@Req() req) {
    return req.user;
  }
}