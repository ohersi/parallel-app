//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata, next } from "inversify-express-utils";
// Imports
import GetUserBySlugController from "../../../controllers/user/getUserBySlug.controller";
import GetUserBySlugUseCase from "../../../services/usecases/user/getUserBySlug.usecase";
import { cache } from "../../../resources/caching/cache";
import { start } from '../../../app'

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;

describe("GetUserBySlugController", () => {
    // Mocks
    const mockedGetUserBySlugUseCase = mockDeep<GetUserBySlugUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetUserBySlugController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetUserBySlugController(mockedGetUserBySlugUseCase);
        mockReset(mockedGetUserBySlugUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("When getting a user by slug", () => {

        describe("and the user corresponding to the slug is found", () => {

            it("returns a user object and status of 200", async () => {
                // GIVEN
                const slug = 'test-user';
                const user = { slug: slug };

                // WHEN
                mockCache.mockResolvedValue(user);
                const results = await request(app).get(`/api/v1/users/name/${slug}`);

                // THEN
                expect(results.status).toEqual(200);
                expect(results.body).toHaveProperty('slug');
            })
        });

        describe("and the user corresponding to the slug is not found", () => {

            it("return a status of 500", async () => {
                // GIVEN
                const slug = 'fake-user';
                const user = {};

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get(`/api/v1/users/name/${slug}`);

                // THEN
                expect(results.status).toEqual(500);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500", async () => {
                // GIVEN
                const slug = 'test-user';

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get(`/api/v1/users/name/${slug}`);

                // THEN
                expect(results.status).toEqual(500);
            })
        });

    });
});