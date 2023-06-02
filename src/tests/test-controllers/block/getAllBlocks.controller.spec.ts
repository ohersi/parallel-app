//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetAllBlocksController from "../../../controllers/block/getAllBlocks.controller";
import GetAllBlocksUsecase from "../../../services/usecases/block/getAllBlocks.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";

// Set authorization middlware to stub before app is generated
jest.mock("../../../middleware/auth.middleware", () => ({
    sessionAuth: (req: Request, res: Response, next: NextFunction) => {
        next();
    },
    roleAuth: (role: string) => (req: Request, res: Response, next: NextFunction) => {
        next();
    }
}));

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;


describe("GetAllBlocksController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetAllBlocksUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetAllBlocksController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetAllBlocksController(mockedUsecase);
        mockReset(mockedUsecase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("When getting all blocks,", () => {

        describe("and blocks are found,", () => {

            it("returns an array of all blocks objects and status code of 200.", async () => {
                // GIVEN

                // WHEN
                const results = await request(app).get("/api/v1/blocks/");

                // THEN
                expect(results.status).toEqual(200);
            })


        })

        describe("and no blocks are found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN

                // WHEN
                mockCache.mockResolvedValue([]);
                const results = await request(app).get("/api/v1/blocks/");

                // // THEN
                expect(results.status).toEqual(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get("/api/v1/blocks/");

                // // THEN
                expect(results.status).toEqual(500);
            })
        });

    });
});