using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;

namespace WebAPI.Interfaces
{
    public interface IDeliveryService
    {
        DeliveryDto GetDelivery(string email);
    }
}
