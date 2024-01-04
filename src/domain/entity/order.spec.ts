import Order from "./order";
import OrderItem from "./order_item";

describe("Order init tests", () => {
    it("should throw error when id is empty", () => {
        expect(() => {
            let order = new Order("", "123", []);
        }).toThrow("Id is required")
    });

    it("should throw error when customerId is empty", () => {
        expect(() => {
            let order = new Order("123", "", []);
        }).toThrow("CustomerId is required")
    });

    it("should throw error when customerId is empty", () => {
        expect(() => {
            let order = new Order("123", "123", []);
        }).toThrow("Items are required");
    });

    it("should calculate total", () => {
        let item1 = new OrderItem("i1", "Item 1", 100, "p1", 2);
        let item2 = new OrderItem("i2", "Item 2", 200, "p2", 2);
        const order = new Order("o1", "c1", [item1]);

        const total = order.total();

        expect(total).toBe(200);

        const order2 = new Order("o1", "c1", [item1, item2]);
        const total2 = order2.total();
        expect(total2).toBe(600);
    });

    it("should throw error if the item qte is less or equal 0", () => {
        expect(() => {
            let item1 = new OrderItem("i1", "Item 1", 100, "p1", 0);
            const order = new Order("o1", "c1", [item1]);
        }).toThrow("Quantity must be greater than 0")
    });
});