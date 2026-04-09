import { betterAuth } from "better-auth";
import { openAPI, bearer, admin, username } from "better-auth/plugins";
import { config } from "../common/config";
import { mikroOrmAdapter } from "better-auth-mikro-orm";
import { FIVE_MIN_AS_SECONDS } from "../types";
import { Logger } from "@nestjs/common";
import { ormSync } from "../db/orm";

const trustedOrigins: string[] = [];
if (process.env.CORS_ORIGIN) {
  trustedOrigins.push(process.env.CORS_ORIGIN);
}

export const auth = betterAuth({
  appName: "propel",
  baseURL: config.propel.apiUrl,
  trustedOrigins: [config.propel.clientUrl],
  secret: config.secret.betterAuth,
  database: mikroOrmAdapter(ormSync),
  logger: new Logger("BettterAuth"),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: FIVE_MIN_AS_SECONDS,
    },
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(),
    username({
      usernameValidator: (user) => user != "admin",
    }),
    admin(),
    openAPI(),
  ],
  advanced: {
    disableCSRFCheck: false,
    database: {
      generateId: false,
    },
  },
  hooks: {},
});
