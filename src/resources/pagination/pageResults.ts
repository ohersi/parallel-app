export default class PageResults {

    total!: number;
    last_id!: number | string | null | undefined;
    data!: any;

    constructor(total: number, last_id: number | string | null | undefined, data: any) {
        this.total = total;
        this.last_id = last_id;
        this.data = data;
    }
}