using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Dto
{
    public class SocialLoginUserDto
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Lastname { get; set; }
        [Required, RegularExpression("^(.+)@(.+)$")]
        public string Email { get; set; }
        [Required]
        public string PhotoUrl { get; set; }
        [Required]
        public string Provider { get; set; }
        [Required]
        public string Id { get; set; }
    }
}
