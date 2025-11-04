using Enerex_Integration_Library.Entities;

namespace Enerex_Integration_Library.Repository
{
    public interface IStudentRepository
    {
        Task<IEnumerable<StudentEntity>> GetStudents();
        Task DeleteStudent(int studentID);
        Task InsertStudent(StudentEntity student);
        Task UpdateStudent(int id, StudentEntity student);
    }
}