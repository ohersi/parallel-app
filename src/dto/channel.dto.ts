import { Loaded } from "@mikro-orm/core";
import { Block } from "@/entities/block.entity";

export default class ChannelDTO {

    user_id?: number;
    title?: string;
    description?: string;
    slug?: string;
    date_created?: Date;
    date_updated?: Date;
    blocks?: Loaded<Block, never>[] | undefined;

    constructor(
        user_id?: number,
        title?: string,
        description?: string,
        slug?: string,
        date_created?: Date,
        date_updated?: Date,
        blocks?: any,
    ) {
        this.user_id = user_id;
        this.title = title;
        this.description = description;
        this.slug = slug;
        this.date_created = date_created;
        this.date_updated = date_updated;
        this.blocks = blocks;
    }
}