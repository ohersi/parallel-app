//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetChannelByIdController from "../../../controllers/channel/getChannelById.controller";
import GetChannelByIdUsecase from "../../../services/usecases/channel/getChannelById.usecase";
import { start } from '../../../app';
import PageResults from "../../../resources/pagination/pageResults";

describe("GetChannelByIdController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetChannelByIdUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetChannelByIdController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetChannelByIdController(mockedUsecase);
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

    describe("When getting a channel by id,", () => {

        describe("and the channel corresponding to the id is found,", () => {

            it("return a channel object and status of 200.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const results = await request(app).get(`/api/v1/channels/${id}`);

                // THEN
                expect(results.status).toEqual(200);
            })
        })

        describe("and the channel corresponding to the id is NOT found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const id = -999;
                const pageResults = { data: [] } as PageResults;
                
                // WHEN
                mockedUsecase.execute.mockResolvedValue(pageResults);
                await controller.getChannelByID(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(404);
            })
        })

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
              // GIVEN

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.getChannelByID(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});