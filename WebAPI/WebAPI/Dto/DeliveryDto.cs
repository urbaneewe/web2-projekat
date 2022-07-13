using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Dto
{
    public class DeliveryDto
    {
        [Required, RegularExpression("^(.+)@(.+)$")]
        public string Email { get; set; }
        [Required]
        public Status Status { get; set; }
    }
}
