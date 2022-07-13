using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Dto
{
    public class OrderDto
    {
        public long Id { get; set; }
        public string BuyerEmail { get; set; }
        public string DeliveryEmail { get; set; }
        public List<ProductInOrderDto> ProductsInOrder { get; set; }
        public string Address { get; set; }
        public string Comment { get; set; }
        public float Price { get; set; }
        public DateTime OrderTime { get; set; }
        public DateTime DeliveryTime { get; set; }
    }
}
