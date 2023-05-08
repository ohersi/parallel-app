//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import CreateChannelController from "../../../controllers/channel/createChannel.controller";
import CreateChannelUsecase from "../../../services/usecases/channel/createChannel.usecase";
import validationMiddleware from "../../../middleware/validation.middleware";
import channelValidation from "../../../resources/validations/channel.validation";
import { start } from '../../../app';

// Set moderate middleware to stub before app is generated
jest.mock("../../../middleware/moderation.middleware", () => ({
    moderate: (req: Request, res: Response, next: NextFunction) => {
        next();
    },
}));

describe("CreateChannelController", () => {
    // Mocks
    const mockedUsecase = mockDeep<CreateChannelUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: CreateChannelController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new CreateChannelController(mockedUsecase);
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

    describe("When creating a channel,", () => {

        describe("and there is a user logged in,", () => {

            describe("and the request body contains valid info,", () => {

                describe("and the channel has been successfully been created,", () => {

                    it("return status of 201.", async () => {
                        // GIVEN
                        requestMock.body = {
                            title: "title",
                            description: "description"
                        }

                        // WHEN
                        mockedUsecase.execute.mockResolvedValue();
                        await controller.createChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(201);
                    })
                })

                describe("and the channel cannot be created,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        requestMock.body = {
                            title: "title",
                            description: "description"
                        }

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.createChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(500);
                        expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                    })
                })
            })

            describe("and an request body is empty or has missing fields,", () => {

                it("return a status of 400.", async () => {
                    // GIVEN
                    requestMock.body = {
                        title: "title", 
                        description: "" // Missing description
                    }

                    // WHEN
                    await validationMiddleware(channelValidation.create)(requestMock, responseMock, nextMock);

                    // THEN
                    expect(responseMock.status).toBeCalledWith(400);
                })
            })

        })

        describe("and there is NOT a user logged in,", () => {

            it("return a status of 400.", async () => {
                // GIVEN
                const body = {
                    title: "title",
                    description: "description"
                }

                // WHEN
                const results = await request(app).post("/api/v1/channels/").send(body);

                // THEN
                expect(results.status).toEqual(401);
            })
        })


    });
});