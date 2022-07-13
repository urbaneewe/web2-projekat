using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;
using WebAPI.Infrastructure;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IMapper _mapper;
        private readonly SiteDbContext _dbContext;
        private static readonly object _lock = new object();
        private static bool _ready = false;

        public OrderService(IMapper mapper, SiteDbContext dbContext)
        {
            _mapper = mapper;
            _dbContext = dbContext;
        }
        public async Task<List<OrderDto>> GetAllOrders()
        {
            List<ProductInOrder> products = await _dbContext.ProductInOrder.ToListAsync();
            return _mapper.Map<List<OrderDto>>(await _dbContext.Orders.ToListAsync());
        }

        public NewOrderDto NewOrder(NewOrderDto newOrderDto)
        {
            OrderDto orderDto = new OrderDto();
            orderDto.Id = 0;
            orderDto.BuyerEmail = newOrderDto.BuyerEmail;
            orderDto.ProductsInOrder = newOrderDto.ProductsInOrder;
            orderDto.Address = newOrderDto.Address;
            orderDto.Comment = newOrderDto.Comment;
            orderDto.Price = 200;
            foreach (var prod in orderDto.ProductsInOrder)
            {
                orderDto.Price += _dbContext.Products.Find(prod.ProductId).Price * prod.Quantity;
            }
            orderDto.OrderTime = DateTime.Now;

            Order order = _mapper.Map<Order>(orderDto);
            _dbContext.Orders.Add(order);
            _dbContext.SaveChanges();

            newOrderDto.Id = order.Id;
            newOrderDto.Price = order.Price;
            newOrderDto.OrderTime = order.OrderTime;
            return _mapper.Map<NewOrderDto>(newOrderDto);
        }

        public OrderDto ConfirmOrder(OrderConfirmationDto dto)
        {
            Order order = null;

            if (!_ready)
            {
                lock (_lock)
                {
                    if (!_ready)
                    {
                        _ready = true;
                        order = _dbContext.Orders.Find(dto.Id);
                        if (order.DeliveryEmail == null)
                        {
                            order.DeliveryEmail = dto.Email;
                            Random rnd = new Random();
                            order.DeliveryTime = DateTime.Now.AddMinutes(rnd.Next(5, 15));
                            List<ProductInOrder> products = _dbContext.ProductInOrder.Where(prodInOrder => prodInOrder.OrderId == order.Id).ToList();
                            _dbContext.SaveChanges();
                        }
                    }
                }
                _ready = false;
                return _mapper.Map<OrderDto>(order);
            }

            return null;
        }

        public List<OrderDto> GetOrdersByEmail(string email)
        {
            List<ProductInOrder> products = _dbContext.ProductInOrder.ToList();
            return _mapper.Map<List<OrderDto>>(_dbContext.Orders.Where(order => (order.BuyerEmail == email || order.DeliveryEmail == email) && order.DeliveryEmail != null));
        }

        public OrderDto GetActiveOrder(string email)
        {
            List<Order> orders = _dbContext.Orders.Where(order => order.BuyerEmail == email || order.DeliveryEmail == email).ToList();

            foreach (var order in orders)
            {
                if (order.DeliveryEmail == null)
                {
                    List<ProductInOrder> products = _dbContext.ProductInOrder.Where(prodInOrder => prodInOrder.OrderId == order.Id).ToList();
                    return _mapper.Map<OrderDto>(order);
                }

                if (order.DeliveryTime > DateTime.Now)
                {
                    List<ProductInOrder> products = _dbContext.ProductInOrder.Where(prodInOrder => prodInOrder.OrderId == order.Id).ToList();
                    return _mapper.Map<OrderDto>(order);
                }
            }

            return null;
        }

        public List<OrderDto> GetAllUnconfirmedOrders()
        {
            List<Order> orders = _dbContext.Orders.Where(order => order.DeliveryEmail == null).ToList();
            foreach (var order in orders)
            {
                List<ProductInOrder> products = _dbContext.ProductInOrder.Where(prodInOrder => prodInOrder.OrderId == order.Id).ToList();
            }

            return _mapper.Map<List<OrderDto>>(orders);
        }
    }
}
