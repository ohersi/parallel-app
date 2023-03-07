import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';

@Entity()
export class Users {

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