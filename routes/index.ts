import fs from 'fs';
import path from 'path';

export default async (app: any) => {
    const routeFiles = fs.readdirSync(__dirname)
        .filter((file) => file.indexOf('.') !== 0 && file !== 'index.ts' && file.slice(-3) === '.ts');

    await Promise.all(routeFiles.map(async (file) => {
        const modulePath = path.join(__dirname, file);
        const route = await import(modulePath);
        route.default(app);
    }));
};