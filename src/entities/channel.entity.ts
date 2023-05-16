// Packages
import { Collection, Entity, EntityRepositoryType, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import { User } from '@/entities/user.entity';
import { Block } from '@/entities/block.entity';
import { Connection } from '@/entities/connection.entity';
import { Follow } from '@/entities/follow.entity';
import BaseEntity from '@/entities/base.entity';
import IChannel from '@/entities/interfaces/channel.entity.interface';
import ChannelRepository from '@/repositories/channel.repository';

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

    @ManyToMany({ entity: () => User, pivotEntity: () => Follow })
    users_following = new Collection<User>(this)

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