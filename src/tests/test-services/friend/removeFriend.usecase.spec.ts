// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { User } from "../../../entities/user.entity";
import { Friend } from "../../../entities/friend.entity";
import { memOrm } from "../../test-utils/init-db.setup";
import { generateItems } from "../../test-utils/generate-items.setup";
import FriendRepository from "../../../repositories/friend.repository";
import UserRepository from "../../../repositories/user.repository";
import RemoveFriendUsecase from "../../../services/usecases/friend/removeFriend.usecase";
import FriendException from "../../../utils/exceptions/friend.exception";

describe("RemoveFriendUsecase", () => {

    const mockedFriendRepo = mockDeep<FriendRepository>();
    const mockedUserRepo = mockDeep<UserRepository>();
    let service: RemoveFriendUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let friend: FriendRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new RemoveFriendUsecase(mockedFriendRepo, mockedUserRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedFriendRepo);
        mockReset(mockedUserRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        friend = orm.em.getRepository<Friend>(Friend);
        // Add friends
        const loggedInUser = await orm.em.findOne(User, 1);
        const followUser = await orm.em.findOne(User, 2);
        const newFriend = new Friend(
            loggedInUser!,
            followUser!,
            new Date()
        );
        await friend.save(newFriend);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When a user wants to unfollow another user,', () => {

        describe("and the logged in user is found in the db,", () => {

            describe("and the following user id is found in the db,", () => {

                describe("and the logged in user does NOT match the user trying they're trying to unfollow (aka follow themselves),", () => {

                    describe("and a logged in user has successfully unfollowed the user,", () => {

                        it("return nothing.", async () => {
                            // GIVEN
                            const userID = 1;
                            const followID = 2;

                            // WHEN
                            const loggedInUser = await orm.em.findOne(User, userID);
                            const followUser = await orm.em.findOne(User, followID);

                            mockedUserRepo.findByID.mockResolvedValueOnce(loggedInUser);
                            mockedUserRepo.findByID.mockResolvedValueOnce(followUser);

                            if (loggedInUser && followUser && loggedInUser.id !== followUser.id) {
                                const foundFriendDConnection = await friend.findFriendsConnection(userID, followID);
                                mockedFriendRepo.findFriendsConnection.mockResolvedValue(foundFriendDConnection);
                                if (foundFriendDConnection) {
                                    // Persist and flush to database
                                    // const removeFriend = await friend.delete(foundFriendDConnection);
                                    // Set mocked result to be newly removed friend connection
                                    mockedFriendRepo.delete.mockResolvedValue(null);
                                    // Remove from collection
                                    // await loggedInUser.friends.init();
                                    // loggedInUser.friends.remove(followUser);
                                }
                            }

                            const results = await service.execute(userID, followID);

                            // THEN
                            // const returnsNullIfDeleted = await friend.findFriendsConnection(userID, followID);
                            expect(results).toBeUndefined();
                        })
                    })

                    describe("and a logged in user could NOT successfully unfollow the user,", () => {

                        it("throw an Error from the db.", async () => {
                            // GIVEN
                            const userID = 1;
                            const followID = 2;

                            // WHEN
                            const loggedInUser = await orm.em.findOne(User, userID);
                            const followUser = await orm.em.findOne(User, followID);

                            mockedUserRepo.findByID.mockResolvedValueOnce(loggedInUser);
                            mockedUserRepo.findByID.mockResolvedValueOnce(followUser);

                            if (loggedInUser && followUser && loggedInUser.id !== followUser.id) {
                                mockedFriendRepo.delete.mockRejectedValue(Error);
                            }

                            // THEN
                            expect(async () => await service.execute(userID, followID)).rejects.toThrow(FriendException);
                        })
                    })
                })

                describe("and the logged in user DOES match the user they're trying to unfollow (aka follow themselves),", () => {

                    it("throw Error stating user cannot unfollow themselves.", async () => {
                        // GIVEN
                        const userID = 1;
                        const followID = 1;

                        // WHEN
                        const loggedInUser = await orm.em.findOne(User, userID);
                        const followUser = await orm.em.findOne(User, followID);

                        mockedUserRepo.findByID.mockResolvedValueOnce(loggedInUser);
                        mockedUserRepo.findByID.mockResolvedValueOnce(followUser);

                        // THEN
                        expect(async () => await service.execute(userID, followID)).rejects.toThrow(FriendException);
                    })
                })
            })

            describe("and the following user id does NOT exist in the db,", () => {

                it("throw an Error stating the following does not exist.", async () => {
                    const userID = 1;
                    const followID = -99;

                    // WHEN
                    const loggedInUser = await orm.em.findOne(User, userID);
                    const followUser = await orm.em.findOne(User, followID);

                    mockedUserRepo.findByID.mockResolvedValueOnce(loggedInUser);
                    mockedUserRepo.findByID.mockResolvedValueOnce(followUser);

                    // THEN
                    expect(async () => await service.execute(userID, followID)).rejects.toThrow(FriendException);
                })
            })
        })

        describe("and the logged in user does NOT exist in the db,", () => {

            it("throw an Error stating the logged in user does not exist.", async () => {
                const userID = -99;
                const followID = 1;

                // WHEN
                const loggedInUser = await orm.em.findOne(User, userID);
                const followUser = await orm.em.findOne(User, followID);

                mockedUserRepo.findByID.mockResolvedValueOnce(loggedInUser);
                mockedUserRepo.findByID.mockResolvedValueOnce(followUser);

                // THEN
                expect(async () => await service.execute(userID, followID)).rejects.toThrow(FriendException);
            })
        })

    })
});