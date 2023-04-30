// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
import { IBackup } from 'pg-mem';
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { Channel } from "../../../entities/channel.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import ChannelRepository from '../../../repositories/channel.repository';
import FollowRepository from "../../../repositories/follow.repository";
import GetChannelFollowersUsecase from "../../../services/usecases/channel/getChannelFollowers.usecase";
import FollowException from "../../../utils/exceptions/follow.exception";
import { Follow } from "../../../entities/follow.entity";

describe("GetChannelFollowersUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    const mockedFollowRepo = mockDeep<FollowRepository>();
    let service: GetChannelFollowersUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetChannelFollowersUsecase(mockedFollowRepo, mockedChannelRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedChannelRepo);
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

    describe('When given a channel id,', () => {

        describe("and the channel does exist in the db,", () => {

            it("return a channel followers object from database.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const getChannel = await orm.em.findOne(Channel, { id: id });
                const getChannelFollowers = await orm.em.find(Follow, { followed_channel: id }, { populate: ['user'] })
                mockedChannelRepo.findByID.mockResolvedValue(getChannel);
                mockedFollowRepo.findAllUserFollowingChannel.mockResolvedValue(getChannelFollowers);

                const results = await service.execute(id);

                // THEN
                expect(results).toEqual(getChannelFollowers);
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("throw an Error stating the channel does not exist.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                const getChannel = await orm.em.findOne(Channel, { id: id });
                mockedChannelRepo.findByID.mockResolvedValue(getChannel);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(FollowException);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                mockedFollowRepo.findAllUserFollowingChannel.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(FollowException);
            })
        })

    })
});