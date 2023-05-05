//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata, next } from "inversify-express-utils";
// Imports
import GetUserByIdController from "../../../controllers/user/getUserById.controller";
import GetUserByIdUseCase from "../../../services/usecases/user/getUserById.usecase";
import { cache } from "../../../resources/caching/cache";
import { start } from '../../../app'

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;

describe("getUserByIdController", () => {
    // Mocks
    const mockedGetUserByIDUseCase = mockDeep<GetUserByIdUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetUserByIdController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetUserByIdController(mockedGetUserByIDUseCase);
        mockReset(mockedGetUserByIDUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        //TODO: Close server --- server.close() or w/e
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("When getting a user by id", () => {

        describe("and the user corresponding to the id is found", () => {

            it("returns a user object and status of 200", async () => {
                // GIVEN
                const id = 1;
                const user = { id: id };

                // WHEN
                mockCache.mockResolvedValue(user);
                const results = await request(app).get(`/api/v1/users/${id}`);

                // THEN
                expect(results.status).toEqual(200);
                expect(results.body).toHaveProperty('id');
            })
        });

        describe("and the user corresponding to the id is not found", () => {

            it("return a status of 500", async () => {
                // GIVEN
                const id = -99;
                const user = {};

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get(`/api/v1/users/${id}`);

                // THEN
                expect(results.status).toEqual(500);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get(`/api/v1/users/${id}`);

                // THEN
                expect(results.status).toEqual(500);
            })
        });

    });
});