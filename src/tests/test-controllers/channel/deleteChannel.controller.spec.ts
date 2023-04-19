//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import DeleteChannelController from "../../../controllers/channel/deleteChannel.controller";
import DeleteChannelUsecase from "../../../services/usecases/channel/deleteChannel.usecase";
import { start } from '../../../app';

describe("DeleteChannelController", () => {
    // Mocks
    const mockedUsecase = mockDeep<DeleteChannelUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: DeleteChannelController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new DeleteChannelController(mockedUsecase);
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

    describe("When deleting a channel,", () => {

        describe("and there is a user logged in,", () => {

            describe("and the channel has been successfully been deleted,", () => {

                it("return status of 200.", async () => {
                    // GIVEN
                    const id = 1;
                    const userID = 1;

                    // WHEN
                    mockedUsecase.execute.mockResolvedValue(null);
                    await controller.deleteChannel(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(200);
                })
            })

            describe("and the channel cannot be deleted,", () => {

                it("return a status of 500.", async () => {
                    // GIVEN
                    const id = 1;
                    const userID = 1;

                    // WHEN
                    mockedUsecase.execute.mockRejectedValue(Error);
                    await controller.deleteChannel(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(500);
                    expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                })
            })

        })

        describe("and there is NOT a user logged in,", () => {

            it("return a status of 400.", async () => {
                // GIVEN
                const body = {
                    title: "title",
                    description: "description"
                }

                // WHEN
                const results = await request(app).put("/api/v1/channels/1/update").send(body);

                // THEN
                expect(results.status).toEqual(401);
            })
        })


    });
});