//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { Follow } from "../../../entities/follow.entity";
import GetAllChannelsUserFollowsController from "../../../controllers/channel/getAllChannelsUserFollows.controller";
import GetAllChannelsUserFollowsUsecase from "../../../services/usecases/channel/getAllChannelsUserFollows.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";

// Mock redis caching middleware
// jest.mock("../../../resources/caching/cache", () => ({
//     cache: jest.fn()
// }));
// const mockCache = cache as jest.Mock;

describe("GetAllChannelsUserFollowsController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetAllChannelsUserFollowsUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetAllChannelsUserFollowsController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetAllChannelsUserFollowsController(mockedUsecase);
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

    describe("When getting all channels the user follows,", () => {

        describe("and the user corresponding to the id is found,", () => {

            describe("returns an array of all channels objects that user follows", () => {

                it("return status code of 200.", async () => {
                    // GIVEN
                    const userID = 1;
                    const users = [{ }] as Follow[];
                    
                    // WHEN
                    mockedUsecase.execute.mockResolvedValue(users);
                    await controller.getAllChannelsUserFollows(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(200);
                })
            })

            describe("returns an empty array", () => {

                it("return status code of 404.", async () => {
                    // GIVEN
                    const userID = 1;

                    // WHEN
                    mockedUsecase.execute.mockResolvedValue([]);
                    await controller.getAllChannelsUserFollows(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(404);
                })
            })
        })

        describe("and the user corresponding to the id is NOT found,", () => {

            it("returns status code of 500.", async () => {
                // GIVEN
                const userID = -999;

                // WHEN
                const results = await request(app).get(`/api/v1/users/${userID}/following`);

                // THEN
                expect(results.status).toEqual(500);
            })
        })

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.getAllChannelsUserFollows(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});