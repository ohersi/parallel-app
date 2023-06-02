//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import UpdateChannelController from "../../../controllers/channel/updateChannel.controller";
import UpdateChannelUsecase from "../../../services/usecases/channel/updateChannel.usecase";
import ChannelDTO from "../../../dto/channel.dto";
import { start } from '../../../app';

// Set moderate middleware to stub before app is generated
jest.mock("../../../middleware/moderation.middleware", () => ({
    moderate: (req: Request, res: Response, next: NextFunction) => {
        next();
    },
}));

describe("UpdateChannelController", () => {
    // Mocks
    const mockedUsecase = mockDeep<UpdateChannelUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: UpdateChannelController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new UpdateChannelController(mockedUsecase);
        mockReset(mockedUsecase);
        // Inversify clean up existing metadata
        cleanUpMetadata();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it("should be defined", () => {
        expect(controller).toBeDefined();
    })

    describe("When updating a channel,", () => {

        describe("and there is a user logged in,", () => {

            describe("and the request body contains valid info,", () => {

                describe("and the channel has been successfully been updated,", () => {

                    it("return status of 200.", async () => {
                        // GIVEN
                        requestMock.body = {
                            title: "title",
                            description: "description"
                        }

                        // WHEN
                        mockedUsecase.execute.mockResolvedValue(new ChannelDTO());
                        await controller.updateChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(200);
                    })
                })

                describe("and the channel cannot be updated,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        requestMock.body = {
                            title: "title",
                            description: "description"
                        }

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.updateChannel(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(500);
                        expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
                    })
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
                const results = await request(app).put("/api/v1/channels/1/update").send(body);

                // THEN
                expect(results.status).toEqual(401);
            })
        })


    });
});