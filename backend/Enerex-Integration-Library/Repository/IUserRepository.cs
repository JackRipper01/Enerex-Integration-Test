using Enerex_Integration_Library.Entities;

namespace Enerex_Integration_Library.Repository
{
    public interface IUserRepository
    {
        Task<UserEntity?> GetUserByEmailAndPassword(string email, string password);
        Task<UserEntity?> GetUserByNameAndPassword(string name, string password);
        Task<IEnumerable<UserEntity>> GetUsers();
    }
}