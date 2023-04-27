//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetUserFriendsController from "../../../controllers/user/getUserFriends.controller";
import GetUserFriendsUsecase from "../../../services/usecases/user/getUserFriends.usecase";
import { start } from '../../../app'

describe("GetUserFriendsController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetUserFriendsUsecase>();
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

                // WHEN
                const results = await request(app).get(`/api/v1/users/${id}/following`);

                // THEN
                expect(results.status).toEqual(200);
            })
        });

        describe("and the user corresponding to the id is not found", () => {

            it("return a status of 500", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                const results = await request(app).get(`/api/v1/users/${id}/following`);

                // THEN
                expect(results.status).toEqual(500);
            })
        });

    });
});