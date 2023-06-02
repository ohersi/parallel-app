//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import UnFollowChannelController from "../../../controllers/follow/unfollowChannel.controller";
import UnFollowChannelUsecase from "../../../services/usecases/follow/unfollowChannel.usecase";
import { start } from '../../../app';

describe("UnFollowChannelController", () => {
    // Mocks
    const mockedUsecase = mockDeep<UnFollowChannelUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: UnFollowChannelController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new UnFollowChannelController(mockedUsecase);
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

    describe("When user is unfollowing a channel", () => {

        describe("and there is a user logged in,", () => {

            describe("and request query contains channel id,", () => {

                describe("and the unfollow was scuccessfull,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        requestMock.params.id = '1';
                        const userID = 1;

                        // WHEN
                        await controller.unfollowChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the unfollow was NOT scuccessfull,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        requestMock.params.id = '1';
                        const userID = 1;

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.unfollowChannel(requestMock, responseMock, nextMock);

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
                    await controller.unfollowChannel(requestMock, responseMock, nextMock);

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
                const results = await request(app).delete(`/api/v1/users/unfollow/channel/${channelID}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});