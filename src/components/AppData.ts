import { IAppState, IOrder, IProduct } from "../types";
import { Model } from "./base/Model";

export class ProductItem extends Model<IProduct> {
    category: string;
    image: string;
    title: string;
    description: string;
    price: number;
    id: string;
}

export class AppState extends Model<IAppState> {
    basket: string[];
    catalog: ProductItem[];
    order: IOrder = {
        method: '',
        address: '',
        email: '',
        telephone: '',
        total: '',
        items: [],
    };

    preview: string | null;

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('products:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }
}