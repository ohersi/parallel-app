//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetUserFriendConnectionController from '../../../controllers/user/getUserFriendConnection.controller';
import GetUserFriendConnectionUsecase from '../../../services/usecases/user/getUserFriendConnection.usecase';
import { start } from '../../../app';


describe("GetUserFriendConnectionController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetUserFriendConnectionUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetUserFriendConnectionController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetUserFriendConnectionController(mockedUsecase);
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

    describe("When checking if user is following another user,", () => {

        describe("and a connection is found,", () => {

            it("return a boolean of true and status code of 200.", async () => {
                // GIVEN
                const userID = 1;
                const followID = 2;

                // WHEN
                mockedUsecase.execute.mockResolvedValue(true);
                await controller.getUserFriendConnection(requestMock, responseMock, nextMock);

                // // THEN
                expect(responseMock.status).toBeCalledWith(200);
            })
        })

        describe("and a connection is NOT found,", () => {

            it("return a boolean of false and status of 404.", async () => {
                // GIVEN
                const userID = 1;
                const followID = -999;

                // WHEN
                mockedUsecase.execute.mockResolvedValue(false);
                await controller.getUserFriendConnection(requestMock, responseMock, nextMock)

                // // THEN
                expect(responseMock.status).toBeCalledWith(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const userID = 1;
                const followID = 2;

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.getUserFriendConnection(requestMock, responseMock, nextMock)

                // // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });
    });
});