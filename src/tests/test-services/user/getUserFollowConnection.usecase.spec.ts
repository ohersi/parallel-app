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
import { Channel } from "../../../entities/channel.entity";
import { Follow } from "../../../entities/follow.entity";
import FollowRepository from "../../../repositories/follow.repository";
import GetUserFollowConnectionUsecase from "../../../services/usecases/user/getUserFollowConnection.usecase";
import FollowException from "../../../utils/exceptions/follow.exception";

describe("GetUserFollowConnectionUsecase", () => {

    const mockedFollowRepo = mockDeep<FollowRepository>();
    let service: GetUserFollowConnectionUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let follow: FollowRepository;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetUserFollowConnectionUsecase(mockedFollowRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedFollowRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        follow = orm.em.getRepository<Follow>(Follow);

        // Add inital follow connection
        const loggedInUser = await orm.em.findOne(User, 1);
        const followChannel = await orm.em.findOne(Channel, 2);
        const newFollow = new Follow(
            loggedInUser!,
            followChannel!,
            new Date()
        );
        // Persist and flush to database
        await follow.save(newFollow);
        // Add to collection
        loggedInUser!.followed_channel.add(followChannel!);

        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When given a user id and channel id,', () => {

        describe('and there is a connection does exist in the db', () => {

            it("return a boolean of true.", async () => {
                // GIVEN
                const userID = 1;
                const channelID = 2;

                // WHEN
                const getConnection = await orm.em.findOne(Follow, { user: userID, followed_channel: channelID });
                mockedFollowRepo.findIfFollowsChannel.mockResolvedValue(getConnection);

                const results = await service.execute(userID, channelID);

                // THEN
                expect(results).toEqual(true);
            })
        })

        describe('and there is NOT a connection does exist in the db', () => {

            it("return boolean of false.", async () => {
                 // GIVEN
                 const userID = 1;
                 const channelID = -999;

                // WHEN
                const getConnection = await orm.em.findOne(Follow, { user: userID, followed_channel: channelID });
                mockedFollowRepo.findIfFollowsChannel.mockResolvedValue(getConnection);

                const results = await service.execute(userID, channelID);

                // THEN
                expect(results).toEqual(false);
            })
        })

        describe('and db throws an error,', () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const userID = 1;
                const channelID = 2;

                // WHEN
                mockedFollowRepo.findIfFollowsChannel.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(userID, channelID) }).rejects.toThrowError(FollowException);
            })
        })
    })
});
