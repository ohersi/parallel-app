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
import GetUserBySlugUseCase from '../../../services/usecases/user/getUserBySlug.usecase'
import UserException from "../../../utils/exceptions/user.expection";

describe("GetUserBySlugUseCase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    let service: GetUserBySlugUseCase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetUserBySlugUseCase(mockedUserRepo);
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

    describe('When given a user slug,', () => {

        describe('and the user does exist in the db', () => {

            it("return a user object from database.", async () => {
                // GIVEN
                const user = await orm.em.findOne(User, 1);
                const slug = user?.slug!;

                // WHEN
                const getUser = await orm.em.findOne(User, { slug: slug });
                mockedUserRepo.findBySlug.mockResolvedValue(getUser);

                const results = await service.execute(slug);

                // THEN
                expect(results).toEqual(getUser);
            })
        })

        describe('and the user does NOT exist in the db', () => {

            it("return null.", async () => {
                // GIVEN
                const slug = "fake-user";

                // WHEN
                const getUser = await orm.em.findOne(User, { slug: slug });
                mockedUserRepo.findBySlug.mockResolvedValue(getUser);

                // THEN
                expect(getUser).toEqual(null);
                expect(async () => { await service.execute(slug) }).rejects.toThrowError(UserException);
            })
        })

        describe('and db throws an error,', () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const slug = "fake-user";

                // WHEN
                mockedUserRepo.findBySlug.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(slug) }).rejects.toThrowError(UserException);
            })
        })
    })
});
