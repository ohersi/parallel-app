import { User } from '../entities/user.entity';
import Repository from './repository';
import { injectable } from 'inversify'
import  { Entity } from '@mikro-orm/core'


@injectable()
@Entity({ customRepository: () => User })
export default class UserRepository extends Repository<User>  {

    // TODO: Custom methods 
}