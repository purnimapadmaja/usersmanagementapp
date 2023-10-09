import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Container, Row, Col, Form } from "react-bootstrap";

const UserList = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorText, setErrorText] = useState("");
  const [userData, setUserData] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [editUserData, setEditUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      if (response.status === 200) {
        setUserData(response.data);
        setErrorText("");
      } else {
        setUserData([]);
      }
    } catch (error) {
      setErrorText(error.message);
      setUserData([]);
    }
  };

  const calculateNextId = () => {
    // Find the maximum ID in the current data and add 1
    const maxId = userData.reduce(
      (max, user) => (user.id > max ? user.id : max),
      0
    );
    return maxId + 1;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name === "" || username === "" || email === "" || companyName === "") {
      setErrorText("Please Enter all the details");
      return;
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setErrorText("Please enter a valid email address.");
      return;
    }

    const newUserData = {
      id: calculateNextId(),
      name: name,
      username: username,
      email: email,
      company: {
        name: companyName,
      },
    };

    if (isEditing) {
      newUserData.id = editUserData.id;
      axios
        .put(
          `https://jsonplaceholder.typicode.com/users/${editUserData.id}`,
          newUserData
        )
        .then(() => {
          console.log("User data updated");
          // Update the userData state with the edited user data
          const updatedUserData = userData.map((user) =>
            user.id === editUserData.id ? newUserData : user
          );
          setUserData(updatedUserData);
          setEditUserData(null);
          setIsEditing(false);
        })
        .catch((error) => {
          setErrorText(error.message);
        });
    } else {
      axios
        .post("https://jsonplaceholder.typicode.com/users", newUserData)
        .then(() => {
          console.log("User data added");
          // Update the userData state with the new user data
          setUserData([...userData, newUserData]);
          setName("");
          setUsername("");
          setEmail("");
          setCompanyName("");
        })
        .catch((error) => {
          setErrorText(error.message);
        });
    }
  };

  const openEditForm = (user) => {
    setEditUserData(user);
    setIsEditing(true);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setCompanyName(user.company.name);
  };

  const cancelEdit = () => {
    setEditUserData(null);
    setIsEditing(false);
    setName("");
    setUsername("");
    setEmail("");
    setCompanyName("");
  };

  const deleteRecord = (id) => {
    axios
      .delete(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then(() => {
        console.log("User data deleted");
        // Update the userData state by removing the deleted user
        const updatedUserData = userData.filter((user) => user.id !== id);
        setUserData(updatedUserData);
      })
      .catch((error) => {
        setErrorText(error.message);
      });
  };

  useEffect(() => {
    localStorage.setItem("name", name);
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("companyName", companyName);
  }, [name, username, email, userData, companyName]);

  return (
    <Container>
      <h1 className="mt-4">User Management Dashboard</h1>
      <Row className="mt-4">
        <Col sm={12} md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="companyName">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                value={companyName}
                required
                onChange={(event) => setCompanyName(event.target.value)}
              />
            </Form.Group>
            <Button variant="info" type="submit">
              {isEditing ? "Update" : "Submit"}
            </Button>
            {isEditing && (
              <Button variant="secondary" className="ml-2" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </Form>
        </Col>
        <Col sm={12} md={6}>
          <Table striped bordered variant="dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Company Name</th>
                <th>Edit Button</th>
                <th>Delete Button</th>
              </tr>
            </thead>
            <tbody>
              {userData.length > 0 ? (
                userData.map(({ id, name, username, email, company }) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{name}</td>
                    <td>{username}</td>
                    <td>{email}</td>
                    <td>{company.name}</td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() =>
                          openEditForm({
                            id,
                            name,
                            username,
                            email,
                            company,
                          })
                        }
                      >
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button variant="danger" onClick={() => deleteRecord(id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>{errorText && <h1>{errorText}</h1>}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default UserList;
