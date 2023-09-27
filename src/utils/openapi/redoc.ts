import { Application, Request, Response } from 'express';

function generateRedoc(app: Application) {
    // serve your swagger.json file
    app.get('/docs/openapi.json', (req, res) => {
        res.sendFile('openapi.json', { root: __dirname });
    });

    app.get('/docs', (req, res) => {
        res.sendFile("redoc.html", { root: __dirname });
    })
};

export default generateRedoc;