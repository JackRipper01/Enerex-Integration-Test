/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// reactstrap components
// src/views/examples/Tables.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthenticatedData } from "utils/api";

// reactstrap components
import {
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row,
  Alert,
  Input,
  FormGroup,
  Form,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";

// New TableRow component
const TableRow = React.memo(({ student, toggleEditModal, toggleDeleteConfirmModal }) => {
  console.log(`Rendering TableRow for student: ID=${student.id}, Name=${student.name}`); // Temporarily add log to confirm memoization
  return (
    <tr key={student.id}>
      <th scope="row">
        <Media className="align-items-center">
          <Media>
            <span className="mb-0 text-sm">{student.name}</span>
          </Media>
        </Media>
      </th>
      <td>{student.gender}</td>
      <td>{student.age}</td>
      <td>{student.education}</td>
      <td>{student.academicYear}</td>
      <td className="text-right">
        <UncontrolledDropdown>
          <DropdownToggle
            className="btn-icon-only text-light"
            href="#pablo"
            role="button"
            size="sm"
            color=""
            onClick={(e) => e.preventDefault()}
          >
            <i className="fas fa-ellipsis-v" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-arrow" right>
            <DropdownItem
              // Pass the specific student to the memoized toggle function
              onClick={() => toggleEditModal(student)}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              // Pass the specific student ID to the memoized toggle function
              onClick={() => toggleDeleteConfirmModal(student.id)}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </td>
    </tr>
  );
});

const Tables = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const navigate = useNavigate();

  // State for Add Student Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", gender: "", age: 0, education: "", academicYear: 0 });

  // State for Edit Student Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null); // Holds student data for editing

  // State for Delete Confirmation Modal
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState(null);

  // State for displaying success/error messages after CRUD operations
  const [alertMessage, setAlertMessage] = useState(null);
  const alertTimeoutRef = useRef(null); // To clear timeout if component unmounts or new alert

  const getStudents = useCallback(async () => {
    // console.log("FETCHING STUDENTS FROM API..."); // For verification
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuthenticatedData("/Student/GetStudents");
      setStudents(Array.isArray(data) ? data : []); // Ensure data is an array, fallback to empty array
    } catch (err) {
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("authToken"); // Clear invalid token
        navigate("/auth/login"); // Redirect to login
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    getStudents();
  }, [getStudents]);

  // --- Utility functions for sorting and filtering ---
  const sortedAndFilteredStudents = React.useMemo(() => {
    // console.log("RE-CALCULATING SORTED/FILTERED STUDENTS"); // For verification
    // Ensure students is an array before filtering
    if (!Array.isArray(students)) return [];

    let filtered = students.filter(student => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return (
        (student.name?.toLowerCase() ?? '').includes(lowerCaseSearchQuery) ||
        (student.education?.toLowerCase() ?? '').includes(lowerCaseSearchQuery) ||
        (student.gender?.toLowerCase() ?? '').includes(lowerCaseSearchQuery) ||
        (student.age?.toString() ?? '').includes(lowerCaseSearchQuery) ||
        (student.academicYear?.toString() ?? '').includes(lowerCaseSearchQuery)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle potential undefined/null values during sorting gracefully
        const aValue = a[sortConfig.key] ?? ''; // Default to empty string for comparison
        const bValue = b[sortConfig.key] ?? '';

        // Numeric comparison for Age and AcademicYear
        if (sortConfig.key === 'age' || sortConfig.key === 'academicYear') {
          return sortConfig.direction === 'ascending' ? (aValue - bValue) : (bValue - aValue);
        }

        // String comparison for other fields
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [students, searchQuery, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  // --- End of Utility functions ---

  // --- Modals Toggle Functions ---
  // Memoize these functions using useCallback to ensure stable references across renders
  const toggleAddModal = useCallback(() => {
    setIsAddModalOpen((prev) => !prev);
    setNewStudent({ name: "", gender: "", age: 0, education: "", academicYear: 0 }); // Reset form
    setAlertMessage(null); // Clear previous alerts
  }, []); // All state setters (setIsAddModalOpen, setNewStudent, setAlertMessage) are stable

  const toggleEditModal = useCallback((student = null) => {
    setIsEditModalOpen((prev) => !prev);
    // Ensure `currentStudent` is a new object to avoid direct state mutation issues with nested objects
    setCurrentStudent(student ? { ...student } : null); // Set student to be edited
    setAlertMessage(null); // Clear previous alerts
  }, []); // All state setters (setIsEditModalOpen, setCurrentStudent, setAlertMessage) are stable

  const toggleDeleteConfirmModal = useCallback((studentId = null) => {
    setIsConfirmDeleteModalOpen((prev) => !prev);
    setStudentToDeleteId(studentId); // Set student ID to be deleted
    setAlertMessage(null); // Clear previous alerts
  }, []); // All state setters (setIsConfirmDeleteModalOpen, setStudentToDeleteId, setAlertMessage) are stable
  // --- End of Modals Toggle Functions ---

  // --- CRUD Operations ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await fetchAuthenticatedData("/Student/AddStudent", "POST", newStudent);
      await getStudents(); // Refresh student list
      toggleAddModal(); // Close modal
      showAlert("Student added successfully!", "success");
    } catch (err) {
      showAlert(`Error adding student: ${err.message}`, "danger");
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!currentStudent || !currentStudent.id) return;

    try {
      // The backend uses PUT /api/Student/UpdateStudent/{studentId} with the student in the body
      await fetchAuthenticatedData(`/Student/UpdateStudent/${currentStudent.id}`, "PUT", currentStudent);
      await getStudents(); // Refresh student list
      toggleEditModal(); // Close modal
      showAlert("Student updated successfully!", "success");
    } catch (err) {
      showAlert(`Error updating student: ${err.message}`, "danger");
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDeleteId) return;

    try {
      await fetchAuthenticatedData(`/Student/DeleteStudent/${studentToDeleteId}`, "DELETE");
      await getStudents(); // Refresh student list
      toggleDeleteConfirmModal(); // Close confirmation modal
      showAlert("Student deleted successfully!", "success");
    } catch (err) {
      showAlert(`Error deleting student: ${err.message}`, "danger");
    }
  };
  // --- End of CRUD Operations ---

  // --- Alert Message Handler ---
  const showAlert = (message, type) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    setAlertMessage({ message, type });
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage(null);
    }, 5000); // Alert disappears after 5 seconds
  };

  useEffect(() => {
    return () => { // Cleanup function for alert timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);
  // --- End of Alert Message Handler ---

  // Display loading, error, or data
  if (loading) return <Container className="mt--7" fluid><p>Loading students...</p></Container>;
  if (error) return <Container className="mt--7" fluid><Alert color="danger">Error: {error}</Alert></Container>;


  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {alertMessage && (
          <Alert color={alertMessage.type} fade={true}>
            {alertMessage.message}
          </Alert>
        )}
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Students</h3>
                  </Col>
                  <Col xs="4" className="text-right">
                    <Button
                      color="primary"
                      onClick={toggleAddModal} // Open Add Student Modal
                      size="sm"
                    >
                      Add Student
                    </Button>
                  </Col>
                </Row>
                <Form className="navbar-search navbar-search-dark form-inline mt-3">
                  <FormGroup className="mb-0">
                    <Input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </FormGroup>
                </Form>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light"><tr>
                  <th scope="col" onClick={() => requestSort("name")} className={getClassNamesFor("name")}>
                    Name
                    {sortConfig.key === "name" && (
                      <i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />
                    )}
                  </th>
                  <th scope="col" onClick={() => requestSort("gender")} className={getClassNamesFor("gender")}>
                    Gender
                    {sortConfig.key === "gender" && (
                      <i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />
                    )}
                  </th>
                  <th scope="col" onClick={() => requestSort("age")} className={getClassNamesFor("age")}>
                    Age
                    {sortConfig.key === "age" && (
                      <i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />
                    )}
                  </th>
                  <th scope="col" onClick={() => requestSort("education")} className={getClassNamesFor("education")}>
                    Education
                    {sortConfig.key === "education" && (
                      <i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />
                    )}
                  </th>
                  <th scope="col" onClick={() => requestSort("academicYear")} className={getClassNamesFor("academicYear")}>
                    Academic Year
                    {sortConfig.key === "academicYear" && (
                      <i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />
                    )}
                  </th>
                  <th scope="col" />
                </tr></thead>
                <tbody>
                  {sortedAndFilteredStudents.map((student) => (
                    <TableRow
                      key={student.id} // Key remains on the outer component
                      student={student}
                      toggleEditModal={toggleEditModal} // Now a stable function reference
                      toggleDeleteConfirmModal={toggleDeleteConfirmModal} // Now a stable function reference
                    />
                  ))}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                {/* Pagination (can be implemented later for large datasets) */}
                <nav aria-label="...">
                  <Pagination
                    className="pagination justify-content-end mb-0"
                    listClassName="justify-content-end mb-0"
                  >
                    <PaginationItem className="disabled">
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        tabIndex="-1"
                      >
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem className="active">
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        2 <span className="sr-only">(current)</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="fas fa-angle-right" />
                        <span className="sr-only">Next</span>
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
        {/* Start Add Student Modal */}
        <Modal isOpen={isAddModalOpen} toggle={toggleAddModal}>
          <ModalHeader toggle={toggleAddModal}>Add New Student</ModalHeader>
          <Form onSubmit={handleAddStudent}>
            <ModalBody>
              <FormGroup>
                <label>Name</label>
                <Input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Gender</label>
                <Input
                  type="select"
                  value={newStudent.gender}
                  onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <label>Age</label>
                <Input
                  type="number"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent({ ...newStudent, age: parseInt(e.target.value) || 0 })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Education</label>
                <Input
                  type="text"
                  value={newStudent.education}
                  onChange={(e) => setNewStudent({ ...newStudent, education: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Academic Year</label>
                <Input
                  type="number"
                  value={newStudent.academicYear}
                  onChange={(e) => setNewStudent({ ...newStudent, academicYear: parseInt(e.target.value) || 0 })}
                  required
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggleAddModal}>Cancel</Button>
              <Button color="primary" type="submit">Add Student</Button>
            </ModalFooter>
          </Form>
        </Modal>
        {/* End Add Student Modal */}

        {/* Start Edit Student Modal */}
        <Modal isOpen={isEditModalOpen} toggle={toggleEditModal}>
          <ModalHeader toggle={toggleEditModal}>Edit Student</ModalHeader>
          {currentStudent && (
            <Form onSubmit={handleUpdateStudent}>
              <ModalBody>
                <FormGroup>
                  <label>Name</label>
                  <Input
                    type="text"
                    value={currentStudent.name}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Gender</label>
                  <Input
                    type="select"
                    value={currentStudent.gender}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <label>Age</label>
                  <Input
                    type="number"
                    value={currentStudent.age}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, age: parseInt(e.target.value) || 0 })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Education</label>
                  <Input
                    type="text"
                    value={currentStudent.education}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, education: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Academic Year</label>
                  <Input
                    type="number"
                    value={currentStudent.academicYear}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, academicYear: parseInt(e.target.value) || 0 })}
                    required
                  />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={toggleEditModal}>Cancel</Button>
                <Button color="primary" type="submit">Update Student</Button>
              </ModalFooter>
            </Form>
          )}
        </Modal>
        {/* End Edit Student Modal */}

        {/* Start Delete Confirmation Modal */}
        <Modal isOpen={isConfirmDeleteModalOpen} toggle={toggleDeleteConfirmModal}>
          <ModalHeader toggle={toggleDeleteConfirmModal}>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this student? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleDeleteConfirmModal}>Cancel</Button>
            <Button color="danger" onClick={handleDeleteStudent}>Delete</Button>
          </ModalFooter>
        </Modal>
        {/* End Delete Confirmation Modal */}
      </Container>
    </>
  );
};

export default Tables;