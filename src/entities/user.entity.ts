// Packages
import { Collection, Entity, EntityRepositoryType, Enum, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import UserRepository from '../repositories/user.repository';
import BaseEntity from './base.entity';
import IUser from './interfaces/user.entity.interface';
import { TYPES_ENUM } from '../utils/types/enum';
import { Friend } from './friend.entity';
import { Channel } from './channel.entity';
import { Follow } from './follow.entity';

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
    enabled: boolean = false;

    @Property()
    locked: boolean = false;

    @Enum()
    role!: TYPES_ENUM;

    constructor(
        slug: string,
        first_name: string,
        last_name: string,
        full_name: string,
        email: string,
        password: string,
        avatar: string,
        role: TYPES_ENUM,
    ) {
        this.slug = slug;
        this.first_name = first_name;
        this.last_name = last_name;
        this.full_name = full_name;
        this.email = email;
        this.password = password;
        this.avatar = avatar;
        this.role = role;
    }
};