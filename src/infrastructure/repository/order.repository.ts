import Order from "../../domain/entity/order";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import { Op } from "sequelize";
import OrderItem from "../../domain/entity/order_item";

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

        await orderModel.update({
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total(),
        });

        const itemIdsToDelete = orderModel.items
            .filter(
                (item) => !entity.items.some((it) => it.id === item.id)
            ).map(
                (item) => item.id
            );
        
        await OrderItemModel.destroy({
            where: {
                id: { [Op.in]: itemIdsToDelete }
            }
        });

        const orderItemsUpdates = entity.items.map((item) => {
            if (orderModel.items.some(it => item.id === it.id)) {
                return OrderItemModel.update(
                    {
                        name: item.name,
                        price: item.price,
                        product_id: item.productId,
                        quantity: item.quantity,
                        order_id: entity.id,
                    },
                    {
                        where: {
                            id: item.id
                        }
                    }
                );
            }

            return OrderItemModel.create({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
                order_id: entity.id,
            });
        })

        await Promise.all(orderItemsUpdates);
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