// TODO: obviously remove this
// @ts-nocheck
import { IConfig } from "./types";
import { DeepPartial, IS_PROD } from "../../types";

export const c = (): DeepPartial<IConfig> => {
  return {
    port: parseInt(process.env.PORT as string, 10) || 1338,
    propel: {
      clientUrl: process.env.PROPEL_CLIENT_URL,
      apiUrl: process.env.PROPEL_API_URL,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      secure: IS_PROD,
      port: parseInt(process.env.SMTP_PORT as string, 10),
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS,
      },
    },
    email: {
      senderAddress: process.env.SENDER_ADDRESS,
    },
    secret: {
      betterAuth: process.env.BETTER_AUTH_SECRET,
    },
    postgres: {
      connectionString: process.env.DATABASE_URL,
    },
    redis: {
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      port: parseInt(process.env.PORT as string, 10) || 6379,
    },
  };
};

// app only runs when ^config is validated in main.ts
export const config = c() as IConfig;
