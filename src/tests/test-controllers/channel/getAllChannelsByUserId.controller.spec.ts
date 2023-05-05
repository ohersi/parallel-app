//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetAllChannelsByUserIdController from "../../../controllers/channel/getAllChannelsByUserId.controller";
import GetAllChannelsByUserIdUsecase from "../../../services/usecases/channel/getAllChannelsByUserId.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";
import PageResults from "../../../resources/pagination/pageResults";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;


describe("GetAllChannelsByUserIdController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetAllChannelsByUserIdUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetAllChannelsByUserIdController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetAllChannelsByUserIdController(mockedUsecase);
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

    describe("When getting all channels by user ID,", () => {

        describe("and the user corresponding to the id is found,", () => {

            it("returns an array of all channels objects from that user and status code of 200.", async () => {
                // GIVEN
                const userID = 1;
                const arr = new PageResults(
                    userID,
                    undefined,
                    [{ id: 1 }]
                );
                
                // WHEN
                mockCache.mockResolvedValue(arr);
                const results = await request(app).get(`/api/v1/users/${userID}/channels`);

                // THEN
                expect(results.status).toEqual(200);
            })
        })

        describe("and the user corresponding to the id is NOT found,", () => {

            it("returns status code of 404.", async () => {
                // GIVEN
                const userID = -999;
                const arr = new PageResults(
                    0,
                    undefined,
                    []
                );

                // WHEN
                mockCache.mockResolvedValue(arr);
                const results = await request(app).get(`/api/v1/users/${userID}/channels`);

                // THEN
                expect(results.status).toEqual(404);
            })
        })

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const userID = 1;

                // WHEN
                mockCache.mockRejectedValue(Error);
                await controller.getAllChannelsByUserID(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});