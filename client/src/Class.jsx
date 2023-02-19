import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Stack,
  Table,
  Title,
  Anchor,
  Text,
  Group,
  NumberInput,
  TextInput,
  Button,
  FileButton,
  Textarea,
} from "@mantine/core";
import { openConfirmModal, openModal, closeAllModals } from "@mantine/modals";
import axios from "axios";
import { useForm } from "@mantine/form";
import { DatePicker } from "@mantine/dates";

export default function Classes() {
  let [searchParams, setSearchParams] = useSearchParams();
  const [classInfo, setClassInfo] = useState({});
  const [students, setStudents] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instructorEmail, setInstructorEmail] = useState("");
  let navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  const openDropConfirmModal = () =>
    openConfirmModal({
      title: "Please confirm your request to drop this class",
      children: (
        <Text size="sm">
          Dropping this class will remove you from the class roster and you will
          no longer be able to access the class materials.
        </Text>
      ),
      labels: { confirm: "Drop", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Drop"),
      onConfirm: () => {
        axios.post(`/api/classes/drop`, { id: classInfo.id }).then((res) => {
          console.log(res);
          // redirect to home /
          navigate("/");
        });
      },
    });

  useEffect(() => {
    axios
      .post(`/api/classes/get`, { id: searchParams.get("id") })
      .then((res) => {
        setClassInfo(res.data);
        setLoading(false);
      });
  }, [searchParams]);

  useEffect(() => {
    axios
      .post(`/api/classes/is_instructor`, { id: searchParams.get("id") })
      .then((res) => {
        setIsInstructor(res.data.is_instructor);
      });
  }, [searchParams, classInfo]);

  useEffect(() => {
    axios
      .post(`/api/classes/students`, { id: searchParams.get("id") })
      .then((res) => {
        setStudents(
          res.data.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                <Anchor href={`mailto:${s.email}`}>{s.email}</Anchor>
              </td>
            </tr>
          ))
        );
      });
  }, [searchParams]);

  const form = useForm({
    initialValues: {
      name: "",
      due: "",
      points: 100,
      description: "",
      classId: searchParams.get("id"),
    },

    validate: {
      name: (value) => {
        if (!value) return "Assignment name is required";
      },
      points: (value) => {
        if (!value) return "Points is required";
        // check if value is a number
        if (isNaN(value)) return "Points must be a number";
      },
    },
  });

  useEffect(() => {
    axios
      .post("/api/assignments/get", {
        classId: searchParams.get("id"),
      })
      .then((res) => {
        setAssignments(
          res.data.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.due}</td>
              <td>
                {a.points}/{a.points_total}
              </td>
              <td>{a.submitted ? "Yes" : "No"}</td>
            </tr>
          ))
        );
      });
  }, [searchParams, classInfo]);

  const updateAssignment = async (new_assignment) => {
    await setAssignments([
      ...assignments,
      <tr key={new_assignment.id}>
        <td>{new_assignment.name}</td>
        <td>{new_assignment.due.toISOString().split("T")[0]}</td>
        <td>
          {new_assignment.points}/{new_assignment.points}
        </td>
        <td>{new_assignment.submitted ? "Yes" : "No"}</td>
      </tr>,
    ]);
  };

  return (
    <Stack>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Stack>
          <Group>
            <Title className="grow" order={2}>
              Class Info{" "}
              {isInstructor ? (
                <span className="green">(Instructor)</span>
              ) : null}
            </Title>
            {isInstructor ? (
              <>
                <TextInput
                  placeholder="foo.bar@example.edu"
                  data-autofocus
                  value={instructorEmail}
                  onChange={(event) =>
                    setInstructorEmail(event.currentTarget.value)
                  }
                />
                <Button
                  color="grape"
                  onClick={async () => {
                    let res = await axios.post(`/api/classes/add_instructor`, {
                      id: classInfo.id,
                      email: instructorEmail,
                    });
                    await setInstructorEmail("");
                    // reload page
                    window.location.reload(false);
                  }}
                >
                  Add Instructor
                </Button>
              </>
            ) : null}
            <Button color="red" onClick={openDropConfirmModal}>
              Drop
            </Button>
          </Group>
          <Stack>
            <Title order={3}>
              {classInfo.name} ({classInfo.number})
            </Title>
            <Text>Capacity: {classInfo.capacity}</Text>
            <Text>Enrolled: {classInfo.enrolled}</Text>
          </Stack>
          <Stack>
            <Title order={2}>Students</Title>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>{students}</tbody>
            </Table>
          </Stack>
          <Stack>
            <Title order={2}>Assignments</Title>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Due</th>
                  <th>Points</th>
                  <th>Submitted?</th>
                </tr>
              </thead>
              <tbody>{assignments}</tbody>
            </Table>
            {isInstructor ? (
              <form
                onSubmit={form.onSubmit((values) => {
                  axios.post("/api/assignments/add", values).then((res) => {
                    updateAssignment(res.data);
                    form.reset();
                  });
                })}
              >
                <Title order={4}>Add Assignments</Title>
                <Stack spacing="md">
                  <Group>
                    <TextInput
                      placeholder="Name"
                      label="Name"
                      withAsterisk
                      {...form.getInputProps("name")}
                    />
                    <DatePicker
                      placeholder="Due date"
                      label="Due date"
                      {...form.getInputProps("due")}
                    />
                    <NumberInput
                      placeholder="Points"
                      label="Points"
                      {...form.getInputProps("points")}
                      withAsterisk
                    />
                  </Group>
                  <Group>
                    <Textarea
                      placeholder="Description"
                      label="Description"
                      autosize
                      withAsterisk
                      {...form.getInputProps("description")}
                    />
                  </Group>
                  <Group>
                    <FileButton
                      onChange={(files) => {
                        form.setFieldValue("files", files);
                      }}
                      accept="*.docx,*.pdf,*.txt,*.jpg,*.png,*.jpeg,*.gif,*.bmp,*.zip,*.7z"
                      multiple
                    >
                      {(props) => <Button {...props}>Upload Files</Button>}
                    </FileButton>
                    <Button type="submit" color="lime">
                      Add
                    </Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
