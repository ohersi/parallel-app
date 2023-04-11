//Packages
import { Application } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import ConfirmUserTokenController from "../../../controllers/user/confirmUserToken.controller";
import { start } from '../../../app';
import { verifyToken } from '../../../resources/security/token'

// Mock jwt verification
jest.mock("../../../resources/security/token", () => ({
    verifyToken: jest.fn()
}));

const mockVerify = verifyToken as jest.Mock;

describe("ConfirmUserTokenController", () => {
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
        controller = new ConfirmUserTokenController();
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
                mockVerify.mockRejectedValue(Error);
                const results = await request(app).get("/api/v1/registration/confirm?token=testjwt");

                // THEN
                expect(results.status).toEqual(500);
            })
        })

        describe("and token is valid,", () => {

            it("returns status 200.", async () => {
                // GIVEN

                // WHEN
                mockVerify.mockResolvedValue("jwt123");
                const results = await request(app).get("/api/v1/registration/confirm?token=testjwt");

                // THEN
                expect(results.status).toEqual(200);
            })
        })

    });
});