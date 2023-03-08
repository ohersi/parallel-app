import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity({ abstract: true })
export default abstract class BaseEntity {
    
    @PrimaryKey()
    id!: number;
};