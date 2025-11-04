using Enerex_Integration_Library.Models;

namespace Enerex_Integration_Library.Service
{
    public interface IUserService
    {
        Task<User?> GetUser(User user);
        Task<IEnumerable<User>> GetUsers();
    }
}