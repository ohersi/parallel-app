import express, { Application, Request, Response } from 'express';

class App {

    public express: Application;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;

        this.initalizeMiddleware();
    };


    private initalizeMiddleware() : void {
        this.express.use(express.json());
    };


    public listen() : void {
        this.express.listen(this.port, () => console.log(`app listening on port ${this.port}`));
    }

    public default(): void {
        this.express.get("/", (req: Request, res: Response) => {
            res.send("Hello World");
        });
    }

};

export default App;
