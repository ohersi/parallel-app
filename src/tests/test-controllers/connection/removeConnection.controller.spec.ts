//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import RemoveConnectionController from "../../../controllers/connection/removeConnection.controller";
import RemoveConnectionUsecase from "../../../services/usecases/connection/removeConnection.usecase";
import { start } from '../../../app';

describe("RemoveConnectionController", () => {
    // Mocks
    const mockedUsecase = mockDeep<RemoveConnectionUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: RemoveConnectionController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new RemoveConnectionController(mockedUsecase);
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

    describe("When disconnecting a block from a channel", () => {

        describe("and there is a user logged in,", () => {

            describe("and request query contains channel id,", () => {

                describe("and the connection was scuccessfully disconnected,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const channelID = 1;
                        const userID = 1;


                        // WHEN
                        await controller.removeConnection(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the connection was NOT scuccessfully disconnected,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const channelID = 1;
                        const userID = 1;


                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.removeConnection(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(500);
                        expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                    })
                })
            })

            describe("and request query does NOT contain a channel id,", () => {

                it("send an status of 500.", async () => {
                    // GIVEN
                    const blockID = 1;
                    const channelID = 1;
                    const userID = 1;

                    requestMock.query = {};

                    // WHEN
                    await controller.removeConnection(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(500);
                    expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                })
            })
        })

        describe("and there is NOT a user logged in,", () => {

            it("return a status of 401.", async () => {
                // GIVEN
                const blockID = 1;
                const channelID = 1;
                const userID = 1;
                // WHEN
                const results = await request(app).delete(`/api/v1/blocks/${blockID}/disconnect?channel=${channelID}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});