//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import { cleanUpMetadata } from "inversify-express-utils";
import request from "supertest";
// Imports
import CreateBlockController from "../../../controllers/block/createBlock.controller";
import CreateBlockUsecase from "../../../services/usecases/block/createBlock.usecase";
import validationMiddleware from "../../../middleware/validation.middleware";
import blockValidation from "../../../resources/validations/block.validation";
import { Block } from "../../../entities/block.entity";
import { start } from '../../../app';

// Set moderate middleware to stub before app is generated
jest.mock("../../../middleware/moderation.middleware", () => ({
    moderate: (req: Request, res: Response, next: NextFunction) => {
        next();
    },
}));

describe("CreateBlockController", () => {
    // Mocks
    const mockedUsecase = mockDeep<CreateBlockUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: CreateBlockController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new CreateBlockController(mockedUsecase);
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

    describe("When creating a block,", () => {

        describe("and there is a user logged in,", () => {

            describe("and the request body contains valid info,", () => {

                describe("and the block has been successfully been created,", () => {

                    it("return status of 201.", async () => {
                        // GIVEN
                        requestMock.body = {
                            title: "title",
                            description: "description",
                            source_url: "source_url",
                            image_url: "image_url"
                        }

                        // WHEN
                        mockedUsecase.execute.mockResolvedValue({} as Block);
                        await controller.createBlock(requestMock, responseMock, nextMock);

                        // THEN
                        expect(responseMock.status).toBeCalledWith(201);
                    })
                })

                describe("and the block cannot be created,", () => {

                    it("return a status of 500.", async () => {
                        // GIVEN
                        requestMock.body = {
                            title: "title",
                            description: "description",
                            source_url: "source_url",
                            image_url: "image_url"
                        }

                        // WHEN
                        mockedUsecase.execute.mockRejectedValue(Error);
                        await controller.createBlock(requestMock, responseMock, nextMock);

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
                        description: "", // Missing description
                        source_url: "source_url",
                        image_url: "image_url"
                    }

                    // WHEN
                    await validationMiddleware(blockValidation.create)(requestMock, responseMock, nextMock);

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
                    description: "description",
                    source_url: "source_url",
                    image_url: "image_url"
                }

                const channelID = 1;

                // WHEN
                const results = await request(app).post(`/api/v1/channels/${channelID}/add`).send(body);

                // THEN
                expect(results.status).toEqual(401);
            })
        })

    });
});