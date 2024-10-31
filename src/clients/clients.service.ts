import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async createClient(name: string, redirectUri: string): Promise<Client> {
    const client = this.clientsRepository.create({
      name,
      clientId: uuidv4(),
      clientSecret: uuidv4(),
      redirectUri,
    });
    return this.clientsRepository.save(client);
  }

  async validateClient(clientId: string, redirectUri: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { clientId } });
    if (!client || client.redirectUri !== redirectUri) {
      throw new UnauthorizedException('Invalid client or redirect URI');
    }
    return client;
  }

  async validateClientCredentials(clientId: string, clientSecret: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { clientId } });
    if (!client || client.clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }
    return client;
  }
}