using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Dto
{
    public class OrderConfirmationDto
    {
        [Required]
        public long Id { get; set; }
        [Required, RegularExpression("^(.+)@(.+)$")]
        public string Email { get; set; }
    }
}
