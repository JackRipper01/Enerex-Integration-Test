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
              onClick={() => toggleEditModal(student)}
            >
              Edit
            </DropdownItem>
            <DropdownItem
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

  // Individual search states for each field
  const [filterName, setFilterName] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterEducation, setFilterEducation] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");

  // Default sort is by 'name' in ascending order now, as 'id' is no longer a displayed column by default.
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can make this configurable

  // Unified handler for all filter inputs
  const handleFilterChange = useCallback((field, value) => {
    setCurrentPage(1); // Reset to first page on any filter change

    switch (field) {
      case 'name':
        setFilterName(value);
        break;
      case 'gender':
        setFilterGender(value);
        break;
      case 'age':
        setFilterAge(value);
        break;
      case 'education':
        setFilterEducation(value);
        break;
      case 'academicYear':
        setFilterAcademicYear(value);
        break;
      default:
        break;
    }
  }, []); // Dependencies are just state setters, which are stable

  const getStudents = useCallback(async () => {
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

  // --- Utility function for applying filter logic (contains vs. exact) ---
  const applyFilter = useCallback((studentValue, filterValue) => {
    if (!filterValue) return true; // No filter applied

    const lowerCaseFilter = filterValue.toLowerCase();
    const lowerCaseStudentValue = (studentValue ?? '').toString().toLowerCase();

    // Check for exact match syntax: filter value wrapped in double quotes
    if (lowerCaseFilter.startsWith('"') && lowerCaseFilter.endsWith('"')) {
      const exactMatchValue = lowerCaseFilter.substring(1, lowerCaseFilter.length - 1);
      return lowerCaseStudentValue === exactMatchValue;
    } else {
      // Default to "contains" search
      return lowerCaseStudentValue.includes(lowerCaseFilter);
    }
  }, []); // No dependencies, this function is stable

  // --- Utility functions for sorting and filtering ---
  const sortedAndFilteredStudents = React.useMemo(() => {
    if (!Array.isArray(students)) return [];

    let filtered = students.filter(student => {
      // Apply individual filters using the new applyFilter utility
      const matchesName = applyFilter(student.name, filterName);
      const matchesGender = applyFilter(student.gender, filterGender);
      const matchesAge = applyFilter(student.age, filterAge);
      const matchesEducation = applyFilter(student.education, filterEducation);
      const matchesAcademicYear = applyFilter(student.academicYear, filterAcademicYear);

      return matchesName && matchesGender && matchesAge && matchesEducation && matchesAcademicYear;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Explicitly handle ID, Age, AcademicYear as numbers for sorting
        if (sortConfig.key === 'id' || sortConfig.key === 'age' || sortConfig.key === 'academicYear') {
          const numA = Number(aValue);
          const numB = Number(bValue);

          if (numA < numB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (numA > numB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }

        // String comparison for other fields
        const stringA = (aValue ?? '').toString().toLowerCase();
        const stringB = (bValue ?? '').toString().toLowerCase();
        if (stringA < stringB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (stringA > stringB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [
    students, // Dependency for when student list changes (add/update/delete)
    filterName,
    filterGender,
    filterAge,
    filterEducation,
    filterAcademicYear,
    sortConfig,
    applyFilter // applyFilter is now a dependency for useMemo
  ]); // All individual filter states and sortConfig are now dependencies

  // Memoize requestSort to ensure stable function reference
  const requestSort = useCallback((key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  }, [sortConfig]); // Depends on sortConfig to determine next direction

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  // --- End of Utility functions ---

  // --- Modals Toggle Functions ---
  const toggleAddModal = useCallback(() => {
    setIsAddModalOpen((prev) => !prev);
    setNewStudent({ name: "", gender: "", age: 0, education: "", academicYear: 0 }); // Reset form
    setAlertMessage(null); // Clear previous alerts
  }, []);

  const toggleEditModal = useCallback((student = null) => {
    setIsEditModalOpen((prev) => !prev);
    setCurrentStudent(student ? { ...student } : null); // Set student to be edited
    setAlertMessage(null); // Clear previous alerts
  }, []);

  const toggleDeleteConfirmModal = useCallback((studentId = null) => {
    setIsConfirmDeleteModalOpen((prev) => !prev);
    setStudentToDeleteId(studentId); // Set student ID to be deleted
    setAlertMessage(null); // Clear previous alerts
  }, []);
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
  const showAlert = useCallback((message, type) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    setAlertMessage({ message, type });
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage(null);
    }, 5000); // Alert disappears after 5 seconds
  }, []);

  useEffect(() => {
    return () => { // Cleanup function for alert timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);
  // --- End of Alert Message Handler ---


  // --- Pagination Logic ---
  const totalStudents = sortedAndFilteredStudents.length;
  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  // Get current students for the page
  const currentStudents = React.useMemo(() => {
    const indexOfLastStudent = currentPage * itemsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
    return sortedAndFilteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  }, [currentPage, itemsPerPage, sortedAndFilteredStudents]);

  // Change page
  const paginate = useCallback((pageNumber) => {
    // Ensure pageNumber is within valid range
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
      return;
    }
    setCurrentPage(pageNumber);
  }, [currentPage, totalPages]); // Dependencies: totalPages to know boundaries, currentPage to prevent no-op


  // New function for dynamic pagination items
  const renderDynamicPaginationItems = useCallback(() => {
    const pageButtons = [];
    const siblingCount = 1; // How many pages to show before and after the current page
    const firstPage = 1;
    const lastPage = totalPages;

    // Don't render pagination if there's only one page or no students
    if (totalPages <= 1) {
      return null;
    }

    // Determine if we need to show the first/last page and ellipses
    const showFirstPage = currentPage > firstPage + siblingCount;
    const showLastPage = currentPage < lastPage - siblingCount;
    const showLeftEllipsis = currentPage > firstPage + siblingCount + 1;
    const showRightEllipsis = currentPage < lastPage - siblingCount - 1;


    if (showFirstPage) {
      pageButtons.push(
        <PaginationItem key={firstPage}>
          <PaginationLink href="#pablo" onClick={(e) => { e.preventDefault(); paginate(firstPage); }}>{firstPage}</PaginationLink>
        </PaginationItem>
      );
    }

    if (showLeftEllipsis) { // Add ellipsis if there's a gap
      pageButtons.push(
        <PaginationItem key="ellipsis-start" disabled>
          <PaginationLink href="#pablo" onClick={(e) => e.preventDefault()}>...</PaginationLink>
        </PaginationItem>
      );
    }

    // Render siblings around the current page
    const startSiblingPage = Math.max(firstPage, currentPage - siblingCount);
    const endSiblingPage = Math.min(lastPage, currentPage + siblingCount);

    for (let i = startSiblingPage; i <= endSiblingPage; i++) {
      // Avoid duplicating first/last page if they are within sibling range AND explicitly shown
      if ((i === firstPage && showFirstPage) || (i === lastPage && showLastPage)) continue;

      pageButtons.push(
        <PaginationItem key={i} className={i === currentPage ? "active" : ""}>
          <PaginationLink href="#pablo" onClick={(e) => { e.preventDefault(); paginate(i); }}>{i}</PaginationLink>
        </PaginationItem>
      );
    }

    if (showRightEllipsis) { // Add ellipsis if there's a gap
      pageButtons.push(
        <PaginationItem key="ellipsis-end" disabled>
          <PaginationLink href="#pablo" onClick={(e) => e.preventDefault()}>...</PaginationLink>
        </PaginationItem>
      );
    }

    if (showLastPage) {
      pageButtons.push(
        <PaginationItem key={lastPage}>
          <PaginationLink href="#pablo" onClick={(e) => { e.preventDefault(); paginate(lastPage); }}>{lastPage}</PaginationLink>
        </PaginationItem>
      );
    }

    // Fallback for very few pages, ensuring all are shown without ellipses
    if (pageButtons.length === 0 && totalPages > 0) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(
          <PaginationItem key={i} className={i === currentPage ? "active" : ""}>
            <PaginationLink href="#pablo" onClick={(e) => { e.preventDefault(); paginate(i); }}>{i}</PaginationLink>
          </PaginationItem>
        );
      }
    }


    return pageButtons;
  }, [currentPage, totalPages, paginate]); // Dependencies for useCallback
  // --- End of Pagination Logic ---


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
                      onClick={toggleAddModal}
                      size="sm"
                    >
                      Add Student
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light"><tr>
                  <th scope="col" onClick={() => requestSort("name")} className={getClassNamesFor("name")} style={{ cursor: 'pointer' }}>Name{sortConfig.key === "name" && (<i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />)}</th>
                  <th scope="col" onClick={() => requestSort("gender")} className={getClassNamesFor("gender")} style={{ cursor: 'pointer' }}>Gender{sortConfig.key === "gender" && (<i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />)}</th>
                  <th scope="col" onClick={() => requestSort("age")} className={getClassNamesFor("age")} style={{ cursor: 'pointer' }}>Age{sortConfig.key === "age" && (<i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />)}</th>
                  <th scope="col" onClick={() => requestSort("education")} className={getClassNamesFor("education")} style={{ cursor: 'pointer' }}>Education{sortConfig.key === "education" && (<i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />)}</th>
                  <th scope="col" onClick={() => requestSort("academicYear")} className={getClassNamesFor("academicYear")} style={{ cursor: 'pointer' }}>Academic Year{sortConfig.key === "academicYear" && (<i className={`fas fa-sort-${sortConfig.direction === "ascending" ? "up" : "down"} ml-2`} />)}</th>
                  <th scope="col" />
                </tr><tr>
                    <th><Input type="text" bsSize="sm" placeholder="Filter Name (use quotes for exact)" value={filterName} onChange={(e) => handleFilterChange('name', e.target.value)} style={{ color: 'black' }} /></th>
                    <th><Input type="text" bsSize="sm" placeholder="Filter Gender (use quotes for exact)" value={filterGender} onChange={(e) => handleFilterChange('gender', e.target.value)} style={{ color: 'black' }} /></th>
                    <th><Input type="text" bsSize="sm" placeholder="Filter Age (use quotes for exact)" value={filterAge} onChange={(e) => handleFilterChange('age', e.target.value)} style={{ color: 'black' }} /></th>
                    <th><Input type="text" bsSize="sm" placeholder="Filter Education (use quotes for exact)" value={filterEducation} onChange={(e) => handleFilterChange('education', e.target.value)} style={{ color: 'black' }} /></th>
                    <th><Input type="number" bsSize="sm" placeholder="Filter Year (use quotes for exact)" value={filterAcademicYear} onChange={(e) => handleFilterChange('academicYear', e.target.value)} style={{ color: 'black' }} /></th>
                    <th />
                  </tr></thead>
                <tbody>
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        student={student}
                        toggleEditModal={toggleEditModal}
                        toggleDeleteConfirmModal={toggleDeleteConfirmModal}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                {/* Pagination */}
                <nav aria-label="...">
                  <Pagination
                    className="pagination justify-content-end mb-0"
                    listClassName="justify-content-end mb-0"
                  >
                    <PaginationItem disabled={currentPage === 1 || totalPages === 0}>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => { e.preventDefault(); paginate(currentPage - 1); }}
                        tabIndex="-1"
                      >
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>

                    {renderDynamicPaginationItems()}

                    <PaginationItem disabled={currentPage === totalPages || totalPages === 0}>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => { e.preventDefault(); paginate(currentPage + 1); }}
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