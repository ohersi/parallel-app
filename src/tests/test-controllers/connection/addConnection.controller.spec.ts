//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import AddConnectionController from "../../../controllers/connection/addConnection.controller";
import AddConnectionUsecase from "../../../services/usecases/connection/addConnection.usecase";
import { start } from '../../../app';
import { Block } from "../../../entities/block.entity";

describe("AddConnectionController", () => {
    // Mocks
    const mockedUsecase = mockDeep<AddConnectionUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: AddConnectionController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new AddConnectionController(mockedUsecase);
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

    describe("When connecting a block to a channel", () => {

        describe("and there is a user logged in,", () => {

            describe("and request query contains channel id,", () => {

                describe("and the connection was scuccessfull,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const channelID = 1;
                        const userID = 1;

                        const block = {} as Block;

                        // WHEN
                        mockedUsecase.execute.mockResolvedValue(block);
                        await controller.addConnection(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the connection was NOT scuccessfull,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        const blockID = 1;
                        const channelID = 1;
                        const userID = 1;

                        const block = {} as Block;

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.addConnection(requestMock, responseMock, nextMock);

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
                    await controller.addConnection(requestMock, responseMock, nextMock);

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
                const results = await request(app).post(`/api/v1/blocks/${blockID}/connect?channel=${channelID}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});