// src/users/usersController.ts
import {
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

import { iocContainer } from "../tsoa/ioc";
import axios from "axios";

const WEATHER_URL = (ville: string) => `https://wttr.in/${ville}?format=j1`;

@Route("")
@Tags("🌤️ Meteo")
export class MeteoEndpoints extends Controller {

  /**
   * Récupération des prévisions météo d'une ville passée en paramètre.
   * @summary Récupére les prévisions météo.
   */
  @Get("meteo/{ville}")
  public async getPrevisionsMeteo(
    @Path() ville: string
  ): Promise<unknown> {

    const result = await afficherMeteo(ville);
    if (result == null) {
      throw new Error(`Aucune prévision trouvée pour la ville ${ville}`)
    }

    this.setStatus(200);
    return result
  }

}

iocContainer.set(MeteoEndpoints, new MeteoEndpoints())


async function afficherMeteo(ville: string) {
  try {
    const response = await axios.get(WEATHER_URL(ville));
    return response.data;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}