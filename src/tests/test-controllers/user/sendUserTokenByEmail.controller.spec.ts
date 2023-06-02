//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import SendUserTokenByEmail from "../../../controllers/user/sendUserTokenByEmail.controller";
import { start } from '../../../app';
import { mailer } from "../../../resources/mailing/mailer";

// Mock redis caching middleware
jest.mock("../../../resources/mailing/mailer", () => ({
    mailer: jest.fn()
}));
const mockMailer = mailer as jest.Mock;


describe("SendUserTokenByEmail", () => {
    // Mocks
    const mockedSendUserTokenByEmail = mockDeep<SendUserTokenByEmail>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: SendUserTokenByEmail;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new SendUserTokenByEmail();
        mockReset(mockedSendUserTokenByEmail);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("Whe sending a user verification email,", () => {

        describe("and there is a stored token in session,", () => {

            describe("and mailer successfully sends confirmation email to user,", () => {

                it("return a status of 200.", async () => {
                    // GIVEN
                    requestMock.session.user = {
                        id: 1,
                        email: 'email@email.com',
                        role: 'user',
                        token: "jwt123",
                    }
                    // WHEN
                    mockMailer.mockResolvedValue("info");
                    await controller.confirmToken(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(200);
                })
            })

            describe("and mailer CANNOT send a confirmation email to user and throws an error,", () => {

                it("return a status of 500.", async () => {
                    // GIVEN

                    // WHEN
                    mockMailer.mockRejectedValue(Error);
                    const results = await request(app).get("/api/v1/registration/");

                    // THEN
                    expect(results.status).toEqual(500);
                })
            })


        })

        describe("and no token is found in session,", () => {

            it("return a status of 500.", async () => {
                // GIVEN

                // WHEN 
                const results = await request(app).get("/api/v1/registration/");

                // // THEN
                expect(results.status).toEqual(500);
            })
        });

    });
});