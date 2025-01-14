import { IProduct } from "../types";
import { CDN_URL } from "../utils/constants";
import { ensureElement, isEmpty } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/events";

interface IProductActions {
    onClick: (event: MouseEvent) => void;
}

export class CatalogProduct extends Component<IProduct> {
    protected events: IEvents;
    containerElement: HTMLElement;

    protected _category: HTMLElement;
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;

    constructor(protected container: HTMLElement, events: IEvents ) {
        super(container);
        this.containerElement = container;
        this.events = events;

        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
    }
    
    set productCategory(value: string) {
        this.setText(this._category, value)

    switch (value) {
        case 'софт-скил':
            this._category.classList.add('card__category_soft');
            break;
        case 'хард-скил':
            this._category.classList.add('card__category_hard');
            break;
        case 'другое':
            this._category.classList.add('card__category_other');
            break;
        case 'дополнительное':
            this._category.classList.add('card__category_additional')
            break;
        case 'кнопка':
            this._category.classList.add('card__category_button');
            break;
        default:
            this._category.classList.add('card__category')
        }
    }

    set productTitle(value: string) {
        this.setText(this._title, value)
    }

    set productImage(value: string) {
        this.setImage(this._image, `${CDN_URL}${value}`, this.productTitle)
    }

    set productPrice(value: number) {
        if (isEmpty(value)) {
            this.setText(this._price, 'Бесценно')
        } else {
            this.setText(this._price, `${value} синапсов`);
        }
    }

    render(productData: Partial<IProduct>): HTMLElement {
        this.productCategory = productData.category;
        this.productTitle = productData.title;
        this.productImage = productData.image;
        this.productPrice = productData.price;

        return this.containerElement;
    }
}

export class ModalProduct extends Component<IProduct> {
    protected events: IEvents;
    containerElement: HTMLElement;

    protected _category: HTMLElement;
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _description: HTMLElement;
    
    category: string;
    title: string;
    image: string;
    price: number;
    description: string;
    id: string;

    constructor(protected container: HTMLElement, events: IEvents, actions?: IProductActions ) {
        super(container);
        this.containerElement = container;
        this.events = events;

        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', container);
        this._description = ensureElement<HTMLElement>('.card__text', container);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set productCategory(value: string) {
        this._category.classList.remove(
            'card__category_other',
        );
        
        this.setText(this._category, value)

    switch (value) {
        case 'софт-скил':
            this._category.classList.add('card__category_soft');
            break;
        case 'хард-скил':
            this._category.classList.add('card__category_hard');
            break;
        case 'другое':
            this._category.classList.add('card__category_other');
            break;
        case 'дополнительное':
            this._category.classList.add('card__category_additional')
            break;
        case 'кнопка':
            this._category.classList.add('card__category_button');
            break;
        default:
            this._category.classList.add('card__category')
        }
    }

    set productTitle(value: string) {
        this.setText(this._title, value)
    }

    set productImage(value: string) {
        this.setImage(this._image, `${CDN_URL}${value}`, this.productTitle)
    }

    set productPrice(value: number) {
        if (isEmpty(value)) {
            this.setText(this._price, 'Бесценно')
            this._button.disabled = true;
        } else {
            this.setText(this._price, `${value} синапсов`);
        }
    }

    set productDescription(value: string) {
        this.setText(this._description, value);
    }

    render(productData: Partial<IProduct>): HTMLElement {
        this.productCategory = productData.category;
        this.productTitle = productData.title;
        this.productImage = productData.image;
        this.productPrice = productData.price;
        this.productDescription = productData.description;

        return this.containerElement;
    }
}



