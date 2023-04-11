// Packages
import { Entity, EntityRepositoryType, Enum, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import UserRepository from '../repositories/user.repository';
import BaseEntity from './base.entity';
import IUser from './interfaces/user.entity.interface';
import { TYPES_ENUM } from '../utils/types/enum';

@Entity({ customRepository: () => UserRepository, tableName: 'users' })
export class User implements BaseEntity, IUser {

    [EntityRepositoryType]?: UserRepository;

    @PrimaryKey()
    id!: number;

    @Property()
    first_name!: string;

    @Property()
    last_name!: string;

    @Property()
    email!: string;

    @Property()
    password!: string;

    @Property()
    avatar_url!: string;

    @Property()
    enabled: boolean = false;

    @Property()
    locked: boolean = false;

    @Enum()
    role!: TYPES_ENUM;

    constructor(
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        avatar_url: string,
        role: TYPES_ENUM,
    ) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.avatar_url = avatar_url;
        this.role = role;
    }
};