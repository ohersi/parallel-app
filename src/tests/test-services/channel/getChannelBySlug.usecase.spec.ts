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
import GetChannelBySlugUsecase from "../../../services/usecases/channel/getChannelBySlug.usecase";
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("GetChannelBySlugUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: GetChannelBySlugUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let backup: IBackup;

    beforeEach(() => {
        service = new GetChannelBySlugUsecase(mockedChannelRepo);
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

    describe('When given a channel slug,', () => {

        describe("and the channel does exist in the db,", () => {

            it("return a channel object from database.", async () => {
                // GIVEN
                const getSlug = await orm.em.findOne(Channel, { id: 1 });
                const slug = getSlug?.slug || 'title';
                // WHEN
                const getChannel = await orm.em.findOne(Channel, { slug: slug }, { populate: ['blocks']});
                mockedChannelRepo.findBySlug.mockResolvedValue(getChannel);

                const results = await service.execute(slug);

                // THEN
                expect(results).toEqual(getChannel);
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("return null.", async () => {
                // GIVEN
                const slug = '';

                // WHEN
                const getChannel = await orm.em.findOne(Channel, { slug: slug }, { populate: ['blocks']});
                mockedChannelRepo.findBySlug.mockResolvedValue(getChannel);

                const results = await service.execute(slug);

                // THEN
                expect(getChannel).toEqual(null);
                expect(results).toEqual(null);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const slug = '';

                // WHEN
                mockedChannelRepo.findBySlug.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(slug) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});