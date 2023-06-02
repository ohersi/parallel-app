//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetChannelBySlugController from "../../../controllers/channel/getChannelBySlug.controller";
import GetChannelBySlugUsecase from "../../../services/usecases/channel/getChannelBySlug.usecase";
import { cache } from "../../../resources/caching/cache";
import { start } from '../../../app';
import PageResults from "../../../resources/pagination/pageResults";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;

describe("GetChannelBySlugController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetChannelBySlugUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetChannelBySlugController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetChannelBySlugController(mockedUsecase);
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

    describe("When getting a channel by slug,", () => {

        describe("and the channel corresponding to the slug is found,", () => {

            it("return a channel object and status of 200.", async () => {
                // GIVEN
                const id = 1;
                const slug = 'channel-title'
                const arr = new PageResults(
                    id,
                    undefined,
                    [{ slug: slug }]
                );
                // GIVEN

                // WHEN
                mockedUsecase.execute.mockResolvedValue(arr);
                await controller.getChannelBySlug(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        })

        describe("and the channel corresponding to the slug is NOT found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const slug = "title-no-found";
                const arr = new PageResults(
                    0,
                    undefined,
                    []
                );

                // WHEN
                // mockCache.mockResolvedValue(arr);
                const results = await request(app).get(`/api/v1/channels/title/${slug}`);

                // THEN
                expect(results.status).toEqual(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.getChannelBySlug(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});