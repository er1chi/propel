import { Property } from "@mikro-orm/decorators/legacy";

export abstract class BaseEntity {
  @Property({
    type: "timestamptz",
    comment: `Timestamp of when the record was created`,
  })
  createdAt: Date = new Date();

  @Property({
    type: "timestamptz",
    onUpdate: () => new Date(),
    comment: `comment: 'Timestamp of the last user record update',`,
  })
  updatedAt: Date = new Date();
}
