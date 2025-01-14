import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";
import { AppState } from "./AppData";

export class Order extends Form<IOrderForm> {
    protected _selectedMethod: 'card' | 'cash' | undefined;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents, private appData: AppState) {
        super(container, events);
        this.init();

        this._button = container.querySelector('.order__button');

            this._button.addEventListener('click', () => {
                events.emit('contacts:open');
            });
    }

    init() {
        const methodButtons = this.container.querySelectorAll('.button_alt') as NodeListOf<HTMLButtonElement>
        methodButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.onMethodButtonClick(button);
            });
        });
    }

    onMethodButtonClick(button: HTMLButtonElement) {
        const value = button.getAttribute('name') as 'card' | 'cash';

        if (this._selectedMethod === value) return;

        this._selectedMethod = value;
        this.appData.setOrderField('method', value);
        this.appData.validateOrder();

        this.container.querySelectorAll('.button_alt').forEach((button) => button.classList.remove('button_alt-active'));
        button.classList.add('button_alt-active');
    }


    set method(value: 'card' | 'cash') {
        this._selectedMethod = value;

        this.container.querySelectorAll('.button_alt').forEach((button) => button.classList.remove('button_alt-active'));

        const selectedButton = this.container.querySelector(`[name="${value}"]`) as HTMLButtonElement;
        if (selectedButton) {
            selectedButton.classList.add('button_alt-active');
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    get method(): 'card' | 'cash' | undefined {
        return this._selectedMethod;
    }
}