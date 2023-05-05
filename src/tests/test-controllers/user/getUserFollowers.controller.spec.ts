//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetUserFollowersController from "../../../controllers/user/getUserFollowers.controller";
import GetUserFollowersUsecase from "../../../services/usecases/user/getUserFollowers.usecase";
import { cache } from "../../../resources/caching/cache";
import { start } from '../../../app';
import { Friend } from "../../../entities/friend.entity";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;

describe("GetUserFollowersController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetUserFollowersUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetUserFollowersController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetUserFollowersController(mockedUsecase);
        mockReset(mockedUsecase);
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

    describe("When getting all users followers using user id,", () => {

        describe("and the user corresponding to the given id is found", () => {

            it("returns a followers object and status of 200", async () => {
                // GIVEN
                const id = 1;
                const followersList = [{}] as Friend[];

                // WHEN
                mockCache.mockResolvedValue(followersList);
                const results = await request(app).get(`/api/v1/users/${id}/followers`);

                // THEN
                expect(results.status).toEqual(200);
            })
        });

        describe("and the user corresponding to the id is not found", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const id = -99;
                const followersList = [] as Friend[];

                // WHEN
                mockCache.mockResolvedValue(followersList);
                const results = await request(app).get(`/api/v1/users/${id}/followers`);

                // THEN
                expect(results.status).toEqual(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get(`/api/v1/users/${id}/followers`);

                // THEN
                expect(results.status).toEqual(500);
            })
        })
    });

});
