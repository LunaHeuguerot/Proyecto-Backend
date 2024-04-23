import express from 'express';
import { CartsManager } from '../managers/CartsManager.js';

const cartsRouter = express.Router();

cartsRouter.post('/', async(req, res) => {
    try {
        const cart = await CartsManager.getInstance().createCart();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.get('/:cid', async(req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManager.getInstance().getCartById(id);
        res.json({ status: 'success', payload: cart})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.post('/:cid/product/:pid', async(req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const cart = await CartsManager.getInstance().addProdToCart(cid, pid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.delete('/:cid/product/:pid', async(req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const cart = await CartsManager.getInstance().deleteProdFromCart(cid, pid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default cartsRouter;
