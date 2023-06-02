//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import FollowChannelController from "../../../controllers/follow/followChannel.controller";
import FollowChannelUsecase from "../../../services/usecases/follow/followChannel.usecase";
import { start } from '../../../app';

describe("FollowChannelController", () => {
    // Mocks
    const mockedUsecase = mockDeep<FollowChannelUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: FollowChannelController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new FollowChannelController(mockedUsecase);
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

    describe("When user is following a channel", () => {

        describe("and there is a user logged in,", () => {

            describe("and request query contains channel id,", () => {

                describe("and the connection was scuccessfull,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        requestMock.params.id = '1';
                        const userID = 1;

                        // WHEN
                        await controller.followChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the connection was NOT scuccessfull,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        requestMock.params.id = '1';
                        const userID = 1;

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.followChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(500);
                        expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                    })
                })
            })

            describe("and request query does NOT contain a channel id,", () => {

                it("send an status of 404.", async () => {
                    // GIVEN
                    const userID = 1;
                    requestMock.params.id = '';

                    // WHEN
                    await controller.followChannel(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(404);
                    expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                })
            })
        })

        describe("and there is NOT a user logged in,", () => {

            it("return a status of 401.", async () => {
                // GIVEN
                const channelID = 1;

                // WHEN
                const results = await request(app).post(`/api/v1/users/follow/channel/${channelID}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});