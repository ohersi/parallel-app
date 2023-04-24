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
import GetChannelByIdUsecase from '../../../services/usecases/channel/getChannelById.usecase'
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("GetChannelByIdUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: GetChannelByIdUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetChannelByIdUsecase(mockedChannelRepo);
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

            it("return a channel object from database.", async () => {
                // GIVEN
                const id = 1;

                // WHEN
                const getChannel = await orm.em.find(Channel, { user: id }, { populate: ['blocks']});
                mockedChannelRepo.getChannelAndBlocks.mockResolvedValue(getChannel);

                const results = await service.execute(id);

                // THEN
                expect(results).toEqual(getChannel);
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("return null.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                const getChannel = await orm.em.find(Channel, { user: id }, { populate: ['blocks']});
                mockedChannelRepo.getChannelAndBlocks.mockResolvedValue(getChannel);

                const results = await service.execute(id);

                // THEN
                expect(getChannel).toEqual([]);
                expect(results).toEqual([]);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockedChannelRepo.getChannelAndBlocks.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});