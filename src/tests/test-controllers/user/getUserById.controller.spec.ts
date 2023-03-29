//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import getUserByIdController from "../../../controllers/getUserById.controller";
import getUserByIdUseCase from "../../../services/usecases/user/getUserById.usecase";
import { start } from '../../../app'

describe("getUserByIdController", () => {
    // Mocks
    const mockedGetUserByIDUseCase = mockDeep<getUserByIdUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: getUserByIdController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new getUserByIdController(mockedGetUserByIDUseCase);
        mockReset(mockedGetUserByIDUseCase);
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

    describe("When getting a user by id", () => {

        describe("and the user corresponding to the id is found", () => {

            it("returns a user object", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const results = await request(app).get(`/api/v1/users/${id}`);

                // THEN
                expect(results.status).toEqual(201);
            })
        })

    })
})