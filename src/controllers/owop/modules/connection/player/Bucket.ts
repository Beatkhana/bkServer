export class Bucket {

    lastCheck: number;
    allowance: any;
    rate: any;
    time: any;
    infinite: boolean;

    constructor(rate, time) {
        this.lastCheck = Date.now();
        this.allowance = rate;
        this.rate = rate;
        this.time = time;
        this.infinite = false;
    }

    canSpend(count) {
        if (this.infinite) {
            return true;
        }
        this.allowance += (Date.now() - this.lastCheck) / 1000 * (this.rate / this.time);
        this.lastCheck = Date.now();
        if (this.allowance > this.rate) {
            this.allowance = this.rate;
        }
        if (this.allowance < count) {
            return false;
        }
        this.allowance -= count;
        return true;
    }
}

// module.exports = Bucket;