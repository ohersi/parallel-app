//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { NextFunction, Request, Response } from 'express';
// Imports
import createUserController from '../../../controllers/createUser.controller'
import createUserUseCase from "../../../services/usercases/createUser.usecase";

// Controller is lean, only directs to usecase
// Test is concerned with HTTP request and responses
describe("createUserController", () => {

    const mockedCreateUserUseCase = mockDeep<createUserUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();

    let controller: createUserController;

    beforeEach(() => {
        controller = new createUserController(mockedCreateUserUseCase);

        mockReset(mockedCreateUserUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks()
      })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe('When creating a user', () => {


        describe("and the request body is empty", () => {

            it("return a status of 400", async () => {
                // GIVEN/ARRANGE
                requestMock.body = {};

                // WHEN/ACT
                await controller.createUser(requestMock, responseMock, nextMock);

                // THEN/ASSERT
                expect(responseMock.status).toBeCalledWith(400);
                expect(responseMock.send).toBeCalledWith({ message: "Input is empty" });

            })
        })

        describe("and an input field is missing", () => {

            it("return a status of 400", async () => {
                //GIVEN
                requestMock.body = {
                    id: 1, 
                    firstname: "Test", 
                    lastname: "Tester", 
                    email: "email@email.com",
                    password: "password",
                    profileimg: ""
                }

                //WHEN
                await controller.createUser(requestMock, responseMock, nextMock);
                
                //THEN
                expect(responseMock.status).toBeCalledWith(400);
                expect(responseMock.send).toBeCalledWith({ message: `Missing fields`});
            })
        })

        describe("and the user has successfully been created", () => {

            it("return a status of 201", async () => {
                // GIVEN
                requestMock.body = { id: 1, firstname: "test" };

                // WHEN
                mockedCreateUserUseCase.execute.mockResolvedValue(true);
                await controller.createUser(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(201);
            })
        })

    })
});
