export class DiD {
    constructor() {
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DiD();
        }
        return this.instance;
    }
}
