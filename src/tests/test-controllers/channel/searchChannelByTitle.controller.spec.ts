//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { Channel } from "../../../entities/channel.entity";
import SearchChannelByTitleController from "../../../controllers/channel/searchChannelByTitle.controller";
import SearchChannelByTitleUsecase from "../../../services/usecases/channel/searchChannelByTitle.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;


describe("SearchChannelByTitleController", () => {
    // Mocks
    const mockedUsecase = mockDeep<SearchChannelByTitleUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: SearchChannelByTitleController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new SearchChannelByTitleController(mockedUsecase);
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

    describe("When search for a channel by title,", () => {

        describe("and channel/s title/s matching a portion or all of the given title are/is found,", () => {

            it("returns a array of channel object/s and status code of 200.", async () => {
                 // GIVEN
                 const title = "title";
                 const channels = [{ title: title }] as Channel[];
 
                 // // WHEN
                 mockedUsecase.execute.mockResolvedValue(channels);
                 await controller.searchChannelByTitle(requestMock, responseMock, nextMock);
 
                 // THEN
                 expect(responseMock.status).toBeCalledWith(200);
            })
        })

        describe("and no channel/s matching portion or all of given title are/is found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const title = 'NOTFOUND';

                // WHEN
                const results = await request(app).get(`/api/v1/search/channels?title=${title}`);

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
                await controller.searchChannelByTitle(requestMock, responseMock, nextMock);

                // // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});