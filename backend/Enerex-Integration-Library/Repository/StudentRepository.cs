using Enerex_Integration_Library.DBContext;
using Enerex_Integration_Library.Entities;
using Microsoft.EntityFrameworkCore;

namespace Enerex_Integration_Library.Repository
{
    public class StudentRepository : IStudentRepository
    {
        private readonly StudentContext _context;

        public StudentRepository(StudentContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<StudentEntity>> GetStudents()
        {
            return await _context.Students.ToListAsync();
        }
        
        public async Task InsertStudent(StudentEntity student)
        {
            await _context.Students.AddAsync(student);
            await Save();
        }
        public async Task DeleteStudent(int id)
        {
            var studentEntity = await GetByID(id);
            _context.Students.Remove(studentEntity);
            await Save();
        }
        public async Task UpdateStudent(int id, StudentEntity student)
        {
            var studentEntity = await GetByID(id);
            
            studentEntity.Name = student.Name;
            studentEntity.Gender = student.Gender;
            studentEntity.Age = student.Age;
            studentEntity.Education = student.Education;
            studentEntity.AcademicYear = student.AcademicYear;

            await Save();
        }

        private async Task<StudentEntity> GetByID(int id)
        {
            return await _context.Students.FindAsync(id);
        }
        private async Task Save()
        {
            await _context.SaveChangesAsync();
        }

    }
}
