//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import LoginUserController from '../../../controllers/user/loginUser.controller'
import LoginUserUseCase from "../../../services/usecases/user/loginUser.usecase";
import validationMiddleware from "../../../middleware/validation.middleware";
import userValidation from "../../../resources/validations/user.validation";
import UserDTO from "../../../dto/user.dto";

// Controller is lean, only directs to usecase
// Test is concerned with HTTP request and responses
describe("loginUserController", () => {
    // Mocks
    const mockedLoginUserUseCase = mockDeep<LoginUserUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: LoginUserController;

    beforeEach(() => {
        controller = new LoginUserController(mockedLoginUserUseCase);
        mockReset(mockedLoginUserUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe('When logging in a user,', () => {

        describe("and the user has given an email and password,", () => {

            describe("and the email & password successfully matches,", () => {

                it("return a status of 200 and userDTO.", async () => {
                    // GIVEN
                    requestMock.body = {
                        email: "email@email.com",
                        password: "Abcxyz123!"
                    }

                    // WHEN
                    mockedLoginUserUseCase.execute.mockResolvedValue(new UserDTO(requestMock.body.email));
                    await controller.loginUser(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(200);
                })
            })

            describe("and the email OR password does NOT match/found in db,", () => {

                it("return a status of 500.", async () => {
                    // GIVEN
                    requestMock.body = {
                        email: "email@email.com",
                        password: "Abcxyz123!"
                    }

                    // WHEN
                    mockedLoginUserUseCase.execute.mockRejectedValue(Error);
                    await controller.loginUser(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(500);
                })
            })

        });

        describe("and an request body is empty or has missing fields", () => {

            it("return a status of 400.", async () => {
                //GIVEN
                requestMock.body = {
                    email: "",  // Email missing
                    password: "Abcxyz123!"
                }

                //WHEN
                //** Cannot use mockNext because it will return next is not a function */
                await validationMiddleware(userValidation.login)(requestMock, responseMock, nextMock);

                //THEN
                expect(responseMock.status).toBeCalledWith(400);
            })
        });

        describe("and the database cannot create a user,", () => {

            it("return a status of 500.", async () => {
                //GIVEN

                // WHEN
                mockedLoginUserUseCase.execute.mockRejectedValue(Error);
                await controller.loginUser(requestMock, responseMock, nextMock);

                //THEN
                expect(responseMock.status).toBeCalledWith(500);
                expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
            })
        });

    })
});
