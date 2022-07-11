using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int ConsumerId { get; set; }
        public int DelivererId { get; set; }
        public int ProductId { get; set; }
        public string Accepted { get; set; }
        public string Delivered { get; set; }
        public string ProductName { get; set; }

        public int Quantity { get; set; }

        public string DeliveryAddress { get; set; }
        public string Comment { get; set; }
        public int Price { get; set; }
    }
}
