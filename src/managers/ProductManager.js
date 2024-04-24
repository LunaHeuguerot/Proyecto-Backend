import fs from 'fs';
import config from '../config/config.js';

export class ProductManager {
    static #instance;

    constructor(){
        this.products = [];
        this.path = `${config.DIRNAME}/data/products.json`;
    };

    static getInstance(){
        if(!ProductManager.#instance){
            ProductManager.#instance = new ProductManager();
        }

        return ProductManager.#instance;
    };

    setId(){
        this.lastId = this.getLastId();
        if(this.lastId === 0){
            this.lastId = 1
        } else {
            this.lastId++
        }

        return this.lastId;
    }

    getLastId(){
        if(this.products.length === 0) return 0;
        const lastProductId = this.products[this.products.length - 1].id;
        console.log(`El ultimo id es: ${lastProductId}`);
        return lastProductId;
    }

    async addProduct(product){
        await this.getProducts();
        const { title, description, price, thumbnail, code, status = true, stock } = product;

        if(!title || !description || !price || !thumbnail || !code || !status || !stock){
            console.log('Todos los campos son obligatorios');
            return;
        }

        if(this.products.some((p) => p.code === code)){
            console.log('El código del producto ya existe');
            return;
        }

        const id = this.setId();
        this.products.push({ id, ...product });

        const data = JSON.stringify(this.products, null, 2);

        try {
            await fs.promises.writeFile(this.path, data);
            console.log('Datos guardados exitosamente');
        } catch (error) {
            console.error('Error al escribir el archivo', error);
        }
    }

    async getProducts(){
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
            console.log('Archivo leído exitosamente');
            return this.products
        } catch (error) {
            if(error.code === 'ENOENT'){
                console.error('El archivo no existe');
            } else {
                console.error('Error al leer el archivo', error);
            }
        }

        return this.products;
    }

    async getProductById(id){
        await this.getProducts();
        const product = this.products.find((p) => p.id === id);

        if(product === undefined){
            console.log(`El producto con el id ${id} no existe`);
        } else {
            return product;
        }
    }

    async updateProduct(id, updatedProduct){
        try {
            await this.getProducts();

            console.log("Lista de productos:", this.products);
            console.log("ID del producto a actualizar:", id);

            const existingProductIndex = this.products.findIndex(p => parseInt(p.id) === parseInt(id));

            if(existingProductIndex === -1) {
                console.error(`El producto con id ${id} no existe`);
                return;
            }

            this.products[existingProductIndex] = { id, ...updatedProduct };

            await fs.promises.writeFile(this.path, JSON.stringify(this.products));
            console.log('Producto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar el producto', error);
        }
    }

    async deleteProduct(id){
        try {
            await this.getProducts();
    
            const existingProductIndex = this.products.findIndex(p => parseInt(p.id) === parseInt(id));
            if(existingProductIndex === -1) {
                console.error(`El producto con el id ${id} no existe`);
                return;
            }
    
            this.products.splice(existingProductIndex, 1);

            await fs.promises.writeFile(this.path, JSON.stringify(this.products));
            console.log('Producto borrado exitosamente');
        } catch (error) {
            console.error('Error al borrar el producto', error);
        }
    }
    
}

