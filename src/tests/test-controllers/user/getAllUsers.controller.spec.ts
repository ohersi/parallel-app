//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetAllUsersController from "../../../controllers/user/getAllUsers.controller";
import GetAllUsersUseCase from "../../../services/usecases/user/getAllUsers.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";
import PageResults from "../../../resources/pagination/pageResults";

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


describe("GetAllUsersController", () => {
    // Mocks
    const mockedGetAllUsersUseCase = mockDeep<GetAllUsersUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetAllUsersController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetAllUsersController(mockedGetAllUsersUseCase);
        mockReset(mockedGetAllUsersUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    afterAll(() => {
        //TODO: Close server --- server.close() or w/e
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("When getting all users,", () => {

        describe("and users are found,", () => {

            it("returns an array of all user objects and status code of 200.", async () => {
                // GIVEN

                // WHEN
                const results = await request(app).get("/api/v1/users/");

                // THEN
                expect(results.status).toEqual(200);
            })
        })

        describe("and not users are found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const pageResults = { data: [] } as PageResults;
                
                // WHEN
                // mockCache.mockResolvedValue([]);
                mockedGetAllUsersUseCase.execute.mockResolvedValue(pageResults);
                await controller.getAllUsers(requestMock, responseMock, nextMock);

                // // THEN
                expect(responseMock.status).toBeCalledWith(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN

                // WHEN
                // mockCache.mockRejectedValue(Error);
                mockedGetAllUsersUseCase.execute.mockRejectedValue(Error);
                await controller.getAllUsers(requestMock, responseMock, nextMock);

                // // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });
    });
});