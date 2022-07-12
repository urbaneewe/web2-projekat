using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public IActionResult Post([FromBody] UserLogInDto dto)
        {
            return Ok(_userService.Login(dto));
        }

        [HttpPost]
        public IActionResult Create([FromBody] UserDto dto)
        {
            _userService.CreateUser(dto);
            return Ok();
        }
    }
}
