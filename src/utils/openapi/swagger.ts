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
                'REST API for Parallel application.'
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Development server"
            },
            {
                url: "http://api.para-llel/api/v1",
                description: "Production server"
            },
        ],
        components: {
            securitySchemes: {
                CookieAuth: {
                    type: 'apiKey',
                    description: 'Cookie session',
                    in: 'cookie',
                    name: 'sid.cookie'
                },
            },
        },
    },
    apis: ['src/controllers/*/*.ts', 'src/entities/interfaces/*.ts', 'src/utils/exceptions/*.ts', 'src/services/usecases/feed/*.ts', 'src/resources/pagination/*.ts'],
};

const optionsUI = {
    swaggerOptions: {
        supportedSubmitMethods: []
    }
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app: Application, port: Number) {
    // Swagger page
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, optionsUI));

    // Docs in JSON format
    app.get('docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

export default swaggerDocs;