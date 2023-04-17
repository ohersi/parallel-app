// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { generateItems } from "../../test-utils/generate-items.setup";
import { Channel } from "../../../entities/channel.entity";
import ChannelRepository from '../../../repositories/channel.repository';
import GetChannelByIdUsecase from '../../../services/usecases/channel/getChannelById.usecase'
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("GetChannelByIdUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: GetChannelByIdUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;


    beforeEach(() => {
        service = new GetChannelByIdUsecase(mockedChannelRepo);
        mockReset(mockedChannelRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        orm = await generateItems();
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
                const getChannel = await orm.em.findOne(Channel, id);
                mockedChannelRepo.findByID.mockResolvedValue(getChannel);

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
                const getChannel = await orm.em.findOne(Channel, id);
                mockedChannelRepo.findByID.mockResolvedValue(getChannel);

                const results = await service.execute(id);

                // THEN
                expect(getChannel).toEqual(null);
                expect(results).toEqual(null);
            })
        })

        describe("and db throws an error,", () => {

            it("return the thrown error.", async () => {
                // GIVEN
                const id = -99;

                // WHEN
                mockedChannelRepo.findByID.mockRejectedValue(Error);

                // THEN
                expect(async () => { await service.execute(id) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});