export default class BlockDTO {

    user_id?: number;
    title?: string;
    description?: string;
    source_url?: string;
    image_url?: string;
    date_created?: Date;
    date_updated?: Date;

    constructor(
        user_id?: number,
        title?: string,
        description?: string,
        source_url?: string,
        image_url?: string,
        date_created?: Date,
        date_updated?: Date,
    ) {
        this.user_id = user_id;
        this.title = title;
        this.description = description;
        this.source_url = source_url;
        this.date_created = date_created;
        this.date_updated = date_updated;
    }

}