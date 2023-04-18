export default class ChannelDTO {

    user_id?: number;
    title?: string;
    description?: string;
    date_created?: Date;
    date_updated?: Date;

    constructor(
        user_id?: number,
        title?: string,
        description?: string,
        date_created?: Date,
        date_updated?: Date
    ) {
        this.user_id = user_id;
        this.title = title;
        this.description = description;
        this.date_created = date_created;
        this.date_updated = date_updated;
    }
}