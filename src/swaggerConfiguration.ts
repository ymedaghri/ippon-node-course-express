import swaggerJsdoc from 'swagger-jsdoc';

export default (port: number) => {
  const options = {
    definition: {
      openapi: '3.0.0',
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      info: {
        title: 'Mon API Express',
        version: '1.0.0',
        description: 'Une API express toute simple',
      },
      servers: [
        {
          url: `http://localhost:${port}`,
        },
      ],
    },
    apis:
      process.env.NODE_ENV === 'production'
        ? ['./dist/routes/*.js']
        : ['./src/routes/*.ts'],
  };

  const specs = swaggerJsdoc(options);
  return specs;
};
