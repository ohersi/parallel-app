import IRepository from "./interfaces/repository.interface";
import { EntityRepository } from '@mikro-orm/postgresql';
import BaseEntity from "src/entities/base.entity";
import { Loaded } from "@mikro-orm/core";

export default class Repository<T extends BaseEntity> extends EntityRepository<T> implements IRepository<T> {

    // TODO: Return create entity DTO?
    async save(entity: T): Promise<T> {
        try {
            const res = this.create(entity);
            await this.persistAndFlush(res);
            return res;
        }
        catch (error) {
            throw new Error("Method not implemented.");
        }
    };

    updateByID(entity: T, id: number): Promise<T> {
        throw new Error("Method not implemented.");
    }

    deleteByID(entity: T, id: number): Promise<T> {
        throw new Error("Method not implmented.");
    };

    async findByID(id: number): Promise<Loaded<T, never> | null> {
        // TODO: find return type of res
        try {
            const res = await this.findOne({ id } as any);
            return res;
        }
        catch (error) {
            throw new Error("ID Not found");
        }

    };

    getAll(): Promise<Loaded<T, never>[]> {
        try {
            const res = this.findAll();
            return res;
        }
        catch (error) {
            throw new Error("Method not implmented.");
        }
    };

}