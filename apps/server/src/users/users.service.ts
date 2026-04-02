import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(UsersService.name);
  }

  private users: User[] = [];
  private nextId = 1;

  create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.nextId++,
      email: createUserDto.email,
      name: createUserDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    this.logger.info({ msg: 'User created', userId: user.id });
    return Promise.resolve(user);
  }

  findAll(): Promise<User[]> {
    this.logger.debug({ msg: 'Finding all users' });
    return Promise.resolve(this.users);
  }

  async findOne(id: number): Promise<User> {
    this.logger.debug({ msg: 'Finding user by ID', id });
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      this.logger.warn({ msg: 'User not found', id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto, { updatedAt: new Date() });
    this.logger.info({ msg: 'User updated', id });
    return user;
  }

  async remove(id: number): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      this.logger.warn({ msg: 'User not found for deletion', id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(index, 1);
    this.logger.info({ msg: 'User removed', id });
  }
}
