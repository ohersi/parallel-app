//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import UpdateUserController from '../../../controllers/user/updateUser.controller';
import UpdateUserUsecase from "../../../services/usecases/user/updateUser.usecase";
import UserDTO from "../../../dto/user.dto";
import { start } from "../../../app";

// Set moderate middleware to stub before app is generated
jest.mock("../../../middleware/moderation.middleware", () => ({
    moderate: (req: Request, res: Response, next: NextFunction) => {
        next();
    },
}));

// Controller is lean, only directs to usecase
// Test is concerned with HTTP request and responses
describe("UpdateUserController", () => {
    // Mocks
    const mockedUpdateUserUseCase = mockDeep<UpdateUserUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: UpdateUserController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new UpdateUserController(mockedUpdateUserUseCase);
        mockReset(mockedUpdateUserUseCase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe('When updating a user', () => {

        describe("and a user is logged in,", () => {

            describe("and the request body contains valid info,", () => {

                describe("and the user has been successfully updated,", () => {

                    it("return a status of 200.", async () => {
                        // GIVEN
                        requestMock.body = {
                            first_name: "Test",
                            last_name: "Tester",
                            email: "email@email.com",
                            password: "Abcxyz123!",
                            avatar_url: "avatar"
                        }

                        // WHEN
                        mockedUpdateUserUseCase.execute.mockResolvedValue(new UserDTO);
                        await controller.updateUser(requestMock, responseMock, nextMock);

                        //THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the user cannot be updated,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        requestMock.body = {
                            first_name: "Test",
                            last_name: "Tester",
                            email: "email@email.com",
                            password: "Abcxyz123!",
                            avatar_url: "avatar"
                        }

                        // WHEN
                        mockedUpdateUserUseCase.execute.mockRejectedValue(Error);
                        await controller.updateUser(requestMock, responseMock, nextMock);

                        //THEN
                        expect(responseMock.status).toBeCalledWith(500);
                        expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                    })
                })
            })

        })

        describe("and a user is NOT logged in,", () => {

            it("return a status of 400.", async () => {
                // GIVEN
                const body = {
                    first_name: "Test",
                    last_name: "Tester",
                    email: "email@email.com",
                    password: "Abcxyz123!",
                    avatar_url: "avatar"
                }
                // WHEN
                const results = await request(app).put("/api/v1/users/update").send(body);

                // THEN
                expect(results.status).toEqual(401);
            })
        })




    })
});