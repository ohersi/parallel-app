// Packages
import { Collection, Entity, EntityRepositoryType, Enum, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import ChannelRepository from '../repositories/channel.repository';
import IChannel from './interfaces/channel.entity.interface';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { Block } from './block.entity';
import { Connection } from './connection.entity';

@Entity({ customRepository: () => ChannelRepository, tableName: 'channels' })
export class Channel implements BaseEntity, IChannel {

    [EntityRepositoryType]?: ChannelRepository;

    @PrimaryKey()
    id!: number;

    @ManyToOne(() => User, { mapToPk: true })
    user!: number;

    @Property()
    title!: string;

    @Property()
    description!: string;

    @Property()
    slug!: string;

    @ManyToMany({ entity: () => Block, pivotEntity: () => Connection })
    blocks = new Collection<Block>(this)

    @Property()
    date_created!: Date;

    @Property()
    date_updated!: Date;

    constructor(
        user: number,
        title: string,
        description: string,
        slug: string,
        date_created: Date,
        date_updated: Date,
    ) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.slug = slug;
        this.date_created = date_created;
        this.date_updated = date_updated;
    }
};