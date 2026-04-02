import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './common/logger.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [LoggerModule.forRoot(loggerConfig), UsersModule],
})
export class AppModule {}
