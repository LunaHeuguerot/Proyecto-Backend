import express from 'express';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import config from './config/config.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(config.PORT, () => {
    console.log(`Server listening on port ${config.PORT}`)
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.use('/static', express.static(`${config.DIRNAME}/public`));