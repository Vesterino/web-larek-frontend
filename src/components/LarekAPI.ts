import { IOrder, IOrderResults } from "../types";
import { Api } from "./base/api";

export interface ILarekAPI {
    orderProducts: (order: IOrder) => Promise<IOrderResults>
}

export class LarekAPI extends Api implements ILarekAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    orderProducts(order: IOrder): Promise<IOrderResults> {
        return this.post('/order', order).then(
            (data: IOrderResults) => data
        )
    };   
}