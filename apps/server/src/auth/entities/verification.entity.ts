import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { randomUUID } from "node:crypto";
import { BaseEntity } from "./base.entity";

@Entity({ tableName: "verifications" })
export class Verification extends BaseEntity {
  @PrimaryKey({
    type: "string",
    comment: "Primary key for the verification record",
  })
  id: string = randomUUID();

  @Property({
    type: "string",
    comment: "Identifier for the verification (e.g., email or user ID)",
  })
  identifier!: string;

  @Property({ type: "string", comment: "Verification token or code" })
  value!: string;

  @Property({
    type: "timestamptz",
    comment: "Expiration timestamp for the verification token",
  })
  expiresAt!: Date;
}
