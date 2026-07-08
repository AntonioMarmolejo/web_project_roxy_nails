import Order from '../models/Order.js'
import Product from '../models/Product.js'

// POST /orders
export const createOrder = async (req, res, next) => {
    try {
        const { items, client, notes } = req.body

        if (!items?.length) return res.status(400).json({ message: 'El pedido no tiene productos.' })

        let total = 0
        const orderItems = []

        for (const { product: productId, qty } of items) {
            const product = await Product.findById(productId)
            if (!product || !product.active)
                return res.status(400).json({ message: `Producto no disponible.` })
            if (product.stock < qty)
                return res.status(400).json({ message: `Stock insuficiente para "${product.name}".` })

            total += product.price * qty
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty,
            })
        }

        // Descontar stock
        await Promise.all(
            items.map(({ product: id, qty }) =>
                Product.findByIdAndUpdate(id, { $inc: { stock: -qty } })
            )
        )

        const order = await Order.create({
            items: orderItems,
            total: Math.round(total * 100) / 100,
            client,
            notes,
            createdBy: req.user?._id,
        })

        res.status(201).json(order)
    } catch (err) { next(err) }
}

// GET /orders/my  — pedidos del usuario logueado
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ createdBy: req.user._id }).sort('-createdAt')
        res.json(orders)
    } catch (err) { next(err) }
}

// GET /orders  — admin
export const getAllOrders = async (req, res, next) => {
    try {
        const filter = {}
        if (req.query.status) filter.status = req.query.status
        const orders = await Order.find(filter).sort('-createdAt')
        res.json(orders)
    } catch (err) { next(err) }
}

// PATCH /orders/:id  — admin actualiza status
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
        if (!order) return res.status(404).json({ message: 'Pedido no encontrado.' })
        res.json(order)
    } catch (err) { next(err) }
}
