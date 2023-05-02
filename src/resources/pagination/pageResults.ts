export default class PageResults {

    total!: number;
    next!: number | null;
    data!: any;

    constructor(total: number, next: number | null, data: any) {
        this.total = total;
        this.next = next;
        this.data = data;
    }
}