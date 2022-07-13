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
        UserDto GetUser(string email);
        TokenDto Login(UserLogInDto dto);
        TokenDto SocialLogin(SocialLoginUserDto dto);
        TokenDto ChangeUserInfo(UserDto updatedUser);
        UserDto ChnageUserPassword(UserPasswordChangeDto dto);
        bool AddUsersPicture(string email, string path);
        string GetUsersPicture(string email);
        Task<List<ProductDto>> GetAllProducts();
    }
}
