// Packages
import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import { User } from '@/entities/user.entity';
import { Channel } from '@/entities/channel.entity';
import IFollow from '@/entities/interfaces/follow.interface';
import FollowRepository from '@/repositories/follow.repository';


@Entity({ customRepository: () => FollowRepository, tableName: 'follows' })
export class Follow implements IFollow {

    [EntityRepositoryType]?: FollowRepository;

    @ManyToOne({ primary: true })
    user!: User;

    @ManyToOne({ primary: true })
    followed_channel!: Channel;

    @Property()
    date_created!: Date;

    constructor(
        user: User,
        followed_channel: Channel,
        date_created: Date,
    ) {
        this.user = user;
        this.followed_channel = followed_channel;
        this.date_created = date_created;
    }
}