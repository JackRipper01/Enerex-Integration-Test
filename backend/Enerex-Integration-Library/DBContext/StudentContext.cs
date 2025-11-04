using Enerex_Integration_Library.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Enerex_Integration_Library.DBContext
{
    public class StudentContext : DbContext
    {
        public StudentContext(DbContextOptions<StudentContext> options)
        : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }

        public DbSet<StudentEntity> Students { get; set; }
        public DbSet<UserEntity> Users { get; set; }
    }
}
