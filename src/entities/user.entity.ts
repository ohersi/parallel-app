// Packages
import { Entity, EntityRepositoryType, Enum, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import UserRepository from '../repositories/user.repository';
import BaseEntity from './base.entity';
import IUser from './interfaces/user.entity.interface';
import { TYPES_ENUM } from '../utils/types/enum';

@Entity({ customRepository: () => UserRepository, tableName: 'users'})
export class User implements BaseEntity, IUser {

    [EntityRepositoryType]?: UserRepository;
    
    @PrimaryKey()
    id!: number;

    @Property()
    firstname!: string;

    @Property()
    lastname!: string;

    @Property()
    email!: string;

    @Property()
    password!: string;

    @Property()
    profileimg!: string;

    @Enum()
    role!: TYPES_ENUM;
};