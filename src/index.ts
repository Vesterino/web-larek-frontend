import './scss/styles.scss';
import { Api } from './components/base/api'
import { API_URL } from './utils/constants';
import { IItems, IProduct } from './types';
import { ProductData } from './components/ProductsData';
import { EventEmitter } from './components/base/events';
import { Product } from './components/Product';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { AppState, ProductItem } from './components/AppData';
import { Basket } from './components/common/Basket';

const events = new EventEmitter();
const api = new Api(API_URL)

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');

const appData = new AppState({}, events);

const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)

const cardPreview = new Product(cloneTemplate(cardPreviewTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);

const productsData = new ProductData(events)


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
        const productInstant = new Product(cloneTemplate(cardTemplate), events);
        return productInstant.render(product);
    });

    page.catalog = productsArray;
})

// Открытие корзиы
events.on('basket:open', () => {
    modal.content = basket.containerElement;

    basket.render();
    modal.open();
})

// Блокирование прокрутки при модальном окне
events.on('modal:open', () => {
    page.locked = true;
})

// Разблокирование прокрутки после модального окна
events.on('modal:close', () => {
    page.locked = false;
})