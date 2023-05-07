// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { generateItems } from "../../test-utils/generate-items.setup";
import { User } from "../../../entities/user.entity";
import UserRepository from "../../../repositories/user.repository";
import GetUserByIdUseCase from '../../../services/usecases/user/getUserById.usecase'
import UserException from "../../../utils/exceptions/user.expection";

describe("GetUserByIdUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: GetUserByIdUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetUserByIdUseCase(mockedUserRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    it("should be defined", () => {
        // expect(getUserByIdUseCase).toBeDefined();
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
                
                // THEN
                expect(getUser).toEqual(null);
                expect(async () => { await service.execute(id) }).rejects.toThrowError(UserException);
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
