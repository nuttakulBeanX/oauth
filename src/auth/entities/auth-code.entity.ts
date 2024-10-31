import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuthorizationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  clientId: string;

  @Column()
  userId: string;

  @Column()
  redirectUri: string;

  @CreateDateColumn()
  createdAt: Date;
}