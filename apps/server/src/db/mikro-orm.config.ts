import { config } from "@/common/config";
import { Migrator } from "@mikro-orm/migrations";
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { NodeEnvironment } from "@/types";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";

export const baseCfg: PostgreSqlOptions = {
  driver: PostgreSqlDriver,
  forceUtcTimezone: true,
  clientUrl: config.postgres.connectionString,
  ...(process.env.NODE_ENV === NodeEnvironment.Dev && {
    logger: (msg: unknown) => console.log("[MikroORM]", msg),
    verbose: true,
    debug: true,
  }),
};

export const cfg: PostgreSqlOptions = {
  ...baseCfg,
  baseDir: process.cwd(),
  metadataProvider: ReflectMetadataProvider,
  entities: ["dist/**/*.entity.js"],
  extensions: [Migrator],
  migrations: {
    pathTs: "./src/db/migrations",
    path: "./dist/src/db/migrations",
    transactional: true,
    allOrNothing: true,
  },
};

export type PostgreSqlOptions = Parameters<typeof defineConfig>[0];
const mikroConfig = defineConfig(cfg);

export default mikroConfig;
