using Enerex_Integration_Library.Models;
using Enerex_Integration_Library.Service;
using Enerex_Integration_Test.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Enerex_Integration_Test.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {

        private readonly IUserService _userService;
        private readonly IJwtProvider _jwtProvider;

        public LoginController(IUserService userService, IJwtProvider jwtProvider)
        {
            _userService = userService;
            _jwtProvider = jwtProvider;
        }

        [AllowAnonymous]
        [HttpPost("Authorize")]
        public async Task<IActionResult> AuthUser([FromBody] User user)
        {
            var member = await _userService.GetUser(user);

            if (member == null)
            {
                return Unauthorized();
            }

            var token = _jwtProvider.Generate(member);

            if (token == null)
            {
                return Unauthorized();
            }

            return Ok(token);
        }
    }
}
