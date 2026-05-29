import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { CacheModule } from "@nestjs/cache-manager";
import { MailerModule } from "@nestjs-modules/mailer";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import { createKeyv } from "@keyv/redis";

import { AuthModule } from "@thallesp/nestjs-better-auth";
import { ContactsModule } from "./contacts/contacts.module";

import mikroConfig from "./db/mikro-orm.config";
import { c } from "./common/config";
import { auth } from "@/auth/auth";

import { NodeEnvironment } from "./types";
import { IConfig } from "@/common/config/types";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [c],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== NodeEnvironment.Prod
            ? { target: "pino-pretty" }
            : undefined,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService<IConfig>) => {
        const r = <IConfig["redis"]>configService.get("redis", { infer: true });

        return {
          stores: [createKeyv(`redis://${r.host}:${r.port}`)],
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<IConfig>) => {
        return {
          transport: {
            host: configService.get("smtp.host", { infer: true }),
            port: configService.get("smtp.port", { infer: true }),
            secure: configService.get("smtp.secure", { infer: true }),
            auth: {
              user: configService.get("smtp.auth.user", { infer: true }),
              pass: configService.get("smtp.auth.pass", { infer: true }),
            },
          },
          defaults: {
            from: configService.get("email.senderAddress", { infer: true }),
          },
        };
      },
      inject: [ConfigService],
    }),
    MikroOrmModule.forRoot(mikroConfig),
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: "2mb" },
        urlencoded: { limit: "2mb", extended: true },
        rawBody: true,
      },
    }),
    ContactsModule,
  ],
})
export class AppModule {}
