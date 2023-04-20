// Packages
import { Entity, EntityRepositoryType, Enum, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
// Imports
import IBlock from './interfaces/block.entity.interface';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import BlockRepository from '../repositories/block.repository';

@Entity({ customRepository: () => BlockRepository, tableName: 'blocks' })
export class Block implements BaseEntity, IBlock {

    [EntityRepositoryType]?: BlockRepository;

    @PrimaryKey()
    id!: number;

    @OneToOne(() => User, { mapToPk: true })
    user!: number;

    @Property()
    title!: string;

    @Property()
    description!: string;

    @Property()
    source_url!: string;

    @Property()
    image_url!: string;

    @Property()
    date_created!: Date;

    @Property()
    date_updated!: Date;

    constructor(
        user: number,
        title: string,
        description: string,
        source_url: string,
        image_url: string,
        date_created: Date,
        date_updated: Date,
    ) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.source_url = source_url;
        this.image_url = image_url;
        this.date_created = date_created;
        this.date_updated = date_updated;
    }
};