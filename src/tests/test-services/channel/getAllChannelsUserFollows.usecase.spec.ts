// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import { Follow } from "../../../entities/follow.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import UserRepository from "../../../repositories/user.repository";
import FollowRepository from "../../../repositories/follow.repository";
import GetAllChannelsUserFollowUsecase from "../../../services/usecases/channel/getAllChannelsUserFollows.usecase";
import FollowException from "../../../utils/exceptions/follow.exception";

describe("GetAllChannelsUserFollowUsecase", () => {

    const mockedUserRepo = mockDeep<UserRepository>();
    const mockedFollowRepo = mockDeep<FollowRepository>();
    let service: GetAllChannelsUserFollowUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetAllChannelsUserFollowUsecase(mockedFollowRepo, mockedUserRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedFollowRepo);
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

    describe('When given a user id,', () => {

        describe("and the user does exist in the db,", () => {

            it("return a user following object from database.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const getUser = await orm.em.findOne(User, { id: id });
                const getAllChannelsUserFollows = await orm.em.find(Follow, { user: id }, { populate: ['followed_channel']});
                mockedUserRepo.findByID.mockResolvedValue(getUser);
                mockedFollowRepo.findAllChannelsUserFollows.mockResolvedValue(getAllChannelsUserFollows);

                const results = await service.execute(id);

                // THEN
                expect(results).toEqual(getAllChannelsUserFollows);
            })
        })

        describe("and the user does NOT exist in the db,", () => {

            it("throw an Error stating the user does not exist.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                const getUser = await orm.em.findOne(User, { id: id });
                mockedUserRepo.findByID.mockResolvedValue(getUser);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(FollowException);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                mockedFollowRepo.findAllChannelsUserFollows.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(FollowException);
            })
        })

    })
});