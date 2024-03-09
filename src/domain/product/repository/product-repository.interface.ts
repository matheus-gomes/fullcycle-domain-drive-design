import Product from "../entity/product";
import RepositoryInterface from "../../@shared/event/repository/repository-interface";

export default interface ProductRepositoryInterface extends RepositoryInterface<Product> {}