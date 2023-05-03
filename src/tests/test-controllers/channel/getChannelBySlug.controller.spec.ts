//Packages
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetChannelBySlugController from "../../../controllers/channel/getChannelBySlug.controller";
import GetChannelBySlugUsecase from "../../../services/usecases/channel/getChannelBySlug.usecase";
import { start } from '../../../app';

describe("GetChannelBySlugController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetChannelBySlugUsecase>();
    // System Under Test (sut)
    let controller: GetChannelBySlugController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetChannelBySlugController(mockedUsecase);
        mockReset(mockedUsecase);
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

    describe("When getting a channel by slug,", () => {

        describe("and the channel corresponding to the slug is found,", () => {

            it("return a channel object and status of 200.", async () => {
                // GIVEN
                const id = 1;
                let channel = await request(app).get(`/api/v1/channels/${id}`);
                let obj = JSON.parse(channel.text);
                let slug = obj.data.slug;
                // WHEN
                const results = await request(app).get(`/api/v1/channels/title/${slug}`);
                // THEN
                expect(results.status).toEqual(200);
            })
        })

        describe("and the channel corresponding to the slug is NOT found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const slug = "title-no-found";
                // WHEN
                const results = await request(app).get(`/api/v1/channels/title/${slug}`);

                // THEN
                expect(results.status).toEqual(404);
            })
        });

    });
});