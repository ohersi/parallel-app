//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import AddFriendController from "../../../controllers/friend/addFriend.controller";
import AddFriendUsecase from "../../../services/usecases/friend/addFriend.usecase";
import { start } from '../../../app';

describe("AddFriendController", () => {
    // Mocks
    const mockedUsecase = mockDeep<AddFriendUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: AddFriendController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new AddFriendController(mockedUsecase);
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

    describe("When a user wants to follow another user,", () => {

        describe("and there is a user logged in,", () => {

            describe("and request query contains follow user id,", () => {

                describe("and the follow was scuccessfull,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        const userID = 1;
                        requestMock.params.id = '1';

                        // WHEN
                        mockedUsecase.execute.mockResolvedValue();
                        await controller.addFriend(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the follow was NOT scuccessfull,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        const userID = 1;
                        requestMock.params.id = '1';

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.addFriend(requestMock, responseMock, nextMock);

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
                    await controller.addFriend(requestMock, responseMock, nextMock);

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
                const results = await request(app).post(`/api/v1/users/follow/user/${followID}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});