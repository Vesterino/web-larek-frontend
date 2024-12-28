import './scss/styles.scss';
import { Api } from './components/base/api'
import { API_URL } from './utils/constants';
import { IItems, IProduct } from './types';
import { ProductData } from './components/ProductsData';
import { EventEmitter } from './components/base/events';
import { Product } from './components/Product';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';

const events = new EventEmitter();
const api = new Api(API_URL)

const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)

const productsData = new ProductData(events)

const cardTemplate: HTMLTemplateElement = document.querySelector('#card-catalog')


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
        const productInstant = new Product(cloneTemplate(cardTemplate), events); // мэйби здесь
        return productInstant.render(product);
    });

    page.catalog = productsArray;
})

events.on('product:select', (data: { product: Product }) => {
    const { product } = data;
    const {}
})


