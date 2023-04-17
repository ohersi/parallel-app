// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { generateItems } from "../../test-utils/generate-items.setup";
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import GetUserByIdUseCase from '../../../services/usecases/user/getUserById.usecase'
import UserException from "../../../utils/exceptions/user.expection";

describe("GetUserByIdUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: GetUserByIdUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;

    beforeEach(() => {
        service = new GetUserByIdUseCase(mockedUserRepo);
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    it("should be defined", () => {
        // expect(getUserByIdUseCase).toBeDefined();
    })

    beforeAll(async () => {
        // Setup database and repos
        orm = await generateItems();
    });

    afterAll(async () => {
        await orm.close();
    })

    describe('When given a user id,', () => {

        describe('and the user does exist in the db', () => {

            it("return a user object from database.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const getUser = await orm.em.findOne(User, id);
                mockedUserRepo.findByID.mockResolvedValue(getUser);

                const results = await service.execute(id);

                // THEN
                expect(results).toEqual(getUser);
            })
        })

        describe('and the user does NOT exist in the db', () => {

            it("return null.", async () => {
                // GIVEN
                const id = -999;

                // WHEN
                const getUser = await orm.em.findOne(User, id);
                mockedUserRepo.findByID.mockResolvedValue(getUser);

                const results = await service.execute(id);
                // THEN
                expect(getUser).toEqual(null);
                expect(results).toEqual(null);
            })
        })

        describe('and db throws an error,', () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -999;

                // WHEN
                mockedUserRepo.findByID.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrowError(UserException);
            })
        })
    })
});
