import * as express from "express";
import * as jwt from "jsonwebtoken";

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === "api_key") {
        let token;
        if (request.query && request.query.access_token) {
            token = request.query.access_token;
        }

        if (token === "abc123456") {
            return Promise.resolve({
                id: 1,
                name: "Ironman",
            });
        } else {
            return Promise.reject({});
        }
    }

    if (securityName === "jwt") {
        const token =
            request.body.token ||
            request.query.token ||
            request.headers["authorization"];

        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error("No token provided"));
            }
            const bearer = token.split(' ');
            const bearerToken = bearer[1];
            jwt.verify(bearerToken, "superSecret^^", function (err: any, decoded: any) {
                if (err) {
                    reject(err);
                } else {
                    console.log("decoded", decoded)
                    for (let scope of scopes || []) {
                        if (!decoded.scopes.includes(scope)) {
                            reject(new Error("JWT does not contain required scope."));
                        }
                    }
                    resolve(decoded);
                }
            });
        });
    }

    return new Promise((resolve, reject) => {
        reject(new Error(`Error d'authentication , securityName "${securityName}" inconnu`));
    })

}