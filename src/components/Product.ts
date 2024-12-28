import { IProduct } from "../types";
import { CDN_URL } from "../utils/constants";
import { ensureElement, isEmpty } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/events";

interface IProductActions {
    onClick: (event: MouseEvent) => void;
}

export class Product extends Component<IProduct> {
    protected events: IEvents;
    protected _product: HTMLTemplateElement;
    protected _productCategory: HTMLElement;
    protected _productTitle: HTMLElement;
    protected _productImage: HTMLImageElement;
    protected _productPrice: HTMLElement;
    protected _productDescription: HTMLElement;
    protected productId: string;

    constructor(protected container: HTMLElement, events: IEvents ) {
        super(container);
        this.events = events;

        this._productCategory = ensureElement<HTMLElement>('.card__category', container);
        this._productTitle = ensureElement<HTMLElement>('.card__title', container);
        this._productImage = ensureElement<HTMLImageElement>('.card__image', container);
        this._productPrice = ensureElement<HTMLElement>('.card__price', container);

        this.container.addEventListener('click', () => {
            this.events.emit('product:select', { product: this })
        })
    }
    
    set productCategory(value: string) {
        this.setText(this._productCategory, value)

    switch (value) {
        case 'софт-скил':
            this._productCategory.classList.add('card__category_soft');
            break;
        case 'хард-скил':
            this._productCategory.classList.add('card__category_hard');
            break;
        case 'другое':
            this._productCategory.classList.add('card__category_other');
            break;
        case 'дополнительное':
            this._productCategory.classList.add('card__category_additional')
            break;
        case 'кнопка':
            this._productCategory.classList.add('card__category_button');
            break;
        default:
            this._productCategory.classList.add('card__category')
        }
    }

    set productTitle(value: string) {
        this.setText(this._productTitle, value)
    }

    set productImage(value: string) {
        this.setImage(this._productImage, `${CDN_URL}${value}`, this.productTitle)
    }

    set productPrice(value: number) {
        if (isEmpty(value)) {
            this.setText(this._productPrice, 'Бесценно')
        } else {
            this.setText(this._productPrice, `${value} синапсов`);
        }
    }

    set productDescription(value: string) {
        this.setText(this._productDescription, value);
    }

    render(productData: Partial<IProduct>): HTMLElement {
        this.productCategory = productData.category;
        this.productTitle = productData.title;
        this.productImage = productData.image;
        this.productPrice = productData.price;
        this.productDescription = productData.description;

        return this.container;
    }
}