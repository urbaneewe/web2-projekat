using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using WebAPI.Dto;
using WebAPI.Infrastructure;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _secretKey;
        private readonly SiteDbContext _dbContext;

        public UserService(IMapper mapper, IConfiguration config, SiteDbContext dbContext)
        {
            _mapper = mapper;
            _secretKey = config.GetSection("SecretKey");
            _dbContext = dbContext;
        }

        public UserDto CreateUser(UserDto newUser)
        {
            User user = _mapper.Map<User>(newUser);
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();

            return _mapper.Map<UserDto>(user);
        }

        public TokenDto Login(UserLogInDto dto)
        {
            User user = _dbContext.Users.Find(dto.Email);

            if (user == null)
                return null;

            if (BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))//Uporedjujemo hes pasvorda iz baze i unetog pasvorda
            {
                List<Claim> claims = new List<Claim>();
                //Mozemo dodati Claimove u token, oni ce biti vidljivi u tokenu i mozemo ih koristiti za autorizaciju
                if (user.Type == UserType.Administrator)
                    claims.Add(new Claim(ClaimTypes.Role, "administrator")); //Add user type to claim
                if (user.Type == UserType.Deliverer)
                    claims.Add(new Claim(ClaimTypes.Role, "deliverer")); //Add user type to claim
                if (user.Type == UserType.Customer)
                    claims.Add(new Claim(ClaimTypes.Role, "customer")); //Add user type to claim
                claims.Add(new Claim(ClaimTypes.Email, user.Email));

                //Kreiramo kredencijale za potpisivanje tokena. Token mora biti potpisan privatnim kljucem
                //kako bi se sprecile njegove neovlascene izmene
                SymmetricSecurityKey secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey.Value));
                var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
                var tokeOptions = new JwtSecurityToken(
                    issuer: "https://localhost:44368", //url servera koji je izdao token
                    claims: claims, //claimovi
                    expires: DateTime.Now.AddMinutes(20), //vazenje tokena u minutama
                    signingCredentials: signinCredentials //kredencijali za potpis
                );
                string tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
                return new TokenDto { Token = tokenString };
            }
            else
            {
                return null;
            }
        }
    }
}
