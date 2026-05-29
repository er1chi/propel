import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("contacts")
@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({
    description: "Create a new contact for authed user",
  })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contactsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(+id, updateContactDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.contactsService.remove(+id);
  }
}
