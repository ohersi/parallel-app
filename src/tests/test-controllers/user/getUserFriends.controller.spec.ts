//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetUserFriendsController from "../../../controllers/user/getUserFriends.controller";
import GetUserFriendsUsecase from "../../../services/usecases/user/getUserFriends.usecase";
import { start } from '../../../app'
import { Friend } from "../../../entities/friend.entity";

describe("GetUserFriendsController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetUserFriendsUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetUserFriendsController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetUserFriendsController(mockedUsecase);
        mockReset(mockedUsecase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        //TODO: Close server --- server.close() or w/e
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("When getting all users friends using user id,", () => {

        describe("and the user corresponding to the given id is found", () => {

            it("returns a friends object and status of 200", async () => {
                // GIVEN
                const id = 1;
                const friendsList = [{ }] as Friend[];
                
                // WHEN
                mockedUsecase.execute.mockResolvedValue(friendsList);
                await controller.getUserFriends(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(200);
            })
        });

        describe("and the user corresponding to the id is not found", () => {

            it("return a status of 404.", async () => {
                 // GIVEN
                 const id = 1;

                 // WHEN
                 mockedUsecase.execute.mockResolvedValue([]);
                 await controller.getUserFriends(requestMock, responseMock, nextMock);
 
                 // THEN
                 expect(responseMock.status).toBeCalledWith(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.getUserFriends(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        })

    });
});