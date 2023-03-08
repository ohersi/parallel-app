import { EntityRepository } from '@mikro-orm/postgresql';
import { Users } from 'src/models/user.entity';
import Repository from './repository';

class UserRepository extends Repository<Users>  {

    // Custom methods 
}

export default UserRepository;