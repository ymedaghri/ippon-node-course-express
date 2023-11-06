// src/users/usersController.ts
import {
  Controller,
  Get,
  Path,
  Route,
  Tags,
} from "tsoa";

import { iocContainer } from "../tsoa/ioc";

@Route("")
@Tags("🕵🏽 MI6")
export class PersonEndpoints extends Controller {

  /**
   * Recevoir un Hello World <Nom>.
   * @summary Toujours le fameux Hello world.
   */
  @Get("persons/{nom}")
  public async GetAHelloWorld(
    @Path() nom: string
  ): Promise<{ message: string }> {

    this.setStatus(200);
    return { message: `Hello World ${nom} !` }
  }

}

iocContainer.set(PersonEndpoints, new PersonEndpoints())