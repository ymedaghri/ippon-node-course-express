// src/users/usersController.ts
import {
  Controller,
  Get,
  Path,
  Route,
  Security,
  Tags,
} from "tsoa";

import { iocContainer } from "../tsoa/ioc";

@Route("")
@Tags("🕵🏽 MI6")
export class SecretAgentEndpoints extends Controller {

  /**
   * Connaitre l'identité d'un agent de la couronne <Nom>.
   * @summary Toujours le même on dirait.
   */
  @Security("jwt", ["admin"])
  @Get("protected/person")
  public async GetASecretIdentity(): Promise<{ message: string }> {

    this.setStatus(200);
    return { message: `James, my name is James !` }
  }

}

iocContainer.set(SecretAgentEndpoints, new SecretAgentEndpoints())