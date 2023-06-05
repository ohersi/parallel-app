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
import { Friend } from "../../../entities/friend.entity";
import FriendRepository from "../../../repositories/friend.repository";
import GetUserFriendConnectionUsecase from "../../../services/usecases/user/getUserFriendConnection.usecase";
import FriendException from "../../../utils/exceptions/friend.exception";

describe("GetUserFriendConnectionUsecase", () => {

    const mockedFriendRepo = mockDeep<FriendRepository>();
    let service: GetUserFriendConnectionUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let friend: FriendRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetUserFriendConnectionUsecase(mockedFriendRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedFriendRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        friend = orm.em.getRepository<Friend>(Friend);

        // Add inital friends connection
        const loggedInUser = await orm.em.findOne(User, 1);
        const followUser = await orm.em.findOne(User, 2);
        const newFriend = new Friend(
            loggedInUser!,
            followUser!,
            new Date()
        );
        // Persist and flush to database
        await friend.save(newFriend);
        // Add to collection
        loggedInUser!.friends.add(followUser!);

        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When given a user id and follow id,', () => {

        describe('and there is a connection does exist in the db', () => {

            it("return a boolean of true.", async () => {
                // GIVEN
                const userID = 1;
                const followID = 2;

                // WHEN
                const getConnection = await orm.em.findOne(Friend, { following_user: userID, followed_user: followID });
                mockedFriendRepo.findFriendsConnection.mockResolvedValue(getConnection);

                const results = await service.execute(userID, followID);

                // THEN
                expect(results).toEqual(true);
            })
        })

        describe('and there is NOT a connection does exist in the db', () => {

            it("return boolean of false.", async () => {
                // GIVEN
                const userID = 1;
                const followID = -999;

                // WHEN
                const getConnection = await orm.em.findOne(Friend, { following_user: userID, followed_user: followID });
                mockedFriendRepo.findFriendsConnection.mockResolvedValue(getConnection);

                const results = await service.execute(userID, followID);

                // THEN
                expect(results).toEqual(false);
            })
        })

        describe('and db throws an error,', () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const userID = 1;
                const followID = 2;

                // WHEN
                mockedFriendRepo.findFriendsConnection.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(userID, followID) }).rejects.toThrowError(FriendException);
            })
        })
    })
});
