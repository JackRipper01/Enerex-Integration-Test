using Enerex_Integration_Library.Entities;
using Enerex_Integration_Library.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Enerex_Integration_Library.DBContext
{
    public class DataGenerator
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new StudentContext(serviceProvider.GetRequiredService<DbContextOptions<StudentContext>>()))
            {
                // Insert students
                if (!context.Students.Any())
                {
                    string path = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Data", "students.txt");
                    string[] studentsList = File.ReadAllLines(path);

                    var students = studentsList.Select(x => x.Split(','))
                        .Select(s => new StudentEntity()
                        {
                            Name = s[0],
                            Gender = s[1],
                            Age = int.Parse(s[2]),
                            Education = s[3],
                            AcademicYear = int.Parse(s[4])
                        });

                    context.AddRange(students);
                    context.SaveChanges();
                }

                // Insert users
                if (!context.Users.Any())
                {
                    context.Users.AddRange(
                        new UserEntity { Id = 1, Name = "TestUser1", Email = "testUser1@gmail.com", Password = "123456" },
                        new UserEntity { Id = 2, Name = "TestUser2", Email = "testUser2@gmail.com", Password = "800008" },
                        new UserEntity { Id = 3, Name = "TestUser3", Email = "testUser3@gmail.com", Password = "200002" }
                    );

                    context.SaveChanges();
                }
            }
        }
    }
}
