//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import RemoveFriendController from "../../../controllers/friend/removeFriend.controller";
import RemoveFriendUsecase from "../../../services/usecases/friend/removeFriend.usecase";
import { start } from '../../../app';

describe("RemoveFriendController", () => {
    // Mocks
    const mockedUsecase = mockDeep<RemoveFriendUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: RemoveFriendController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new RemoveFriendController(mockedUsecase);
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

    describe("When a user wants to unfollow another user,", () => {

        describe("and there is a user logged in,", () => {

            describe("and request query contains follow user id,", () => {

                describe("and the user was scuccessfully unfollowed,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        const userID = 1;
                        requestMock.params.id = '2';

                        // WHEN
                        mockedUsecase.execute.mockResolvedValue();
                        await controller.removeFriend(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the user was NOT scuccessfully unfollowed,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        const userID = 1;
                        requestMock.params.id = '2';

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.removeFriend(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(500);
                        expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                    })
                })
            })

            describe("and request query does NOT contain a follow user id,", () => {

                it("send an status of 500.", async () => {
                    // GIVEN
                    const userID = 1;
                    requestMock.params.id = '';

                    // WHEN
                    await controller.removeFriend(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(404);
                    expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                })
            })
        })

        describe("and there is NOT a user logged in,", () => {

            it("return a status of 401.", async () => {
                // GIVEN
                const followID = 2;

                // WHEN
                const results = await request(app).delete(`/api/v1/users/unfollow/user/${followID}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});