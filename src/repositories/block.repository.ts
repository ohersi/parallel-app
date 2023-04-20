// Packages
import { Entity, Loaded, QueryOrder, wrap } from '@mikro-orm/core';
import { injectable } from 'inversify'
// Imports
import { Block } from '../entities/block.entity';
import IRepository from './interfaces/repository.interface';
import BaseRepository from './base.repository';

@injectable()
@Entity({ customRepository: () => Block })
export default class BlockRepository extends BaseRepository<Block> implements IRepository<Block>  {

    
}