using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/administrator")]
    [ApiController]
    public class AdministratorController : ControllerBase
    {
        private readonly IAdministratorService _administratorService;

        public AdministratorController(IAdministratorService administratorService)
        {
            _administratorService = administratorService;
        }

        [HttpGet]
        [Authorize(Roles = "administrator")]
        public async Task<IActionResult> GetAllDeliveryUsers()
        {
            return Ok(await _administratorService.GetAllDeliveryUsers());
        }

        [HttpPost]
        [Authorize(Roles = "administrator")]
        public IActionResult ChangeDeliveryUser([FromBody] DeliveryDto dto)
        {
            if (_administratorService.ChangeDeliveryUserState(dto) == true)
                return Ok();
            else
                return StatusCode(409, "Something went wrong with status change. Try again");
        }

        [HttpPost("product")]
        [Authorize(Roles = "administrator")]
        public IActionResult AddNewProduct([FromBody] ProductDto dto)
        {
            return Ok(_administratorService.AddProduct(dto));
        }
    }
}
