import './scss/styles.scss';
import { Api } from './components/base/api'
import { API_URL, CDN_URL } from './utils/constants';
import { IContactsForm, IItems, IOrder, IOrderForm, IOrderResults, IProduct } from './types';
import { ProductData } from './components/ProductsData';
import { EventEmitter } from './components/base/events';
import { CatalogProduct, ModalProduct } from './components/Product';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { AppState, ProductItem } from './components/AppData';
import { Basket, BasketItem } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';
import { LarekAPI } from './components/LarekAPI';

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL)

// Шаблоны
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const productsData = new ProductData(events)
const order = new Order(cloneTemplate(orderTemplate), events, appData);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
    onClick: () => modal.close()
})

// Получение список товаров с сервера
api.get<IItems>('/product')
    .then(data => {
        productsData.products = data.items;
        console.log('Товары:', data.items);
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });

// Изменились товары в каталоге
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

// Отправка форм и заказа на сервер
events.on('order:submit', () => {
    const orderData = {
        ...appData.order,
        ...appData.contacts,
        items: appData.getBasket().map(item => item.id),
        total: appData.getBasketTotal(),
    }

    api.orderProducts(orderData)
        .then((result: IOrderResults) => {
                    appData.clearBasket();
                    events.emit('basket:changed');
            modal.render({
                content: success.render({
                    total: result.total
                })
            })
        })
        .catch(err => {
            console.error(err);
        })
    });

// Изменение валидации форм
events.on('formErrors:change', (errors: Partial<IOrder> & Partial<IContactsForm>) => {
    const { payment, address, email, phone } = errors;
    
    const isOrderValid = !payment && !address;
    const orderErrors = Object.values({payment, address}).filter(i => !!i).join('; ');
    
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

// Открытие модального окна выбора способа оплаты и ввода адреса доставки
events.on('order:open', () => {
    modal.render({
        content: order.render({
            payment: appData.order.payment,
            address: appData.order.address,
            valid: appData.validateOrder(),
            errors: []
        })
    })
})

// Открытие модального окна контактных данных
events.on('contacts:open', () => {
    modal.render({
        content: contacts.render({
            email: appData.contacts.email,
            phone: appData.contacts.phone,
            valid: appData.validateContacts(),
            errors: []
        })
    })
})

// Открытие модального окна с детальной информацией товара
events.on('preview:changed', (item: ProductItem) => {
        if (!item) {
            modal.close();
            return;
        }

        api.get<ModalProduct>(`/product/${item.id}`)
        .then((result) => {
            const modalCard = new ModalProduct(cloneTemplate(cardPreviewTemplate), events, { onClick: () => {
                    appData.addToBasket(result);
                    events.emit('basket:changed');
                    modal.close();
            }});

            const isInBasket = appData.getBasket().some((basketItem) => basketItem.id === result.id);

            if (isInBasket) {
                modalCard.disableButton();
                modalCard.setButtonText('В корзине');
            } else {
                modalCard.enableButton();
                modalCard.setButtonText('В корзину');
            };

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

// Изменение корзины при определенных действиях
events.on('basket:changed', () => {
    const basketItems = appData.getBasket();

    basket.items = basketItems.map((item, index) => {
        const basketItem = new BasketItem(cloneTemplate(productBasket), events, { onClick: () =>
            appData.removeIsBasket(item.id)
    })

        const element = basketItem.render({
            index: index + 1,
            title: item.title,
            price: item.price,
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