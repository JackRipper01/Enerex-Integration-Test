using Enerex_Integration_Library.Models;
using Enerex_Integration_Library.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Enerex_Integration_Test.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;
        public StudentController(IStudentService studentService)
        {
            _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetStudents()
        {
            return Ok(await _studentService.GetStudents());
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddStudent(Student student)
        {
            await _studentService.InsertStudent(student);
            return Ok();
        }

        [Authorize]
        [HttpPut("{studentId}")]
        public async Task<IActionResult> UpdateStudent(int studentId, Student student)
        {
            await _studentService.UpdateStudent(studentId,student);
            return Ok();
        }

        [Authorize]
        [HttpDelete("{studentId}")]
        public async Task<IActionResult> DeleteStudent(int studentId)
        {
            await _studentService.DeleteStudent(studentId);
            return Ok();
        }
    }
}
