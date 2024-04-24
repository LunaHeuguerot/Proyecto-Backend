import fs from 'fs';
import config from '../config/config.js';
import { ProductManager } from './ProductManager.js';

export class CartsManager {
    static #instance;

    constructor() {
        this.carts = [];
        this.path = `${config.DIRNAME}/data/carts.json`;
    }

    static getInstance(){
        if(!CartsManager.#instance){
            CartsManager.#instance = new CartsManager();
        }
        return CartsManager.#instance;
    }

    async createCart(){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);
            const newCart = {
                id: this.carts.length !== 0 ? this.carts[this.carts.length - 1].id + 1 : 1,
                products: []
            }

            this.carts.push(newCart);

            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return newCart;
        } catch (error) {
            throw error;
        }
    }

    async getCartById(id){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);
            const cart = this.carts.find(cart => parseInt(cart.id) === parseInt(id));

            if(!cart){
                throw new Error(`No se encontró el carrito con id ${id}`);
            }

            console.log('Contenido del carrito:');
            console.log(cart.products)
            return cart.products;
        } catch (error) {
            throw error;
        }
    }

    async addProdToCart(cid, pid){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);
            const cartIndex = this.carts.findIndex(cart => parseInt(cart.id) === parseInt(cid));
            console.log(response);
            console.log(cartIndex);
    
            if(cartIndex === -1){
                throw new Error(`No se encontró el carrito con id ${cid}`);
            }
    
            const cart = this.carts[cartIndex];
    
            await ProductManager.getInstance().getProductById(pid);
            const product = cart.products.find(product => product.productId === pid);
    
            if(!product){
                cart.products.push({
                    productId: pid,
                    quantity: 1
                })
            } else {
                product.quantity++;
            }
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            
            return cart;
        } catch (error) {
            throw error;
        }
    }
    

    async deleteProdFromCart(cid, pid){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
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

            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return cart;
        } catch (error) {
            throw error;
        }
    }
}