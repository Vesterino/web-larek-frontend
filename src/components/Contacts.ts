import { IContactsForm } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Contacts extends Form<IContactsForm> {

    protected _button: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._button = container.querySelector('.contacts__button');

        this._button.addEventListener('click', () => {
            events.emit('order:submit')
        })
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}