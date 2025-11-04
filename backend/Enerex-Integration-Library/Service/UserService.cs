using AutoMapper;
using Enerex_Integration_Library.Models;
using Enerex_Integration_Library.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enerex_Integration_Library.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<IEnumerable<User>> GetUsers() => _mapper.Map<IEnumerable<User>>(await _userRepository.GetUsers());

        public async Task<User?> GetUser(User user)
        {
            User? toReturn = null;

            if (user != null)
            {
                if (!string.IsNullOrEmpty(user.Name) && !string.IsNullOrEmpty(user.Password))
                {
                    toReturn = await GetByNameAndPassword(user.Name, user.Password);
                }

                if (toReturn == null || toReturn == default(User))
                {
                    toReturn = await GetByEmailAndPassword(user.Email, user.Password);
                }
            }

            return toReturn;
        }

        private async Task<User> GetByNameAndPassword(string name, string password)
        {
            return _mapper.Map<User>(await _userRepository.GetUserByNameAndPassword(name, password));
        }
        private async Task<User> GetByEmailAndPassword(string email, string password)
        {
            return _mapper.Map<User>(await _userRepository.GetUserByEmailAndPassword(email, password));
        }
    }
}
