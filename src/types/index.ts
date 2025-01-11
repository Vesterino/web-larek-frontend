export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string;
    image: string;
}

export interface IAppState {
    catalog: IProduct[];
    basket: string[];
    preview: string | null;
    order: IOrder
}

export interface IOrderForm {
    method?: 'card' | 'cash'; 
    address: string;
}

export interface IContactsForm {
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm, IContactsForm {
    items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IItems {
    items: IProduct[];
    total: number | null;
}

export interface IProductsData {
    products: IProduct[];
    preview: string | null;
    // fillProducts(products: IProduct[]): void;
    // getProducts(productsIds: string[]): IProduct[];
}

export interface IOrderData {
    order: IOrder[];
    addProductOrder(product: IProduct): void;
    deleteProductOrder(productId: string): void;
    clearOrder(list: IOrder[]): void;
    getOrder(productId: string): IOrder[];
    checkValidation(data: IOrderForm): boolean;
}

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    baseUrl: string;
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}