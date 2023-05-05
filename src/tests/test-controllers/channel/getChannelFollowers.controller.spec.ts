//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetChannelFollowersController from "../../../controllers/channel/getChannelFollowers.controller";
import GetChannelFollowersUsecase from "../../../services/usecases/channel/getChannelFollowers.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";
import { Follow } from "../../../entities/follow.entity";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;


describe("GetChannelFollowersController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetChannelFollowersUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetChannelFollowersController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetChannelFollowersController(mockedUsecase);
        mockReset(mockedUsecase);
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

    describe("When getting all channel followers,", () => {

        describe("and the channel followers are found,", () => {

            it("returns an array of all channels followers objects and status code of 200.", async () => {
                // GIVEN
                const id = 1;
                const channels = [{}] as Follow[];

                // WHEN
                mockCache.mockResolvedValue(channels);
                const results = await request(app).get(`/api/v1/channels/${id}/followers`);

                // THEN
                expect(results.status).toEqual(200);
            })
        })

        describe("and the channel followers are not found,", () => {

            it("return status code of 404.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                mockCache.mockResolvedValue([]);
                const results = await request(app).get(`/api/v1/channels/${id}/followers`);

                // THEN
                expect(results.status).toEqual(404);
            })
        })

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                mockCache.mockRejectedValue(Error);
                const results = await request(app).get(`/api/v1/channels/${id}/followers`);

                // THEN
                expect(results.status).toEqual(500);
            })
        });

    });
});