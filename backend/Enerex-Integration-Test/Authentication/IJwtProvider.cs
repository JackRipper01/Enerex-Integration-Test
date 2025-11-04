using Enerex_Integration_Library.Models;

namespace Enerex_Integration_Test.Authentication
{
    public interface IJwtProvider
    {
        string Generate(User member);
    }
}