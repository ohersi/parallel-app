import IRepository from "./interfaces/repository.interface";
import { EntityRepository } from '@mikro-orm/postgresql';
import BaseEntity from "src/entities/base.entity";

export default class Repository<T extends BaseEntity> extends EntityRepository<T> implements IRepository<T> {

    async save(entity: T): Promise<T> {
        throw new Error("Method not implemented.");
    };

    updateByID(entity: T, id: number): Promise<T> {
        throw new Error("Method not implemented.");
    }

    deleteByID(entity: T, id: number): Promise<T> {
        throw new Error("Method not implmented.");
    };

    async findByID(id: number): Promise<T> {
        // TODO: find return type of res
        const res: any = await this.find( { id } as any);
        return res;
    };

    search(entity: T, id: number): Promise<T[]> {
        throw new Error("Method not implmented.");
    };

}