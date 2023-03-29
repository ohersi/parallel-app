//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import CreateUserController from '../../../controllers/user/createUser.controller'
import CreateUserUseCase from "../../../services/usecases/user/createUser.usecase";
import validationMiddleware from "../../../middleware/validation.middleware";
import userValidation from "../../../resources/validations/user.validation";

// Controller is lean, only directs to usecase
// Test is concerned with HTTP request and responses
describe("createUserController", () => {
    // Mocks
    const mockedCreateUserUseCase = mockDeep<CreateUserUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: CreateUserController;

    beforeEach(() => {
        controller = new CreateUserController(mockedCreateUserUseCase);
        mockReset(mockedCreateUserUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe('When creating a user', () => {

        describe("and the user has successfully been created", () => {

            it("return a status of 201", async () => {
                // GIVEN
                requestMock.body = {
                    firstname: "Test",
                    lastname: "Tester",
                    email: "email@email.com",
                    password: "Abcxyz123!",
                    profileimg: "avatar"
                }

                // WHEN
                mockedCreateUserUseCase.execute.mockResolvedValue(true);
                await controller.createUser(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(201);
            })
        });

        describe("and an request body is empty or has missing fields", () => {

            it("return a status of 400", async () => {
                //GIVEN
                requestMock.body = {
                    firstname: "Test",
                    lastname: "",   // Last Name missing
                    email: "",  // Email missing
                    password: "Abcxyz123!",
                    profileimg: "avatar"
                }

                //WHEN
                //** Cannot use mockNext because it will return next is not a function */
                await validationMiddleware(userValidation.create)(requestMock, responseMock, nextMock);

                //THEN
                expect(responseMock.status).toBeCalledWith(400);
            })
        });

        describe("and the database cannot create a user", () => {

            it("return a status of 500", async () => {
                //GIVEN

                // WHEN
                mockedCreateUserUseCase.execute.mockRejectedValue(Error);
                await controller.createUser(requestMock, responseMock, nextMock);

                //THEN
                expect(responseMock.status).toBeCalledWith(500);
                expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
            })
        });

    })
});
