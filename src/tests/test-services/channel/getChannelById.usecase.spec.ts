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
import PageResults from "../../../resources/pagination/pageResults";

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

            it("return a PageResults object with channel object.", async () => {
                // GIVEN
                const id = 1;
                const last_id = new Date().toISOString();
                const limit = 10;

                // WHEN
                const getChannel = await orm.em.findOne(Channel, { id: id });
                const blocks = await getChannel?.blocks.init();
                const count = blocks?.count();
                const items = blocks?.getItems(); 
                mockedChannelRepo.getChannelAndBlocks.mockResolvedValue([getChannel, items, count]);

                const results = await service.execute(id, last_id, limit);

                // THEN
                expect(results).toBeInstanceOf(PageResults);
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("return a PageResults object with channel object with null channel object data.", async () => {
                // GIVEN
                const id = -99;
                const last_id = new Date().toISOString();
                const limit = 10;

                // WHEN
                const getChannel = await orm.em.findOne(Channel, { id: id });
                const blocks = await getChannel?.blocks.init();
                const count = blocks?.count();
                const items = blocks?.getItems();  
                mockedChannelRepo.getChannelAndBlocks.mockResolvedValue([getChannel, items, count]);

                const results = await service.execute(id, last_id, limit);

                // THEN
                expect(getChannel).toEqual(null);
                expect(results.data.title).toBeUndefined();
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -99;
                const last_id = new Date().toISOString();
                const limit = 10;

                // WHEN
                mockedChannelRepo.getChannelAndBlocks.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id, last_id, limit) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});