import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'

export function monMiddlewareJWT(req: Request, res: Response, next: NextFunction) {
    const bearerHeader = req.headers['authorization'] as string | undefined;
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, 'superSecret^^', (err) => {
            if (err) {
                res.sendStatus(403);
            } else {
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
}