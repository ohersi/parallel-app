import IRepository from "./interfaces/repository.interface";

// import database Pool
// pool = require(database);
// pool.query(insert SQL query);
// use Knex for SQL query builder

export default class Repository<T> implements IRepository<T> {

    create(entity: T): Promise<T> {
        throw new Error("Method not implemented.");
        // pool.query(knex(table).insert(names[]).values(values[]))
    };

    updateByID(id: number, entity: T): Promise<T> {
        throw new Error("Method not implemented.");
    }

    deleteByID(id: number): Promise<T> {
        throw new Error("Method not implmented.");
    };

    findByID(id: number): Promise<T> {
        throw new Error("Method not implmented.");
    };

    findAll(entity: T): Promise<T[]> {
        throw new Error("Method not implmented.");
    };

}