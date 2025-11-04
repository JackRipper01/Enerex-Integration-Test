using Enerex_Integration_Library.DBContext;
using Enerex_Integration_Library.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enerex_Integration_Library.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly StudentContext _context;

        public UserRepository(StudentContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<UserEntity>> GetUsers() => await _context.Users.ToListAsync();

        public async Task<UserEntity?> GetUserByNameAndPassword(string name, string password)
        {
            return await _context.Users.Where(x => x.Name == name && x.Password == password).FirstOrDefaultAsync();
        }

        public async Task<UserEntity?> GetUserByEmailAndPassword(string email, string password)
        {
            return await _context.Users.Where(x => x.Email == email && x.Password == password).FirstOrDefaultAsync();
        }
    }
}
