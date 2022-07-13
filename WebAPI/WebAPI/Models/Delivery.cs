using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public enum Status { InProgress = 0, Accepted, Denied }
    public class Delivery
    {
        public string Email { get; set; }
        public Status Status { get; set; }
    }
}
