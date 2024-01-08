import Address from "../../entity/address";
import Customer from "../../entity/customer";
import EventDispatcher from "../@shared/event-dispatcher";
import { AddressUpdatedEvent } from "./address-updated.event";
import CustomerCreatedEvent from "./customer-created.event";
import { SendMessageWhenAddressIsUpdatedHandler } from "./handler/send-message-when-address-is-updated.handler";
import SendMessageWhenCustomerIsCreated1Handler from "./handler/send-message-when-customer-is-created-1.handler";
import SendMessageWhenCustomerIsCreated2Handler from "./handler/send-message-when-customer-is-created-2.handler";

describe("Customer Events unit tests", () => {
    it("should notify when customer is created", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler1 = new SendMessageWhenCustomerIsCreated1Handler();
        const eventHandler2 = new SendMessageWhenCustomerIsCreated2Handler();
        const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
        const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

        eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
        eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandler1);
        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandler2);

        const customerCreatedEvent = new CustomerCreatedEvent({
            id: "123",
            name: "Customer 1",
            address: {
                street: "Rua 1",
                number: 10,
                zipcode: "12345-67",
                city: "Goiânia"
            }
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHandler1).toHaveBeenCalled();
        expect(spyEventHandler2).toHaveBeenCalled();
    });

    it("should notify when customer's address is updated", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendMessageWhenAddressIsUpdatedHandler();

        eventDispatcher.register("AddressUpdatedEvent", eventHandler);

        const customer = new Customer("1", "Customer 1");
        const address = new Address("Rua 1", 10, "12345-67", "Goiânia");
        customer.changeAddress(address);

        expect(eventDispatcher.getEventHandlers["AddressUpdatedEvent"][0]).toMatchObject(eventHandler);

        const addressUpdatedEvent = new AddressUpdatedEvent({
            id: customer.id,
            name: customer.name,
            address: {
                street: customer.address.street,
                number: customer.address.number,
                zipcode: customer.address.zip,
                city: customer.address.city,
            },
        });

        eventDispatcher.notify(addressUpdatedEvent);
    });
});