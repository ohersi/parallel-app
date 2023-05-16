// Packages
import { Entity, EntityRepositoryType, ManyToOne, Property } from '@mikro-orm/core';
// Imports
import { User } from '@/entities/user.entity';
import BaseEntity from '@/entities/base.entity';
import IFriend from '@/entities/interfaces/friend.interface';
import FriendRepository from '@/repositories/friend.repository';

@Entity({ customRepository: () => FriendRepository, tableName: 'friends' })
export class Friend implements BaseEntity, IFriend {

    [EntityRepositoryType]?: FriendRepository;

    @ManyToOne({ primary: true })
    following_user!: User;

    @ManyToOne({ primary: true })
    followed_user!: User;

    @Property()
    date_created!: Date;

    constructor(
        following_user: User,
        followed_user: User,
        date_created: Date,
    ) {
        this.following_user = following_user;
        this.followed_user = followed_user;
        this.date_created = date_created;
    }
}