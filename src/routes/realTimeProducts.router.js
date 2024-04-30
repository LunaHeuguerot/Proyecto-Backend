import express from 'express';
import { ProductManager } from '../managers/ProductManager.js';

const realTimeRouter = express.Router();

realTimeRouter.get('/realtimeproducts', async(req, res) => {
    try {
        const products = await ProductManager.getInstance().getProducts();
        res.render('realTimeProducts', { title: 'REAL TIME PRODUCTS', products: products });
    } catch (error) {
        console.error('Error al obtener los productos en tiempo real', error);
        res.status(500).send('Error interno del servidor');
    }
});

realTimeRouter.post('/realtimeproducts', async(req, res) => {
    try {
        const newProduct = req.body;
        await ProductManager.getInstance().addProduct(newProduct);

        const updatedProducts = await ProductManager.getInstance().getProducts();

        res.render('realTimeProducts', updatedProducts);

        res.status(200).json({ status: 'success', message: 'Product added successfully'});

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

realTimeRouter.delete('/realtimeproducts', async(req, res) => {
    try {
        const pId = parseInt(id);
        await ProductManager.getInstance().deleteProduct(pId);

        const updatedList = await ProductManager.getInstance().getProducts();
        res.render('realTimeProducts', updatedList);
        res.status(200).json({ status: 'success', message: `Product with id ${pId} deleted successfully` })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

export default realTimeRouter;