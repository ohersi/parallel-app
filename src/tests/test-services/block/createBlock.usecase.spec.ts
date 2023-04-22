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
import BlockRepository from "../../../repositories/block.repository";
import ConnectionRepository from "../../../repositories/connection.repository";
import CreateBlockUsecase from '../../../services/usecases/block/createBlock.usecase';
import { Block } from "../../../entities/block.entity";

describe("CreateBlockUsecase", () => {

    const mockedChannelRepo = mockDeep<ChannelRepository>();
    const mockedBlockRepo = mockDeep<BlockRepository>();
    const mockedConnectionRepo = mockDeep<ConnectionRepository>();
    let service: CreateBlockUsecase;
    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let blocks: BlockRepository;
    let backup: IBackup;

    const testBlock = {
        title: "Fragile Express",
        description: "Porter company of Fragile",
        source_url: "source_url",
        image_url: "image_url"
    }

    beforeEach(() => {
        service = new CreateBlockUsecase(mockedBlockRepo, mockedChannelRepo, mockedConnectionRepo);
        // Restore im-mem db to original state
        backup.restore();
        mockReset(mockedBlockRepo);
        mockReset(mockedBlockRepo);
        mockReset(mockedConnectionRepo)
        cleanUpMetadata();
    })

    beforeAll(async () => {
        // Create database instance
        const execute = await memOrm;
        orm = execute.memOrm;
        // Generate test entities
        await generateItems(orm);
        blocks = orm.em.getRepository<Block>(Block);
        // Create backup of db
        backup = execute.memDb.backup();
    });

    afterAll(async () => {
        await orm.close();
    })

    it("should be defined", () => {
        expect(service).toBeDefined();
    })

    describe('When creating a block,', () => {

        describe("and the channel is found in the db,", () => {

            describe("and the channel user id DOES match the logged in user id,", () => {

                describe("and the block is successfully created,", () => {

                    it("return a Block.", async () => {
                        // GIVEN
                        const channelID = 1;
                        const userID = 1;

                        // WHEN
                        const foundChannel = await orm.em.findOne(Channel, channelID);
                        mockedChannelRepo.findByID.mockResolvedValue(foundChannel);

                        if (foundChannel) {
                            const newBlock = new Block(
                                userID,
                                testBlock.title,
                                testBlock.description,
                                testBlock.source_url,
                                testBlock.image_url,
                                new Date(),
                                new Date()
                            )
                            // Persist and flush to database
                            const createdBlock = await blocks.save(newBlock);
                            // Set mocked result to be newly created block
                            mockedBlockRepo.save.mockResolvedValue(createdBlock);
                            // Add to collection
                            createdBlock.channels.add(foundChannel);
                        }

                        const results = await service.execute(testBlock, userID, channelID);

                        // THEN
                        expect(results).toBeInstanceOf(Block);
                    })
                })

                describe("and the block cannot be added to the database,", () => {

                    it("throw an Error from the db.", async () => {
                        // GIVEN
                        const channelID = 1;
                        const userID = 1;

                        // WHEN
                        const foundChannel = await orm.em.findOne(Channel, channelID);
                        mockedChannelRepo.findByID.mockResolvedValue(foundChannel);

                        // Set mocked result to be newly created block
                        mockedBlockRepo.save.mockRejectedValue(Error);

                        // THEN
                        expect(async () => await service.execute(testBlock, userID, channelID)).rejects.toThrow(Error);
                    })
                })
            })

            describe("and the channel user id does NOT match the logged in user id,", () => {

                it("throw Error stating that they do not have permission to add to channel.", async () => {
                    // GIVEN
                    const channelID = 1;
                    const userID = -99;

                    // WHEN
                    const foundChannel = await orm.em.findOne(Channel, channelID);
                    mockedChannelRepo.findByID.mockResolvedValue(foundChannel);

                    // THEN
                    expect(async () => await service.execute(testBlock, userID, channelID)).rejects.toThrow(Error);
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
                mockedChannelRepo.findByID.mockResolvedValue(foundChannel);

                // THEN
                expect(async () => await service.execute(testBlock, userID, channelID)).rejects.toThrow(Error);
            })
        })

    })
});