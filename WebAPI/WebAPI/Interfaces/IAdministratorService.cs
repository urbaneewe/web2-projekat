using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;

namespace WebAPI.Interfaces
{
    public interface IAdministratorService
    {
        Task<List<DeliveryDto>> GetAllDeliveryUsers();
        bool ChangeDeliveryUserState(DeliveryDto dto);
        ProductDto AddProduct(ProductDto newProduct);
    }
}
