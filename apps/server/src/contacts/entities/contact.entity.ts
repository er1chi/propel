import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { v7 as uuidv7 } from "uuid";
import { BaseEntity } from "@/auth/entities/base.entity";
import { User } from "../../auth/entities/user.entity";

@Entity({ tableName: "contacts" })
export class Contact extends BaseEntity {
  @PrimaryKey({ type: "string", comment: "Primary key for the contact" })
  id: string = uuidv7();

  @Property({ type: "string", comment: "Contact's first name" })
  firstName!: string;

  @Property({ type: "string", nullable: true, comment: "Contact's last name" })
  lastName?: string;

  @Property({ type: "string", nullable: true, comment: "Contact's job title" })
  jobTitle?: string;

  @Property({ type: "string", nullable: true, comment: "Contact's company" })
  company?: string;

  @Index()
  @Property({
    type: "string",
    unique: true,
    nullable: true,
    comment: "Contact's email address",
  })
  email?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Contact's phone number",
  })
  phone?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Contact's LinkedIn profile URL",
  })
  linkedinUrl?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Contact's website URL",
  })
  website?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Street address",
  })
  street?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "City",
  })
  city?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "State or province",
  })
  state?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Postal or zip code",
  })
  postalCode?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Country",
  })
  country?: string;

  @Property({
    type: "string",
    nullable: true,
    comment: "Contact status (e.g., lead, prospect, customer, churned)",
  })
  status?: string;

  @Property({
    type: "text",
    nullable: true,
    comment: "Notes or description about the contact",
  })
  notes?: string;

  @ManyToOne({
    serializer: (val) => val,
    entity: () => User,
    nullable: false,
    deleteRule: "cascade",
  })
  user!: User;
}
