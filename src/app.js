import express from 'express';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import config from './config/config.js';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import realTimeRouter from './routes/realTimeProducts.router.js';
import { ProductManager } from './managers/ProductManager.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${config.DIRNAME}/public`))

//HANDLEBARS
app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

//RUTAS
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/", realTimeRouter)

app.use('/static', express.static(`${config.DIRNAME}/public`));

//SERVER CON WEBSOCKETS
const httpServer = app.listen(config.PORT, () => {
    console.log(`Server listening on port ${config.PORT}`)
});

const socketServer = new Server(httpServer);
app.set('socketServer', socketServer);

app.get('/', async (req, res) => {
    try {
        const products = await ProductManager.getInstance().getProducts();

        res.render('home', { title: 'Home', products: products });

    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

socketServer.on('connection', async (socket) => {
    console.log("Nueva conexión");

    try {
        const products = await ProductManager.getInstance().getProducts();
        socketServer.emit('products', products)
    } catch (error) {
        socketServer.emit('response', { status: 'error', message: error.message });
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

            await ProductManager.getInstance().addProduct(newProd);
            const updatedList = await ProductManager.getInstance().getProducts();
            socketServer.emit('products', updatedList);
            socketServer.emit('response', { status: 'success', message: `Product added successfully` })
        } catch (error) {
            socketServer.emit('response', { status: 'error', message: error.message });
        }
    });

    socket.on('delete-product', async (id) => {
        try {
            const pId = parseInt(id);
            await ProductManager.getInstance().deleteProduct(pId);
            const updatedList = await ProductManager.getInstance().getProducts();
            console.log(`Product with id ${pId} successfully deleted`);
            socketServer.emit('products', updatedList);
        } catch (error) {
            socketServer.emit('response', { status: 'error', message: error.message });
        }
    });
});

