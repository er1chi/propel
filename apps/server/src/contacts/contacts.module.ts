import { Module } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { ContactsController } from "./contacts.controller";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Contact } from "./entities/contact.entity";

@Module({
  controllers: [ContactsController],
  providers: [ContactsService],
  imports: [MikroOrmModule.forFeature([Contact])],
})
export class ContactsModule {}
