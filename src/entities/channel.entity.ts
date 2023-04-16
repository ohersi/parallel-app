// Packages
import { Entity, EntityRepositoryType, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import ChannelRepository from '../repositories/channel.repository';
import IChannel from './interfaces/channel.entity.interface';
import BaseEntity from './base.entity';
import { User } from './user.entity';

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
    date_created!: Date;

    @Property()
    date_updated!: Date;

    constructor(
        id: number,
        user: number,
        title: string,
        description: string,
        date_created: Date,
        date_updated: Date,
    ) {
        this.id = id;
        this.user = user;
        this.title = title;
        this.description = description;
        this.date_created = date_created;
        this.date_updated = date_updated;
    }
};