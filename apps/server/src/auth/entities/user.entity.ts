import {
  Entity,
  Index,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { v7 as uuidv7 } from "uuid";
import { BaseEntity } from "./base.entity";

@Entity({ tableName: "users" })
export class User extends BaseEntity {
  @PrimaryKey({ type: "string", comment: "Primary key for the user" })
  id: string = uuidv7();

  @Property({ type: "string", comment: "User's full name" })
  name!: string;

  @Index()
  @Property({ type: "string", unique: true, comment: "Unique email address" })
  email!: string;

  @Property({ type: "boolean", comment: "Whether the email is verified" })
  emailVerified!: boolean;

  @Property({
    type: "string",
    nullable: true,
    comment: "User's profile image URL",
  })
  image?: string;

  @Property({
    type: "string",
    unique: true,
    nullable: true,
    comment: "Unique user identifier for display or login",
  })
  username?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Publicly visible username",
  })
  displayUsername?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "User's role or permission level (e.g., admin, user)",
  })
  role?: string;

  @Property({
    type: "boolean",
    nullable: true,
    comment: "Whether the user is banned from the system",
  })
  banned?: boolean;

  @Property({
    type: "string",
    nullable: true,
    comment: "Reason for the user's ban",
  })
  banReason?: string;

  @Property({
    type: "timestamptz",
    nullable: true,
    comment: "Date when the user's ban expires",
  })
  banExpires?: Date;
}
