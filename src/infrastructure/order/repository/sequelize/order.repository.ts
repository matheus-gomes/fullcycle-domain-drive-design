import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import { Op } from "sequelize";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                include: [{ model: OrderItemModel }],
            }
        );
    }

    async update(entity: Order): Promise<void> {
        const orderModel = await OrderModel.findOne(
            {
                where: { id: entity.id},
                include: ["items"]
            },
        );

        await OrderItemModel.destroy({
            where: {
                order_id: entity.id,
            }
        })

        await orderModel.update({
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total(),
        });

        const itemsToAdd = entity.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
            order_id: entity.id,
        }));

        await OrderItemModel.bulkCreate(itemsToAdd);
    }

    async find(id: string): Promise<Order> {
        let orderModel;

        try {
            orderModel = await OrderModel.findOne({
                where: { id },
                include: ["items"],
            });
        } catch(error) {
            throw new Error("Order not found");
        }

        const orderItems: OrderItem[] = orderModel.items.map((item) => {
            return new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity
            )
        });

        const order = new Order(
            orderModel.id,
            orderModel.customer_id,
            orderItems
        );

        return order;
    }

    async findAll(): Promise<Order[]> {
        const orders = await OrderModel.findAll({
            include: [
                { model: OrderItemModel }
            ]
        });

        return orders.map((order) => {
            const items = order.items.map((item) => {
                return new OrderItem(
                    item.id,
                    item.name,
                    item.price,
                    item.product_id,
                    item.quantity
                );
            });

            return new Order(
                order.id,
                order.customer_id,
                items
            );
        });
    }
}