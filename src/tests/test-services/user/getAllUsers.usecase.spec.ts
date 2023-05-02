// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import UserRepository from "../../../repositories/user.repository";
import GetAllUsersUseCase from "../../../services/usecases/user/getAllUsers.usecase";
import UserException from "../../../utils/exceptions/user.expection";
import PageResults from "../../../resources/pagination/pageResults";

describe("GetAllUsersUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: GetAllUsersUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetAllUsersUseCase(mockedUserRepo);
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

    describe('When getting all users,', () => {

        describe("and users do exist in the db,", () => {

            it("return all users in db.", async () => {
                // GIVEN
                const last_id = 1;
                const limit = 10;
                // WHEN
                //** Instead of mocking results, FAKE the database using in-mem db to actually simulate the prod db call  */
                const getAllUsers = await orm.em.findAndCount(User, {});
                mockedUserRepo.findAllByLastID.mockResolvedValue(getAllUsers);

                const results = await service.execute(last_id, limit);

                // THEN
                //** Expect results to contain an array with an object that has a key/value of id = 1 */
                expect(results.data).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 1
                        })
                    ])
                )
            })
        })

        describe("and no users are found in the db,", () => {

            it("return empty array.", async () => {
                // GIVEN
                const last_id = 1;
                const limit = 10;

                // WHEN
                const count = await orm.em.count(User, {});
                const getAllUsers = await orm.em.find(User, -999);
                mockedUserRepo.findAllByLastID.mockResolvedValue([ getAllUsers, count ]);

                const results = await service.execute(last_id, limit);

                // THEN
                expect(results.data).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const last_id = 1;
                const limit = 10;

                // WHEN
                mockedUserRepo.findAllByLastID.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(last_id, limit) }).rejects.toThrow(UserException);
            })
        })

    })
});