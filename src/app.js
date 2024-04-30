import express from 'express';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import config from './config/config.js';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import router from './routes/realTimeProducts.router.js';
import { ProductManager } from './managers/ProductManager.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//HANDLEBARS
app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

//RUTAS
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/realtimeproducts', router);

app.use('/static', express.static(`${config.DIRNAME}/public`));

//SERVER CON WEBSOCKETS
const httpServer = app.listen(config.PORT, () => {
    console.log(`Server listening on port ${config.PORT}`)
});

const io = new Server(httpServer);

app.get('/', async(req, res) => {
    try {
        const products = await ProductManager.getInstance().getProducts();

        res.render('home', { Title: 'Home', products: products });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

io.on('connection', async (socket) => {
    console.log("Nueva conexión");

    try {
        const products = await ProductManager.getInstance().getProducts();
        io.emit('products', products)
    } catch (error) {
        io.emit('response', { status: 'error', message: error.message });
    };

    socket.on('new-product', async (newProduct) => {
        try {
            const newProd = {
                title: newProduct.title,
                description: newProduct.description,
                code: newProduct.code,
                price: newProduct.price,
                status: newProduct.status,
                stock: newProduct.stock,
                category: newProduct.category,
                thumbnail: newProduct.thumbnail,
            }

            const pushedProd = await ProductManager.getInstance().addProduct(newProd);
            const pushedId = pushedProd.id;
            const updatedList = await ProductManager.getInstance().getProducts();
            io.emit('products', updatedList);
            io.emit('response', { status: 'success', message: `Product with ID ${pushedId} successfully added`});
        } catch (error) {
            io.emit('response', { status: 'error', message: error.message });
        }
    });

    socket.on('delete-product', async (id) => {
        try {
            const pId = parseInt(id);
            await ProductManager.getInstance().deleteProduct(pId);
            const updatedList = await ProductManager.getInstance().getProducts();
            io.emit('products', updatedList);
            io.emit('response', { status: 'success', message: `Product with ID ${pId} successfully deleted`})
        } catch (error) {
            io.emit('response', { status: 'error', message: error.message });
        }
    });
});

