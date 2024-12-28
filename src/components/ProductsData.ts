import { IProduct, IProductsData } from "../types";
import { IEvents } from "./base/events";

export class ProductData implements IProductsData {
    protected _products: IProduct[];
    preview: string | null;

    constructor(protected events: IEvents) {
    }

    set products(products:IProduct[]) {
        this._products = products;
        this.events.emit('products:changed', this._products)
    }

    get products () {
        return this._products;
    }
}