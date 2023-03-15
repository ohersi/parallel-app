// Packages
import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import UserRepository from '../repositories/user.repository';
import BaseEntity from './base.entity';
import IUser from './interfaces/user.entity.interface';

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

};