export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string;
    image: string;
}

export interface IUser {
    method: string; 
    address: string;
    email: string;
    telephone: number;
}

export interface IOrder {
    id: string;
    total: number;
}

export interface IProductsData {
    products: IProduct[];
    preview: string | null;
    fillProducts(products: IProduct[]): IProduct[];
    getProducts(productsId: string): IProduct;
}

export interface IOrderData {
    order: IOrder[];
    addProductOrder(product: IProduct): void;
    deleteProductOrder(productId: string): void;
    clearOrder(list: IOrder[]): void;
    getOrder(productId: string): IOrder[];
    checkValidation(data: IUser): boolean;
}