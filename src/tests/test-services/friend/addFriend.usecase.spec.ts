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
import UserRepository from "../../../repositories/user.repository";
import AddFriendUsecase from "../../../services/usecases/friend/addFriend.usecase";
import FriendException from "../../../utils/exceptions/friend.exception";
import { Friend } from "../../../entities/friend.entity";
import { User } from "../../../entities/user.entity";

describe("AddFriendUsecase", () => {

    const mockedFriendRepo = mockDeep<FriendRepository>();
    const mockedUserRepo = mockDeep<UserRepository>();
    let service: AddFriendUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let friend: FriendRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new AddFriendUsecase(mockedFriendRepo, mockedUserRepo);
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
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When a user wants to follow another user,', () => {

        describe("and the logged in user is found in the db,", () => {

            describe("and the following user id is found in the db,", () => {

                describe("and the logged in user does NOT match the user trying they're trying to follow (aka follow themselves),", () => {

                    describe("and a logged in user has successfully followed the user,", () => {

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
                                const newFriend = new Friend(
                                    loggedInUser,
                                    followUser,
                                    new Date()
                                );
                                // Persist and flush to database
                                const createFriend = await friend.save(newFriend);
                                // Set mocked result to be newly created friend
                                mockedFriendRepo.save.mockResolvedValue(createFriend);
                                // Add to collection
                                loggedInUser.friends.add(followUser);
                            }

                            const results = await service.execute(userID, followID);

                            // THEN
                            expect(results).toBeUndefined();
                        })
                    })

                    describe("and a logged in user could NOT successfully follow the user,", () => {

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
                                mockedFriendRepo.save.mockRejectedValue(Error);
                            }

                            // THEN
                            expect(async () => await service.execute(userID, followID)).rejects.toThrow(FriendException);
                        })
                    })
                })

                describe("and the logged in user DOES match the user they're trying to follow (aka follow themselves),", () => {

                    it("throw Error stating user cannot follow themselves.", async () => {
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

            it("throw an Error stating the channel does not exist.", async () => {
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