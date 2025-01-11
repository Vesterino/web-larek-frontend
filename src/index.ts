import './scss/styles.scss';
import { Api } from './components/base/api'
import { API_URL } from './utils/constants';
import { IItems, IOrder, IOrderData, IOrderForm, IProduct } from './types';
import { ProductData } from './components/ProductsData';
import { EventEmitter } from './components/base/events';
import { CatalogProduct, ModalProduct } from './components/Product';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { AppState, ProductItem } from './components/AppData';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new Api(API_URL)

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const appData = new AppState({}, events);

const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)

const basket = new Basket(cloneTemplate(basketTemplate), events);

const productsData = new ProductData(events)
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

api.get<IItems>('/product')
    .then(data => {
        productsData.products = data.items;
        console.log('Товары:', data.items);
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });

events.on('products:changed', () => {
    const productsArray = productsData.products.map((product) => {
        const productInstant = new CatalogProduct(cloneTemplate(cardTemplate), events);
        productInstant.containerElement.addEventListener('click', () => {
            appData.setPreview(product);
        })
        return productInstant.render(product);
    });

    page.catalog = productsArray;
})

// Открытие корзины
events.on('basket:open', () => {
    modal.content = basket.containerElement;

    basket.render();
    modal.open();
})

events.on('formErrors:change', (errors: Partial<IOrder>) => {
    const { method, address, email, phone } = errors;
    order.valid = !method && !address && !email && !phone;
    order.errors = Object.values({method, address, email, phone}).filter(i => !!i).join('; ');
});

events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
})

events.on('order:open', () => {
    modal.render({
        content: order.render({
            method: undefined,
            address: '',
            valid: false,
            errors: []
        })
    })
})

events.on('contacts:open', () => {
    modal.render({
        content: contacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    })
})

events.on('preview:changed', (item: ProductItem) => {
        if (!item) {
            modal.close();
            return;
        }

        api.get<ModalProduct>(`/product/${item.id}`)
        .then((result) => {
            const modalCard = new ModalProduct(cloneTemplate(cardPreviewTemplate), events)

            modalCard.productCategory = result.category;
            modalCard.productTitle = result.title;
            modalCard.productImage = result.image;
            modalCard.productPrice = result.price;
            modalCard.productDescription = result.description;

            modalCard.render({
                category: item.category,
                title: item.title,
                image: item.image,
                price: item.price,
                description: item.description,
            });

            modal.render({
                content: modalCard.containerElement
            })
        })
        .catch((error) => {
            console.error('Error loading product data:', error);
            modal.close();
        })
    }
)

// Блокирование прокрутки при модальном окне
events.on('modal:open', () => {
    page.locked = true;
})

// Разблокирование прокрутки после модального окна
events.on('modal:close', () => {
    page.locked = false;
})