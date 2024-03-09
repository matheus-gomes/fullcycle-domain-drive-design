import Order from "../entity/order";
import RepositoryInterface from "../../@shared/event/repository/repository-interface";

export default interface OrderRepositoryInterface extends RepositoryInterface<Order> {}