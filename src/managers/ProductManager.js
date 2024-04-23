import fs from 'fs/promises';
import config from '../config/config.js';
import path from 'path';

const productsFilePath = path.join(config.DIRNAME, '../data/products.json')

export class ProductManager {
    constructor(){
        this.products = [];
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
            await fs.writeFile(productsFilePath, data);
            console.log('Datos guardados exitosamente');
        } catch (error) {
            console.error('Error al escribir el archivo', error);
        }
    }

    async getProducts(){
        try {
            const data = await fs.readFile(productsFilePath, 'utf-8');
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
        await this.getProducts();

        if(this.products.find((p) => p.id === id) === undefined){
            console.error(`El producto con id ${id} no existe`);
            return;
        }

        const index = this.products.findIndex(p => p.id === id);
        this.products[index] = { id, ...updatedProduct };

        try {
            await fs.writeFile(productsFilePath, JSON.stringify(this.products));
            console.log('Archivo actualizado');
        } catch (error) {
            console.error('No se pudo actualizar el archivo', error);
        }
    }

    async deleteProduct(id){
        await this.getProducts();

        if(this.products.find((p) => p.id === id) === undefined){
            console.error(`El producto con el id ${id} no existe`);
            return;
        }

        const index = this.products.findIndex(p => p.id === id);

        this.products.splice(index, 1);

        try {
            await fs.writeFile(productsFilePath, JSON.stringify(this.products));
            console.log('Producto borrado exitosamente');
        } catch (error) {
            console.error('No se pudo borrar el archivo', error);
        }
    }
}

//Testing Functions

async function testAddProduct() {
    const productManager = new ProductManager();

  
    await productManager.addProduct({
        title: 'Title 5',
        description: 'Description 5',
        price: 123,
        thumbnail: 'No photo',
        code: 'yhn',
        stock: 35
    } );
}

async function testGetProducts() {
    const productManager = new ProductManager();
    const products = await productManager.getProducts();
    console.log(products);
}

async function testGetProductById(id) {
    const productManager = new ProductManager();
    try {
        await productManager.getProducts();
        const product = await productManager.getProductById(id); 
        if (product) {
            console.log("Producto encontrado:", product); 
        } else {
            console.log("No se encontró ningún producto con el ID dado.");
        }
    } catch (error) {
        console.error(error.message);
    }
}

async function testUpdateProduct(id, updatedProd) {
    const productManager = new ProductManager();
    try {
        await productManager.getProducts();
     
        await productManager.updateProduct(id, updatedProd);
        console.log("Producto actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
    }
}

async function testDeleteProduct() {
    const productManager = new ProductManager();
    try {
        await productManager.getProducts()
        await productManager.deleteProduct(2);
    } catch (error) {
        console.error(error.message);
    }
}