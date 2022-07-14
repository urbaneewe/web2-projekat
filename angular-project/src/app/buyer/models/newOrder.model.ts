export class NewOrder{
    buyerEmail:string = "";
    productsInOrder:ProductInNewOrder[] = [];
    address:string = "";
    comment:string = "";
}

export class ProductInNewOrder{
    id:number = 0;
    productId:number = 0;
    quantity:number = 0;

    constructor(public _id:number, public _productId:number, public _quantity:number){
        this.id = _id;
        this.productId = _productId;
        this.quantity = _quantity;
    }
}