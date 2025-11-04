using Enerex_Integration_Library.Models;

namespace Enerex_Integration_Library.Service
{
    public interface IStudentService
    {
        Task DeleteStudent(int studentId);
        Task<IEnumerable<Student>> GetStudents();
        Task InsertStudent(Student student);
        Task UpdateStudent(int studentId, Student student);
    }
}