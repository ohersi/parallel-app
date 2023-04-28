//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetAllChannelsController from "../../../controllers/channel/getAllChannels.controller";
import GetAllChannelsUsecase from "../../../services/usecases/channel/getAllChannels.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;


describe("GetAllChannelsController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetAllChannelsUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetAllChannelsController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetAllChannelsController(mockedUsecase);
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

    describe("When getting all channels,", () => {

        describe("and the channels are found,", () => {

            it("returns an array of all channels objects and status code of 200.", async () => {
                // GIVEN

                // WHEN
                const results = await request(app).get(`/api/v1/channels/`);

                // THEN
                expect(results.status).toEqual(200);
            })
        })

         describe("and the channels are not found,", () => {

            it("return status code of 404.", async () => {
                // GIVEN

                // WHEN
                mockCache.mockResolvedValue([]);
                const results = await request(app).get(`/api/v1/channels/`);

                // THEN
                expect(results.status).toEqual(404);
            })
        })

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN

                // WHEN
                mockCache.mockRejectedValue(Error);
                await controller.getAllChannels(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});