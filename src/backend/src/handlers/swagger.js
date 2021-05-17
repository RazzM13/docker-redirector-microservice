import swaggerJsdoc from "swagger-jsdoc";

/**
   * @swagger
   *
   * /docs:
   *     get:
   *       summary: 'Returns Swagger JSON documentation'
   *       responses:
   *         200:
   *           description: 'Redirection to target URL.'
   *       tags:
   *         - development
   */
const SwaggerHandler = (() => async (req, res) => {
  return swaggerJsdoc({
    swaggerDefinition: {
        info: {
          title: process.env.npm_package_name,
          version: process.env.npm_package_version,
          description: process.env.npm_package_description,
        },
        host: `localhost:8082`,
        basePath: '/',
      },
    apis: [
        `/home/node/app/src/handlers/swagger.js`,
        `/home/node/app/src/handlers/redirection.js`,
        `/home/node/app/src/dal/services/redirection.js`,
        `/home/node/app/src/swagger.yaml`
    ],
  })
  .then((swaggerSpec) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.send(swaggerSpec);
  })
  .catch((err) => {
      console.error(`Unable to generate Swagger documentation:`, err);
      res.statusCode = 500;
      return res.send();
  });
});

export default SwaggerHandler;
