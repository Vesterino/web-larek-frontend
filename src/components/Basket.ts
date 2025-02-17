import { createElement, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { EventEmitter, IEvents } from "./base/events";
import { AppState } from "./AppData";

interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

interface IBasketActions {
    onClick: (event: MouseEvent) => void;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
        this.availability = [];
    }

    get containerElement(): HTMLElement {
        return this.container;
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
        }
    }

    set availability(items: string[]) {
            this.setDisabled(this._button, !items.length);
    }

    set total(value: number) {
        if (this._total) {
            if (value > 0) {
                this.setText(this._total, `${value} синапсов`);
            } else {
                this.setText(this._total, '0 синапсов');
            }
        }
    }

    get total() {
        return this.total;
    }
}

export interface IBasketItem {
    index: number;
    title: string;
    price: number;
}

export class BasketItem extends Component<IBasketItem> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, private events: EventEmitter, actions?: IBasketActions) {
        super(container);

        this._index = container.querySelector('.basket__item-index');
        this._title = container.querySelector('.card__title');
        this._price = container.querySelector('.card__price');
        this._button = container.querySelector('.basket__item-delete');

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    render(item: IBasketItem): HTMLElement {

        this.setText(this._index, String(item.index));
        this.setText(this._title, item.title);
        this.setText(this._price, `${item.price} синапсов`);

        return this.container;
        }
    }