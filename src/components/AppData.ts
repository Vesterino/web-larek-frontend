import { FormErrors, IAppState, IContactsForm, IOrder, IOrderForm, IProduct } from "../types";
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
    basket: IProduct[] = [];
    catalog: ProductItem[];
    order: IOrder = {
        payment: undefined,
        address: '',
        email: '',
        phone: '',
        items: [],
    };
    contacts: IContactsForm = {
        email: '',
        phone: '',
    };

    preview: string | null;
    formErrors: FormErrors = {};

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('products:changed', { catalog: this.catalog });
    }

    clearBasket() {
        this.basket = [];
        this.events.emit('basket:changed');
    }

    getCatalog(): ProductItem[] {
        return this.catalog;
    }

    addToBasket(product: IProduct) {
        this.basket.push(product);
        this.events.emit('basket.changed')
    }

    getBasket() {
        return this.basket;
    }

    getBasketTotal(): number {
        return this.basket.reduce((sum, item) => sum + (item.price || 0), 0)
    }

    removeIsBasket(productId: string) {
        const index = this.basket.findIndex(item => item.id === productId);

        if (index !== -1) {
            this.basket.splice(index, 1);
        }

        this.events.emit('basket:changed');
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

    setContactsField<K extends keyof IContactsForm>(field: K, value: IContactsForm[K]) {
        (this.contacts as IContactsForm)[field] = value;
        this.emitChanges('contacts:changed', this.contacts);
    }

    // getOrder(): IOrder {
    //     return {
    //         method: this.order.method,
    //         address: this.order.address,
    //         email: this.contacts.email,
    //         phone: this.contacts.phone,
    //         items: this.basket
    //     }
    // }

    validateOrder() {
        const errors: typeof this.formErrors = {};

        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
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
        if (!this.contacts.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.contacts.phone) {
            errors.phone = 'Необходимо указать номер телефона'
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}