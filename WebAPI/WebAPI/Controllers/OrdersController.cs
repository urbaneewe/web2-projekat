using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Dto;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IHubContext<BroadcastHub, IHubClient> _hubContext;

        public OrdersController(IOrderService orderService, IHubContext<BroadcastHub, IHubClient> hubContext)
        {
            _orderService = orderService;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Authorize(Roles = "administrator")]
        public async Task<IActionResult> GetAllOrders()
        {
            return Ok(await _orderService.GetAllOrders());
        }

        [HttpPost]
        [Authorize(Roles = "buyer,social")]
        public IActionResult NewOrder([FromBody] NewOrderDto dto)
        {
            NewOrderDto newOrder = _orderService.NewOrder(dto);

            if (newOrder != null)
                return Ok();
            else
                return StatusCode(409);
        }

        [HttpPost("confirm")]
        [Authorize(Roles = "delivery")]
        public async Task<IActionResult> ConfirmOrder([FromBody] OrderConfirmationDto dto)
        {
            OrderDto order = _orderService.ConfirmOrder(dto);

            if (order != null)
            {
                await _hubContext.Clients.All.BroadcastMessage();
                return Ok(order);
            }
            else
                return StatusCode(204);
        }

        [HttpGet("unconfirmed")]
        [Authorize(Roles = "delivery")]
        public IActionResult UnconfirmedOrders()
        {
            return Ok(_orderService.GetAllUnconfirmedOrders());
        }

        [HttpGet("user")]
        [Authorize(Roles = "delivery,buyer,social")]
        public IActionResult GetUsersOrders()
        {
            string userEmail = "";
            try
            {
                userEmail = User.Claims.Where(a => a.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            }
            catch (Exception)
            {
                return StatusCode(409);
            }

            return Ok(_orderService.GetOrdersByEmail(userEmail));
        }

        [HttpGet("user/active")]
        [Authorize(Roles = "delivery,buyer,social")]
        public IActionResult GetUsersActiveOrder()
        {
            string userEmail = "";
            try
            {
                userEmail = User.Claims.Where(a => a.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value;
            }
            catch (Exception)
            {
                return StatusCode(409);
            }

            OrderDto order = _orderService.GetActiveOrder(userEmail);

            if (order == null)
                return StatusCode(204);
            else
                return Ok(order);
        }
    }
}
