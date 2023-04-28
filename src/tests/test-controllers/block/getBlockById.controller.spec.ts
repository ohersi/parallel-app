//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import GetBlockByIdController from "../../../controllers/block/getBlockById.controller";
import GetBlockByIdUsecase from "../../../services/usecases/block/getBlockByID.usecase";
import { start } from '../../../app';

describe("GetChannelByIdController", () => {
    // Mocks
    const mockedUsecase = mockDeep<GetBlockByIdUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: GetBlockByIdController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new GetBlockByIdController(mockedUsecase);
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

    describe("When getting a block by id,", () => {

        describe("and the block corresponding to the id is found,", () => {

            describe("and block object is retrieved,", () => {

                it("return a block object and status of 200.", async () => {
                    // GIVEN
                    const id = 1;
                    // WHEN
                    const results = await request(app).get(`/api/v1/blocks/${id}`);

                    // THEN
                    expect(results.status).toEqual(200);
                })
            })
        })

        describe("and the block corresponding to the id is NOT found,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const id = -99;
                // WHEN
                const results = await request(app).get(`/api/v1/blocks/${id}`);

                // THEN
                expect(results.status).toEqual(404);
            })
        })

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.getBlockByID(requestMock, responseMock, nextMock);

                // THEN
                expect(responseMock.status).toBeCalledWith(500);
                expect(responseMock.send).toBeCalledWith(objectContainsKey('error'));
            })
        });
    });
});