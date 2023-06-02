//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import DeleteUserController from "../../../controllers/user/deleteUser.controller";
import DeleteUserUsecase from "../../../services/usecases/user/deleteUser.usecase";
import { start } from "../../../app";

// Controller is lean, only directs to usecase
// Test is concerned with HTTP request and responses
describe("DeleteUserController", () => {
    // Mocks
    const mockedDeleteUserUseCase = mockDeep<DeleteUserUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: DeleteUserController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new DeleteUserController(mockedDeleteUserUseCase);
        mockReset(mockedDeleteUserUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe('When deleting a user', () => {

        describe("and a user is logged in,", () => {

            describe("and the user has been successfully deleted,", () => {

                it("return a status of 200.", async () => {
                    // GIVEN

                    // WHEN
                    mockedDeleteUserUseCase.execute.mockResolvedValue(null);
                    await controller.deleteUser(requestMock, responseMock, nextMock);

                    //THEN
                    expect(responseMock.status).toBeCalledWith(200);
                })
            })

            describe("and the user cannot be deleted,", () => {

                it("return a status of 500.", async () => {
                    // GIVEN

                    // WHEN
                    mockedDeleteUserUseCase.execute.mockRejectedValue(Error);
                    await controller.deleteUser(requestMock, responseMock, nextMock);

                    //THEN
                    expect(responseMock.status).toBeCalledWith(500);
                    expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                })
            })
        })

        describe("and a user is NOT logged in,", () => {

            it("return a status of 400.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const results = await request(app).delete(`/api/v1/users/${id}`);

                // THEN
                expect(results.status).toEqual(401);
            })
        })
    })

});