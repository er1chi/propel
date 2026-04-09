import { MikroORM } from "@mikro-orm/core";
import { baseCfg } from "@/db/mikro-orm.config";
import { BaseEntity } from "@/auth/entities/base.entity";
import { Account } from "@/auth/entities/account.entity";
import { User } from "@/auth/entities/user.entity";
import { Verification } from "@/auth/entities/verification.entity";

// for use w/ current impl of better-auth
export const ormSync = new MikroORM({
  ...baseCfg,
  entities: [BaseEntity, User, Account, Verification],
});
