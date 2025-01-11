import { FormErrors, IAppState, IOrder, IOrderForm, IProduct } from "../types";
import { Model } from "./base/Model";

export class ProductItem extends Model<IProduct> {
    category: string;
    image: string;
    title: string;
    description: string;
    price: number | null;
    id: string;
}

export class AppState extends Model<IAppState> {
    basket: string[];
    catalog: ProductItem[];
    order: IOrder = {
        method: undefined,
        address: '',
        email: '',
        phone: '',
        items: [],
    };
    preview: string | null;
    formErrors: FormErrors = {};

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('products:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem | IProduct) {
        if (!item) {
            console.error('Preview item is undefined');
            return;
        }
        
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField<K extends keyof IOrderForm>(field: K, value: IOrderForm[K]) {
        (this.order as IOrderForm)[field] = value;
        this.emitChanges('order:changed', this.order);
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.method) {
            errors.method = 'Необходимо указать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать номер телефона'
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}