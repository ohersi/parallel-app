// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { User } from "../../../entities/user.entity";
import { Channel } from "../../../entities/channel.entity";
import { Follow } from "../../../entities/follow.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import UserRepository from "../../../repositories/user.repository";
import ChannelRepository from '../../../repositories/channel.repository';
import FollowRepository from "../../../repositories/follow.repository";
import UnFollowChannelUsecase from "../../../services/usecases/follow/unfollowChannel.usecase";

describe("UnFollowChannelUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    const mockedUserRepo = mockDeep<UserRepository>();
    const mockedFollowRepo = mockDeep<FollowRepository>();
    let service: UnFollowChannelUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let follow: FollowRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new UnFollowChannelUsecase(mockedFollowRepo, mockedUserRepo, mockedChannelRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedChannelRepo);
        mockReset(mockedUserRepo);
        mockReset(mockedFollowRepo)
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        follow = orm.em.getRepository<Follow>(Follow);
        // Add follow
        const foundChannel = await orm.em.findOne(Channel, 1);
        const foundUser = await orm.em.findOne(User, 2);
        const newFollow = new Follow(
            foundUser!,
            foundChannel!,
            new Date()
        );
        await follow.save(newFollow);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When a user wants to unfollow a channel,', () => {

        describe("and the channel is found in the db,", () => {

            describe("and the user is found in the db,", () => {

                describe("and the channel user id does NOT match the logged in user id,", () => {

                    describe("and the logged in user matches user id given,", () => {

                        describe("and a channel was successfully unfollowed,", () => {

                            it("return nothing.", async () => {
                                // GIVEN
                                const channelID = 1;
                                const userID = 2;

                                // WHEN
                                const foundChannel = await orm.em.findOne(Channel, channelID);
                                const foundUser = await orm.em.findOne(User, userID);
                                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                                mockedUserRepo.findByID.mockResolvedValue(foundUser);

                                if (foundChannel && foundUser) {
                                    const foundFollowConnection = await follow.findIfFollowsChannel(foundUser.id, foundChannel.id);
                                    mockedFollowRepo.findIfFollowsChannel.mockResolvedValue(foundFollowConnection);

                                    if (foundFollowConnection) {
                                        // Persist and flush to database
                                        // const unFollowed = await follow.delete(foundFollowConnection);
                                        // Set mocked result to be newly unfollow
                                        mockedFollowRepo.delete.mockResolvedValue(null);
                                        // Remove to collection
                                        // foundUser.followed_channel.init();
                                        // foundUser.followed_channel.remove(foundChannel);
                                    }
                                }

                                const results = await service.execute(userID, channelID);

                                // THEN
                                //  const returnsNullIfDeleted = await follow.findIfFollowsChannel(userID, channelID);
                                expect(results).toBeUndefined();
                            })
                        })

                        describe("and a channel was could be unfollowed,", () => {

                            it("throw an Error from the db.", async () => {
                                // GIVEN
                                const channelID = 1;
                                const userID = 2;

                                // WHEN
                                const foundChannel = await orm.em.findOne(Channel, channelID);
                                const foundUser = await orm.em.findOne(User, userID);
                                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                                mockedUserRepo.findByID.mockResolvedValue(foundUser);

                                mockedFollowRepo.delete.mockRejectedValue(Error);

                                // THEN
                                expect(async () => await service.execute(userID, channelID)).rejects.toThrow(Error);
                            })
                        })
                    })

                    describe("and the logged in user does NOT match user id given,", () => {

                        it("throw Error stating that logged in user and user id given do not match.", async () => {
                            const channelID = 1;
                            const userID = 2;

                            // WHEN
                            const foundChannel = await orm.em.findOne(Channel, channelID);
                            const foundUser = await orm.em.findOne(User, 1);
                            mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                            mockedUserRepo.findByID.mockResolvedValue(foundUser);

                            // THEN
                            expect(async () => await service.execute(userID, channelID)).rejects.toThrow(Error);
                        })
                    })
                })

                describe("and the channel user id DOES match the logged in user id,", () => {

                    it("throw Error stating that the user cannot unfollow their own channel.", async () => {
                        // GIVEN
                        const channelID = 1;
                        const userID = 1;

                        // WHEN
                        const foundChannel = await orm.em.findOne(Channel, channelID);
                        const foundUser = await orm.em.findOne(User, userID);
                        mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                        mockedUserRepo.findByID.mockResolvedValue(foundUser);

                        // THEN
                        expect(async () => await service.execute(userID, channelID)).rejects.toThrow(Error);
                    })
                })
            })

            describe("and the user does NOT exist in the db,", () => {

                it("throw an Error stating the block does not exist.", async () => {
                    // GIVEN
                    const channelID = 1;
                    const userID = -99;

                    // WHEN
                    const foundChannel = await orm.em.findOne(Channel, channelID);
                    const foundUser = await orm.em.findOne(User, userID);
                    mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                    mockedUserRepo.findByID.mockResolvedValue(foundUser);

                    // THEN
                    expect(async () => await service.execute(userID, channelID)).rejects.toThrow(Error);
                })
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("throw an Error stating the channel does not exist.", async () => {
                // GIVEN
                const channelID = -99;
                const userID = 1;

                // WHEN
                const foundChannel = await orm.em.findOne(Channel, channelID);
                const foundUser = await orm.em.findOne(User, userID);
                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);
                mockedUserRepo.findByID.mockResolvedValue(foundUser);

                // THEN
                expect(async () => await service.execute(userID, channelID)).rejects.toThrow(Error);
            })
        })

    })
});