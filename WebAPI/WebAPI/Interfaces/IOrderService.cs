using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;

namespace WebAPI.Interfaces
{
    public interface IOrderService
    {
        NewOrderDto NewOrder(NewOrderDto newOrderDto);
        Task<List<OrderDto>> GetAllOrders();
        OrderDto ConfirmOrder(OrderConfirmationDto dto);
        List<OrderDto> GetOrdersByEmail(string email);
        OrderDto GetActiveOrder(string email);
        List<OrderDto> GetAllUnconfirmedOrders();
    }
}
