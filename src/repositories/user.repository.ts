import { Users } from '../entities/user.entity';
import Repository from './repository';
import { injectable } from 'inversify'
import  { Entity } from '@mikro-orm/core'


@injectable()
@Entity({ customRepository: () => Users })
export default class UserRepository extends Repository<Users>  {

    // TODO: Custom methods 
}