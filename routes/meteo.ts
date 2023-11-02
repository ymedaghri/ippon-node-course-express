import { Application, Request, Response } from 'express';
import axios from 'axios';

const WEATHER_URL = (ville: string) => `https://wttr.in/${ville}?format=j1`;

export default (app: Application) => {
    /**
    * @swagger
    * /meteo/{ville}:
    *   get:
    *     tags:
    *       - 🌤️ Meteo
    *     summary: Récupérer la météo d'une ville passée en paramètres.
    *     description: Retourne la météo de la ville passée en paramètre au format JSON
    *     parameters:
    *       - in: path
    *         name: ville
    *         schema:
    *           type: string
    *     responses:
    *       200:
    *         description: La météo au format JSON.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    */
    app.get('/meteo/:ville', async (req: Request, res: Response) => {
        if (req.params.ville == null) {
            res.sendStatus(400);
        }
        const result = await afficherMeteo(req.params.ville)
        if (result == null) {
            res.sendStatus(404);
        }
        res.json(result);
    });
};

async function afficherMeteo(ville: string) {
    try {
        const response = await axios.get(WEATHER_URL(ville))
        return response.data
    } catch (error) {
        console.error('Erreur:', error);
        return null
    }
}