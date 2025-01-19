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
    protected _categoryColor = <Record<string, string>> {
        "софт-скил": "soft",
        "другое": "other",
        "дополнительное": "additional",
        "кнопка": "button",
        "хард-скил": "hard"
    }
    _button: HTMLButtonElement;

    constructor(protected container: HTMLElement, events: IEvents) {
        super(container);
        this.containerElement = container;
        this.events = events;

        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
    }

        set category(value: string) {
            Object.values(this._categoryColor).forEach((colorClass) => {
                this.toggleClass(this._category, `card__category_${colorClass}`, false)
            })

            this.setText(this._category, value)
            this.toggleClass(this._category, `card__category_${this._categoryColor[value]}`, true)
        }
    
        set title(value: string) {
            this.setText(this._title, value)
        }
    
        set image(value: string) {
            this.setImage(this._image, `${CDN_URL}${value}`, this.title)
        }
    
        set price(value: number) {
            if (isEmpty(value)) {
                this.setText(this._price, 'Бесценно')
                this.setDisabled(this._button, true);
            } else {
                this.setText(this._price, `${value} синапсов`);
            }
        }
    
        render(productData: Partial<IProduct>): HTMLElement {
            super.render(productData);
            return this.containerElement;
        }
    }

export class ModalProduct extends CatalogProduct {
    protected _description: HTMLElement;
    id: string;

    constructor(protected container: HTMLElement, events: IEvents, actions?: IProductActions) {
        super(container, events);

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

    set description(value: string) {
        this.setText(this._description, value);
    }

    render(productData: Partial<IProduct>): HTMLElement {
        super.render(productData);
        return this.containerElement;
    }
}



