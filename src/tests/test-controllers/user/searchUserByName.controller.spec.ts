//Packages
import { mockDeep, objectContainsKey } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { Application, NextFunction, Request, Response } from 'express';
import request from "supertest";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { User } from "../../../entities/user.entity";
import SearchUserByNameController from "../../../controllers/user/searchUserByName.controller";
import SearchUserByNameUsecase from "../../../services/usecases/user/searchUserByName.usecase";
import { start } from '../../../app';
import { cache } from "../../../resources/caching/cache";

// Mock redis caching middleware
jest.mock("../../../resources/caching/cache", () => ({
    cache: jest.fn()
}));
const mockCache = cache as jest.Mock;


describe("SearchUserByNameController", () => {
    // Mocks
    const mockedUsecase = mockDeep<SearchUserByNameUsecase>();
    const requestMock = mockDeep<Request>();
    const responseMock = mockDeep<Response>();
    const nextMock = mockDeep<NextFunction>();
    // System Under Test (sut)
    let controller: SearchUserByNameController;

    // Supertest setup
    let app: Application;

    beforeAll(async () => {
        const res = await start(5000);
        app = res.build();
        return app;
    })

    beforeEach(() => {
        controller = new SearchUserByNameController(mockedUsecase);
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

    describe("When search for a user by name,", () => {

        describe("and user/s name matching a portion or all of the given name are/is found,", () => {

            it("returns a array of user object/s and status code of 200.", async () => {
                 // GIVEN
                 const name = "Full Name";
                 const users = [{ full_name: name }] as User[];
 
                 // // WHEN
                 mockedUsecase.execute.mockResolvedValue(users);
                 await controller.searchUserByName(requestMock, responseMock, nextMock);
 
                 // THEN
                 expect(responseMock.status).toBeCalledWith(200);
            })
        })

        describe("and no users/s matching portion or all of given name are/is found,", () => {

            it("return a status of 404.", async () => {
                // GIVEN
                const name = "Full Name";

                // WHEN
                const results = await request(app).get(`/api/v1/search/users?name=${name}`);

                // // THEN
                expect(results.status).toEqual(404);
            })
        });

        describe("and the database throws an error,", () => {

            it("return a status of 500.", async () => {
                // GIVEN
                const name = "Full Name";

                // WHEN
                mockedUsecase.execute.mockRejectedValue(Error);
                await controller.searchUserByName(requestMock, responseMock, nextMock);

                // // THEN
                expect(responseMock.status).toBeCalledWith(500);
            })
        });

    });
});