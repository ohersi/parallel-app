import { Entity, PrimaryKey } from '@mikro-orm/core';
import IBaseEntity from '@/entities/interfaces/base.interface';

@Entity({ abstract: true })
export default abstract class BaseEntity implements IBaseEntity {
    
    // @PrimaryKey()
    // id!: number;
};