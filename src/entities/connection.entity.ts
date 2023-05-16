// Packages
import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import { Block } from '@/entities/block.entity';
import { Channel } from '@/entities/channel.entity';
import IConnection from '@/entities/interfaces/connection.entity.interface';
import ConnectionRepository from '@/repositories/connection.repository';

@Entity({ customRepository: () => ConnectionRepository, tableName: 'connection' })
export class Connection implements IConnection {

    [EntityRepositoryType]?: ConnectionRepository;

    @ManyToOne({ primary: true })
    block!: Block;

    @ManyToOne({ primary: true })
    connected_channel!: Channel;

    @Property()
    date_created!: Date;

    constructor(
        block: Block,
        connected_channel: Channel,
        date_created: Date,
    ) {
        this.block = block;
        this.connected_channel = connected_channel;
        this.date_created = date_created;
    }
}