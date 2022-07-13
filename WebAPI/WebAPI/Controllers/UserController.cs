using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Dto;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public IActionResult Post([FromBody] UserLogInDto dto)
        {
            return Ok(_userService.Login(dto));
        }

        [HttpPost("social-login")]
        public IActionResult Post([FromBody] SocialLoginUserDto dto)
        {
            return Ok(_userService.SocialLogin(dto));
        }

        [HttpPost]
        public IActionResult Create([FromBody] UserDto dto)
        {
            if (_userService.CreateUser(dto) != null)
                return Ok();
            return StatusCode(409, $"User '{dto.Email}' already exists.");
        }

        [HttpGet("user")]
        [Authorize]
        public IActionResult GetUserInfo()
        {
            UserDto user = _userService.GetUser(User.Claims.Where(a => a.Type == ClaimTypes.NameIdentifier).FirstOrDefault().Value);
            if (user != null)
                return Ok(user);
            else
                return StatusCode(409, $"User doesn\'t exist.");
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetAllProducts()
        {
            return Ok(await _userService.GetAllProducts());
        }

        [HttpPost("change-password")]
        [Authorize]
        public IActionResult ChangeUserPassword([FromBody] UserPasswordChangeDto dto)
        {
            UserDto user = _userService.ChnageUserPassword(dto);
            if (user != null)
                return Ok();
            else
                return StatusCode(409, $"Old password doesn\'t match.");
        }

        [HttpPost("change")]
        [Authorize]
        public IActionResult ChangeUserInfo([FromBody] UserDto dto)
        {
            TokenDto token = _userService.ChangeUserInfo(dto);
            if (token != null)
                return Ok(token);
            return StatusCode(409, $"Wrong password, try again.");
        }

        [HttpPost("image"), DisableRequestSizeLimit]
        public IActionResult Upload()
        {
            try
            {
                var file = Request.Form.Files[0];
                var folderName = Path.Combine("Resources", "Images");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                if (file.Length > 0)
                {
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    var fullPath = Path.Combine(pathToSave, fileName);
                    var dbPath = Path.Combine(folderName, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }
                    if (_userService.AddUsersPicture(file.Name, dbPath))
                        return Ok(new { dbPath });
                    else
                        return BadRequest();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message + "No image attached");
            }
        }

        [HttpGet("image")]
        [ResponseCache(VaryByHeader = "User-Agent", Duration = 0)]
        public IActionResult Download()
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

            string imagePath = _userService.GetUsersPicture(userEmail);
            if (imagePath == string.Empty)
            {
                return StatusCode(409, "User does not exist.");
            }

            if (imagePath == null)
            {
                return NoContent();
            }

            if (_userService.GetUser(userEmail).Type != Models.UserType.Social)
            {
                var file = Path.Combine(Directory.GetCurrentDirectory(), imagePath);
                return PhysicalFile(file, "image/png");
            }
            else
            {
                return StatusCode(409);
            }
        }

        [HttpGet("social-image")]
        [ResponseCache(VaryByHeader = "User-Agent", Duration = 0)]
        public IActionResult DownloadPath()
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

            string imagePath = _userService.GetUsersPicture(userEmail);
            if (imagePath == string.Empty)
            {
                return StatusCode(409, "User does not exist.");
            }
            if (imagePath == null)
            {
                return NoContent();
            }

            if (_userService.GetUser(userEmail).Type != Models.UserType.Social)
            {
                return StatusCode(409);
            }
            else
            {
                return Ok(imagePath);
            }
        }
    }
}
