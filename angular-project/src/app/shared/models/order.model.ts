export class Order {
    id: number = 0;
    buyerEmail: string = "";
    deliveryEmail: string = "";
    productsInOrder: ProductsInOrder[] = [];
    address: string = "";
    comment: string = "";
    price: number = 0;
    orderTime: string = "";
    deliveryTime: string = "";
}

export class ProductsInOrder{
    productId:number = 0;
    quantity:number = 0;

    constructor(public p:number, public q:number) {
        this.productId = p;
        this.quantity = q;
    }
}

class Product{
    id:number = 0;
    name:string = "";
    price:number = -1;
    ingredients:string = "";
}