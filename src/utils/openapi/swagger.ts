import { Application, Request, Response } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Parallel REST API Docs',
            version: '1.0',
            description:
            'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Dev server"
            },
        ],
    },
    apis: ['src/controllers/*/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app: Application, port: Number) {
    // Swagger page
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

    // Docs in JSON format
    app.get('docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

export default swaggerDocs;