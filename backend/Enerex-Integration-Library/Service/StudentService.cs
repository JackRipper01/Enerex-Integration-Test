using AutoMapper;
using Enerex_Integration_Library.Entities;
using Enerex_Integration_Library.Models;
using Enerex_Integration_Library.Repository;

namespace Enerex_Integration_Library.Service
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IMapper _mapper;

        public StudentService(IStudentRepository studentRepository, IMapper mapper)
        {
            _studentRepository = studentRepository ?? throw new ArgumentNullException(nameof(studentRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<IEnumerable<Student>> GetStudents() => _mapper.Map<IEnumerable<Student>>(await _studentRepository.GetStudents());
        public async Task InsertStudent(Student student)
        {
            var entity = _mapper.Map<StudentEntity>(student);
            await _studentRepository.InsertStudent(entity);
        }
        public async Task UpdateStudent(int studentId, Student student)
        {
            var entity = _mapper.Map<StudentEntity>(student);
            await _studentRepository.UpdateStudent(studentId, entity);
        }
        public async Task DeleteStudent(int studentId) => await _studentRepository.DeleteStudent(studentId);
    }
}
