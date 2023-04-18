// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { generateItems } from "../../test-utils/generate-items.setup";
import { Channel } from "../../../entities/channel.entity";
import ChannelRepository from '../../../repositories/channel.repository';
import UpdateChannelUsecase from '../../../services/usecases/channel/updateChannel.usecase'
import ChannelExeption from '../../../utils/exceptions/channel.exception';
import ChannelDTO from "../../../dto/channel.dto";

describe("UpdateChannelUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: UpdateChannelUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let channels: ChannelRepository;

    const testChannel = {
        title: "update test channel",
        description: "description"
    }

    beforeEach(() => {
        service = new UpdateChannelUsecase(mockedChannelRepo);
        mockReset(mockedChannelRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        orm = await generateItems();
        channels = orm.em.getRepository<Channel>(Channel);
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When updating a channel,', () => {

        describe("and the channel is found in the db,", () => {

            describe("and the channel user id DOES match the logged in user id,", () => {

                describe("and the channel is successfully updated,", () => {

                    it("return a ChannelDTO.", async () => {
                        // GIVEN
                        const id = 1;
                        const userID = 1;
                        const channel = testChannel as ChannelDTO;

                        // WHEN
                        const foundChannel = await orm.em.findOne(Channel, id);
                        mockedChannelRepo.findByID.mockResolvedValue(foundChannel);

                        if (foundChannel) {
                            // Persist and flush to database
                            const updatedChannel = await channels.update(foundChannel, channel);
                            // Set mocked result to be updated channel
                            mockedChannelRepo.update.mockResolvedValue(updatedChannel);
                        }

                        const results = await service.execute(id, userID, testChannel);

                        // THEN
                        expect(results).toBeInstanceOf(ChannelDTO);
                    })
                })

                describe("and the cannot be updated to the database,", () => {

                    it("throws an Error from the db.", async () => {
                        // GIVEN
                        const id = 1;
                        const userID = 1;

                        // WHEN
                        const getChannel = await orm.em.findOne(Channel, id);
                        mockedChannelRepo.findByID.mockResolvedValue(getChannel);
                        // repo throws an error
                        mockedChannelRepo.update.mockRejectedValue(Error);

                        // THEN
                        expect(async () => await service.execute(id, userID, testChannel)).rejects.toThrow(ChannelExeption);
                    })
                })
            })

            describe("and the channel user id does NOT match the logged in user id,", () => {

                it("throw Error stating that they do not have permission to edit channel.", async () => {
                    // GIVEN
                    const id = 1;
                    const userID = -999;

                    // WHEN
                    const getChannel = await orm.em.findOne(Channel, id);
                    mockedChannelRepo.findByID.mockResolvedValue(getChannel);

                    // THEN
                    expect(async () => await service.execute(id, userID, testChannel)).rejects.toThrow(ChannelExeption);
                })
            })
        })

        describe("and the channel does NOT exist in the db,", () => {

            it("throw an Error stating the channel does not exist.", async () => {
                // GIVEN
                const id = -99;
                const userID = 1;

                // WHEN
                const getChannel = await orm.em.findOne(Channel, id);
                mockedChannelRepo.findByID.mockResolvedValue(getChannel);

                // THEN
                expect(getChannel).toEqual(null);
                expect(async () => await service.execute(id, userID, testChannel)).rejects.toThrow(ChannelExeption);
            })
        })

    })
});