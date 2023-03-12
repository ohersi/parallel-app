import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core';
import UserRepository from '../repositories/user.repository';
import BaseEntity from './base.entity';

@Entity({ customRepository: () => UserRepository})
export class Users implements BaseEntity {

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