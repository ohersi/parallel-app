//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { Block } from "../../../entities/block.entity";
import SearchBlockByTitleController from "../../../controllers/block/searchBlockByTitle.controller";
import SearchBlockByTitleUsecase from "../../../services/usecases/block/searchBlockByTitle.usecase";
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


describe("SearchBlockByTitleController", () => {
    // Mocks
    const mockedUsecase = mockDeep<SearchBlockByTitleUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: SearchBlockByTitleController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new SearchBlockByTitleController(mockedUsecase);
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

    describe("When search for a block by title,", () => {

        describe("and block/s title/s matching a portion or all of the given title are/is found,", () => {

            it("returns a array of block object/s and status code of 200.", async () => {
                // GIVEN
                const title = "title";
                const block = [{ title: title }] as Block[];

                // // WHEN
                mockedUsecase.execute.mockResolvedValue(block);
                await controller.searchBlockByTitle(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(200);
            })
        })

        describe("and no block/s matching portion or all of given title are/is found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const title = 'NOTFOUND';

                // WHEN
                const results = await request(app).get(`/api/v1/search/blocks?title=${title}`);

                // // THEN
                expect(results.status).toEqual(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const title = 'title';

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.searchBlockByTitle(requestMock, responseMock, nextMock);

                // // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});