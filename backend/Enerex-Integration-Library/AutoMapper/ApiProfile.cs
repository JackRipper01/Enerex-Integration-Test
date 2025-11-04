using AutoMapper;
using Enerex_Integration_Library.Entities;
using Enerex_Integration_Library.Models;

namespace Enerex_Integration_Test.AutoMapper
{
    public class ApiProfile : Profile
    {
        public ApiProfile()
        {
            CreateMap<StudentEntity, Student>().ReverseMap();
            CreateMap<UserEntity, User>().ReverseMap();
        }
    }
}
