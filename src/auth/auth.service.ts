import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthorizationCode } from './entities/auth-code.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AuthorizationCode)
    private authCodeRepository: Repository<AuthorizationCode>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async generateAuthCode(clientId: string, userId: string, redirectUri: string): Promise<string> {
    const code = uuidv4();
    const authCode = this.authCodeRepository.create({
      code,
      clientId,
      userId,
      redirectUri,
    });
    await this.authCodeRepository.save(authCode);
    return code;
  }

  async generateToken(code: string): Promise<{ access_token: string }> {
    const authCode = await this.authCodeRepository.findOne({ where: { code } });
    if (!authCode) {
      throw new UnauthorizedException('Invalid authorization code');
    }

    const user = await this.usersRepository.findOne({ where: { id: authCode.userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove the used authorization code
    await this.authCodeRepository.remove(authCode);

    // Generate JWT token
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}