// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { generateItems } from "../../test-utils/generate-items.setup";
import FriendRepository from "../../../repositories/friend.repository";
import GetUserFriendsUsecase from "../../../services/usecases/user/getUserFriends.usecase";
import FriendException from "../../../utils/exceptions/friend.exception";
import { Friend } from "../../../entities/friend.entity";

describe("GetUserByIdUseCase", () => {

    const mockedFriendRepo = mockDeep<FriendRepository>();
    let service: GetUserFriendsUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetUserFriendsUsecase(mockedFriendRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedFriendRepo);
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

            it("return a friend object from database.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const getFriends = await orm.em.find(Friend, { following_user: id }, {populate: ['followed_user']})
                mockedFriendRepo.findAllFollowing.mockResolvedValue(getFriends);

                const results = await service.execute(id);

                // THEN
                expect(results).toEqual(getFriends);
            })
        })

        describe('and the user does NOT exist in the db', () => {

            it("return null.", async () => {
                // GIVEN
                const id = -999;

                // WHEN
                const getFriends = await orm.em.find(Friend, { following_user: id }, {populate: ['followed_user']})
                mockedFriendRepo.findAllFollowing.mockResolvedValue(getFriends);

                const results = await service.execute(id);
                // THEN
                expect(getFriends).toEqual([]);
                expect(results).toEqual([]);
            })
        })

        describe('and db throws an error,', () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -999;

                // WHEN
                mockedFriendRepo.findAllFollowing.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrowError(FriendException);
            })
        })
    })
});
