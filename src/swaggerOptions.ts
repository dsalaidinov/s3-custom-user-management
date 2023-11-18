import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'S3 User Custom Management Backend API',
      version: '1.0.0',
      description: 'API documentation',
    },
  },
  apis: ['./src/**/*.ts'],
};

export default swaggerOptions;
