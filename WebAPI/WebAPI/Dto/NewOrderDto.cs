using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Dto
{
    public class NewOrderDto
    {
        public long Id { get; set; }
        [Required, RegularExpression("^(.+)@(.+)$")]
        public string BuyerEmail { get; set; }
        [Required, MinLength(1, ErrorMessage = "At least one item required in order")]
        public List<ProductInOrderDto> ProductsInOrder { get; set; }
        [Required]
        public string Address { get; set; }
        public string Comment { get; set; }
        public double Price { get; set; }
        [Required]
        public DateTime OrderTime { get; set; }
    }
}
