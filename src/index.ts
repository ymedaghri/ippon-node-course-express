import appProvider, { port } from './app';
import {
  databaseRepositories,
  mongoPrismaClient,
  postgresPrismaClient,
} from './repositories';

const app = appProvider(databaseRepositories);

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

function shutDown() {
  console.log('Received terminaison signal, shutting down gracefully');

  server.close(async () => {
    console.log('Closed out remaining connections');
    await mongoPrismaClient.$disconnect();
    await postgresPrismaClient.$disconnect();
    process.exit(0); // Exit process
  });

  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', shutDown); // Terminal
process.on('SIGINT', shutDown); // Ctrl+C in terminal
process.on('SIGUSR2', shutDown); // Nodemon restart
