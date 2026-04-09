import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "../auth/entities/user.entity";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  private logger: Logger = new Logger(UsersService.name);

  private users: User[] = [];
  private nextId = 1;

  create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.nextId.toString(),
      email: createUserDto.email,
      name: createUserDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
    };
    this.users.push(user);
    this.logger.log({ msg: "User created", userId: user.id });
    return Promise.resolve(user);
  }

  findAll(): Promise<User[]> {
    this.logger.debug({ msg: "Finding all users" });
    return Promise.resolve(this.users);
  }

  async findOne(id: string): Promise<User> {
    this.logger.debug({ msg: "Finding user by ID", id });
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      this.logger.warn({ msg: "User not found", id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto, { updatedAt: new Date() });
    this.logger.log({ msg: "User updated", id });
    return user;
  }

  async remove(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      this.logger.warn({ msg: "User not found for deletion", id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(index, 1);
    this.logger.log({ msg: "User removed", id });
  }
}
