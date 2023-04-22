// Packages
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { mockDeep } from "jest-mock-extended";
import { mockReset } from "jest-mock-extended/lib/Mock";
import { cleanUpMetadata } from "inversify-express-utils";
// Imports
import { memOrm } from "../../test-utils/init-db.setup";
import { Channel } from "../../../entities/channel.entity";
import { generateItems } from "../../test-utils/generate-items.setup";
import ChannelRepository from '../../../repositories/channel.repository';
import CreateChannelUsecase from '../../../services/usecases/channel/createChannel.usecase';
import ChannelExeption from '../../../utils/exceptions/channel.exception';

describe("CreateChannelUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    let service: CreateChannelUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let channels: ChannelRepository;

    const testChannel = {
        title: "test channel",
        description: "description"
    }

    beforeEach(() => {
        service = new CreateChannelUsecase(mockedChannelRepo);
        mockReset(mockedChannelRepo);
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        channels = orm.em.getRepository<Channel>(Channel);
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When creating a channel,', () => {

        describe("and the channel's title does NOT match any existing channels from that user,", () => {

            it("insert channel into db.", async () => {
                // GIVEN
                const userID = 1;

                // WHEN
                // Check if channel w/ title already exists
                const foundChannel = await orm.em.findOne(Channel, { user: userID, title: testChannel.title });

                if (!foundChannel) {
                    const newChannel = new Channel(
                        userID,
                        testChannel.title,
                        testChannel.description,
                        new Date(),
                        new Date()
                    );
                    // Persist and flush to database
                    const createdChannel = await channels.save(newChannel);
                    // Set mocked result to be newly created channel
                    mockedChannelRepo.save.mockResolvedValue(createdChannel);
                }
                else {
                    mockedChannelRepo.save.mockRejectedValue(Error);
                }

                const results = await service.execute(testChannel, userID);

                // THEN
                const getChannel = await orm.em.findOne(Channel, { user: userID, title: testChannel.title });
                expect(getChannel?.title).toEqual(testChannel.title);
            })
        })

        describe("and the channel's title DOES match an already existing channel from that user,", () => {

            it("return an Error stating that a channel with that title already exists for that user.", async () => {
                // GIVEN
                const userID = 1;

                // WHEN
                // Check if channel w/ title already exists
                const foundChannel = await orm.em.findOne(Channel, { user: userID, title: testChannel.title });

                if (foundChannel) {
                    mockedChannelRepo.findByUserIDAndTitle.mockResolvedValue(foundChannel);
                }

                // THEN
                expect(async () => { await service.execute(testChannel, userID) }).rejects.toThrow(ChannelExeption);
            })
        })

    })
});