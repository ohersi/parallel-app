// Packages
import { Collection, Entity, EntityRepositoryType, Enum, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import { Channel } from '@/entities/channel.entity';
import { Friend } from '@/entities/friend.entity';
import BaseEntity from '@/entities/base.entity';
import IUser from '@/entities/interfaces/user.entity.interface';
import UserRepository from '@/repositories/user.repository';
import { TYPES_ENUM } from '@/utils/types/enum';

@Entity({ customRepository: () => UserRepository, tableName: 'users' })
export class User implements BaseEntity, IUser {

    [EntityRepositoryType]?: UserRepository;

    @PrimaryKey()
    id!: number;

    @Property()
    slug!: string;

    @Property()
    first_name!: string;

    @Property()
    last_name!: string;

    @Property()
    full_name!: string;

    @Property()
    email!: string;

    @Property({ hidden: true })
    password!: string;

    @ManyToMany({ entity: () => User, pivotEntity: () => Friend })
    friends = new Collection<User>(this);

    @ManyToMany({ entity: () => Channel, mappedBy: c => c.users_following })
    followed_channel = new Collection<Channel>(this);

    @Property()
    avatar!: string;

    @Property()
    following_count!: number;

    @Property()
    follower_count!: number;

    @Property()
    enabled: boolean = false;

    @Property()
    locked: boolean = false;

    @Enum(() => TYPES_ENUM)
    role!: TYPES_ENUM;

    constructor(
        slug: string,
        first_name: string,
        last_name: string,
        full_name: string,
        email: string,
        password: string,
        avatar: string,
        following_count: number,
        follower_count: number,
        role: TYPES_ENUM,
    ) {
        this.slug = slug;
        this.first_name = first_name;
        this.last_name = last_name;
        this.full_name = full_name;
        this.email = email;
        this.password = password;
        this.avatar = avatar;
        following_count = following_count;
        follower_count = follower_count;
        this.role = role;
    }
};