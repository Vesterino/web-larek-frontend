import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";
import { AppState } from "./AppData";

export class Order extends Form<IOrderForm> {
    protected _selectedMethod: 'card' | 'cash' | undefined;
    protected _button: HTMLButtonElement;
    protected _methodButtons: NodeListOf<HTMLButtonElement>;

    constructor(container: HTMLFormElement, events: IEvents, private appData: AppState) {
        super(container, events);
        this._methodButtons = container.querySelectorAll('.button_alt');

        this.init();

        this._button = container.querySelector('.order__button');

        this._button.addEventListener('click', () => {
            events.emit('contacts:open');
        });
    }

    init() {
        this._methodButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.onMethodButtonClick(button);
            });
        });
    }

    onMethodButtonClick(button: HTMLButtonElement) {
        const value = button.getAttribute('name') as 'card' | 'cash';

        if (this._selectedMethod === value) return;

        this._selectedMethod = value;
        this.appData.setOrderField('payment', value);
        this.appData.validateOrder();

        this._methodButtons.forEach((btn) => this.toggleClass(btn, 'button_alt-active', btn === button));
    }

    set method(value: 'card' | 'cash') {
        this._selectedMethod = value;

        this._methodButtons.forEach((button) => this.toggleClass(button, 'button_alt-active', false));

        const selectedButton = this.container.querySelector(`[name="${value}"]`) as HTMLButtonElement;
        if (selectedButton) {
            this.toggleClass(selectedButton, 'button_alt-active', true);
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    get method(): 'card' | 'cash' | undefined {
        return this._selectedMethod;
    }
}