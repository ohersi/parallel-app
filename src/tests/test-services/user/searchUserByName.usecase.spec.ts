// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { User } from "../../../entities/user.entity";
import { memOrm } from "../../test-utils/init-db.setup";
import { generateItems } from "../../test-utils/generate-items.setup";
import UserRepository from "../../../repositories/user.repository";
import SearchUserByNameUsecase from "../../../services/usecases/user/searchUserByName.usecase";
import UserException from "../../../utils/exceptions/user.expection";

describe("SearchUserByNameUsecase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: SearchUserByNameUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new SearchUserByNameUsecase(mockedUserRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When given a user name,', () => {

        describe("and users/s matching portion or all of the given name does NOT exist in the db,", () => {

            it("return null.", async () => {
                // GIVEN
                const name = "NOTFOUND";
                const users = [] as User[];

                // WHEN
                mockedUserRepo.searchUsersMatchingName.mockResolvedValue(users);

                const results = await service.execute(name);

                // THEN
                expect(results).toEqual(users);
            })
        })

        describe("and users/s matching portion or all of the given name does exist in the db,", () => {

            it("return array of user object/s from database.", async () => {
                // GIVEN
                const name = "Full Name";
                const users = [{ full_name: name }] as User[];

                // WHEN
                mockedUserRepo.searchUsersMatchingName.mockResolvedValue(users);

                const results = await service.execute(name);

                // THEN
                expect(results).toEqual(users);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const name = "Full Name";

                // WHEN
                mockedUserRepo.searchUsersMatchingName.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(name) }).rejects.toThrow(UserException);
            })
        })

    })
});