import fs from 'fs';
import path from 'path';
import config from '../config/config.js';
import { ProductManager } from './ProductManager.js';

const cartsFilePath = path.join(config.DIRNAME, '../data/carts.json');

export class CartsManager {
    static #instance;

    constructor() {
        this.carts = [];
    }

    static getInstance(){
        if(!CartsManager.#instance){
            CartsManager.#instance = new CartsManager();
        }
        return CartsManager.#instance;
    }

    async createCart(){
        try {
            const response = await fs.promises.readFile(cartsFilePath, 'utf-8');
            this.carts = JSON.parse(response);
            const cart = {
                id: this.carts.length !== 0 ? this.carts[this.carts.length - 1].id + 1 : 1,
                products: []
            }

            await fs.promises.writeFile(cartsFilePath, JSON.stringify(this.carts, null, '\t'));
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async getCartById(id){
        try {
            const response = await fs.promises.readFile(cartsFilePath, 'utf-8');
            this.carts = JSON.parse(response);
            const cart = this.carts.find(cart => cart.id === id);

            if(!cart){
                throw new Error(`No se encontró el carrito con id ${id}`);
            }

            return cart;
        } catch (error) {
            throw error;
        }
    }

    async addProdToCart(cid, pid){
        try {
            const response = await fs.promises.readFile(cartsFilePath, 'utf-8');
            this.carts = JSON.parse(response);
            const cart = this.carts.find(cart => cart.id === cid);

            if(!cart){
                throw new Error(`No se encontró el carrito con id ${cid}`);
            }

            await ProductManager.getProductById(pid);
            const product = cart.products.find(product => product.productId === pid);

            if(!product){
                cart.products.push({
                    productId: pid,
                    quantity: 1
                })
            } else {
                product.quantity++;
            }
            await fs.promises.writeFile(cartsFilePath, JSON.stringify(this.carts, null, '\t'));
            
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async deleteProdFromCart(cid, pid){
        try {
            const response = await fs.promises.readFile(cartsFilePath, 'utf-8');
            this.carts = JSON.parse(response);

            const cart = this.carts.find(cart => cart.id === cid);
            if(!cart){
                throw new Error(`No se encontró el carrito con id ${cid}`);
            }

            const product = cart.products.find(product => product.productId === pid);
            if(!product){
                throw new Error(`No se encontró el producto con id ${pid} en el carrito ${cid}`);
            }

            if(product.quantity > 1){
                product.quantity--;
            } else {
                const index = cart.products.indexOf(product);
                cart.products.splice(index, 1);
            }

            await fs.promises.writeFile(cartsFilePath, JSON.stringify(this.carts, null, '\t'));
            return cart;
        } catch (error) {
            throw error;
        }
    }
}