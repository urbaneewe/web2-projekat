using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dto;

namespace WebAPI.Interfaces
{
    public interface IUserService
    {
        UserDto CreateUser(UserDto newUser);
        TokenDto Login(UserLogInDto dto);
    }
}
