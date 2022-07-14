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
    public class AdministratorService : IAdministratorService
    {
        private readonly IMapper _mapper;
        private readonly SiteDbContext _dbContext;
        private readonly IEmailService _emailService;
        private readonly string acceptedMessage = "Your request has been accepted.";
        private readonly string declinedMessage = "Sorry, your request has been declined.";

        public AdministratorService(IMapper mapper, SiteDbContext dbContext, IEmailService emailService)
        {
            _mapper = mapper;
            _dbContext = dbContext;
            _emailService = emailService;
        }

        public ProductDto AddProduct(ProductDto newProduct)
        {
            Product product = _mapper.Map<Product>(newProduct);

            var splited = product.Ingredients.Split('\n');
            product.Ingredients = string.Empty;
            foreach (var str in splited)
            {
                product.Ingredients += str;
            }

            _dbContext.Products.Add(product);
            _dbContext.SaveChanges();

            return _mapper.Map<ProductDto>(product);
        }

        public bool ChangeDeliveryUserState(DeliveryDto dto)
        {
            Delivery delivery = _dbContext.Deliveries.Find(dto.Email);

            if (delivery == null)
                return false;

            delivery.Status = dto.Status;

            if (delivery.Status == Status.Accepted)
                _emailService.SendEmail(new Message(new string[] { delivery.Email }, "GoodFood Verifikacija", acceptedMessage, null));
            else
                _emailService.SendEmail(new Message(new string[] { delivery.Email }, "GoodFood Verifikacija", declinedMessage, null));


            _dbContext.SaveChanges();
            return true;
        }

        public async Task<List<DeliveryDto>> GetAllDeliveryUsers()
        {
            return _mapper.Map<List<DeliveryDto>>(await _dbContext.Deliveries.ToListAsync());
        }
    }
}
