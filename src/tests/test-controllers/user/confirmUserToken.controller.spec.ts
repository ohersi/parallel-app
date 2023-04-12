//Packages
import { Application, NextFunction, Request, Response } from 'express';
import { mockDeep } from "jest-mock-extended";
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import ConfirmUserTokenController from "../../../controllers/user/confirmUserToken.controller";
import ConfirmUserTokenUseCase from '../../../services/usecases/user/confirmUserToken.usecase';
import { start } from '../../../app';

describe("ConfirmUserTokenController", () => {
    const mockedConfirmUserTokenUseCase = mockDeep<ConfirmUserTokenUseCase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: ConfirmUserTokenController

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new ConfirmUserTokenController(mockedConfirmUserTokenUseCase);
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

    describe("When verifying json web token,", () => {

        describe("and token is not in request params,", () => {

            it("returns status 500.", async () => {
                // GIVEN

                // WHEN
                const results = await request(app).get("/api/v1/registration/confirm?token=");

                // THEN
                expect(results.status).toEqual(500);
            })
        })

        describe("and token is invalid or expired,", () => {

            it("returns status 500.", async () => {
                // GIVEN

                // WHEN
                mockedConfirmUserTokenUseCase.execute.mockRejectedValue(Error);
                await controller.confirmToken(requestMock, responseMock, nextMock);
                

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        })

        describe("and token is valid,", () => {

            it("returns status 200.", async () => {
                // GIVEN

                // WHEN
                mockedConfirmUserTokenUseCase.execute.mockResolvedValue();
                await controller.confirmToken(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(200);
            })
        })

    });
});