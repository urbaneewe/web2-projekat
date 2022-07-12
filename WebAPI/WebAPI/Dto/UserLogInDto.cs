using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Dto
{
    public class UserLogInDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
