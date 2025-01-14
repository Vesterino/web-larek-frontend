import './scss/styles.scss';
import { Api } from './components/base/api'
import { API_URL } from './utils/constants';
import { IContactsForm, IItems, IOrder, IOrderData, IOrderForm, IProduct } from './types';
import { ProductData } from './components/ProductsData';
import { EventEmitter } from './components/base/events';
import { CatalogProduct, ModalProduct } from './components/Product';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { AppState, ProductItem } from './components/AppData';
import { Basket, BasketItem } from './components/common/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new Api(API_URL)

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const appData = new AppState({}, events);

const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)

const basket = new Basket(cloneTemplate(basketTemplate), events);

const productsData = new ProductData(events)
const order = new Order(cloneTemplate(orderTemplate), events, appData);
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
    page.counter = appData.getCatalog.length;
})

// Открытие корзины
events.on('basket:open', () => {
    modal.content = basket.containerElement;

    basket.render();
    modal.open();
})

events.on('formErrors:change', (errors: Partial<IOrder> & Partial<IContactsForm>) => {
    const { method, address, email, phone } = errors;
    
    const isOrderValid = !method && !address;
    const orderErrors = Object.values({address}).filter(i => !!i).join('; ');
    
    const isContactsValid = !email && !phone;
    const contactsError = Object.values({email, phone}).filter(i => !!i).join('; ');

    order.valid = isOrderValid;
    order.errors = orderErrors;

    contacts.valid = isContactsValid;
    contacts.errors = contactsError;
});

events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);

    appData.validateOrder();
})

events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
    appData.setContactsField(data.field, data.value);

    appData.validateContacts();
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
            const modalCard = new ModalProduct(cloneTemplate(cardPreviewTemplate), events, {
                onClick: () => {
                    appData.addToBasket(result);
                    events.emit('basket:changed');
                    modal.close();
                }
            })

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

// events.on('basket:changed', () => {
//     const basketItems = appData.getBasket();

//     basket.items = basketItems.map((item, index) => {
//         const template = productBasket;
//         const element = template.content.cloneNode(true) as HTMLElement;

//         const productBasketIndex = element.querySelector('.basket__item-index');
//         const productBasketTitle = element.querySelector('.card__title');
//         const productBasketPrice = element.querySelector('.card__price');
//         const deleteBasketButton = element.querySelector('.basket__item-delete');
        
//         productBasketIndex.textContent = `${index + 1}`;
//         productBasketTitle.textContent = item.title;
//         productBasketPrice.textContent = `${item.price} синапсов`;

//         deleteBasketButton.addEventListener('click', () => {
//             appData.removeIsBasket(item);
//             events.emit('basket:changed');
//         })
//         return element;
//         })

//         const total = basketItems.reduce((sum, item) => sum + item.price, 0);

//         basket.availability = basketItems.map(item => item.id);
//         basket.total = total;
//         page.counter = basketItems.length;
//     })

events.on('basket:changed', () => {
    const basketItems = appData.getBasket();

    basket.items = basketItems.map((item, index) => {
        const basketItem = new BasketItem(cloneTemplate(productBasket), events)

        const element = basketItem.render({
            index: index + 1,
            title: item.title,
            price: item.price,
        })

        const deleteButtonItem = element.querySelector('.basket__item-delete');

        deleteButtonItem.addEventListener('click', () => {
            appData.removeIsBasket(item.id);
            events.emit('basket:changed');
        })
        
        return element;
    });

    basket.availability = basketItems.map(item => item.id);
    basket.total = basketItems.reduce((sum, item) => sum + item.price, 0);
    page.counter = basketItems.length;
})

// Блокирование прокрутки при модальном окне
events.on('modal:open', () => {
    page.locked = true;
})

// Разблокирование прокрутки после модального окна
events.on('modal:close', () => {
    page.locked = false;
})