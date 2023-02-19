import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Stack,
  Table,
  Title,
  Anchor,
  Text,
  Group,
  Button,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import axios from "axios";

export default function Classes() {
  let [searchParams, setSearchParams] = useSearchParams();
  const [classInfo, setClassInfo] = useState({});
  const [students, setStudents] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
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

    axios
      .post(`/api/classes/is_instructor`, { id: searchParams.get("id") })
      .then((res) => {
        setIsInstructor(res.data);
      });
  }, [searchParams]);

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

  return (
    <Stack>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Stack>
          <Group>
            <Title className="grow" order={2}>
              Class Info
            </Title>
            <Button color="red" onClick={openDropConfirmModal}>
              Drop
            </Button>
          </Group>
          <Stack>
            <Title order={3}>
              {classInfo.name} ({classInfo.number})
            </Title>

            <p>Capacity: {classInfo.capacity}</p>
            <p>Enrolled: {classInfo.enrolled}</p>
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
            {}
            <form
              onSubmit={form.onSubmit((values) => {
                axios.post("/api/classes/add", values).then((res) => {
                  updateClasses(res.data);
                });
              })}
            >
              <Title order={3}>Add Assignments</Title>
              <Group>
                <Button type="submit">Add</Button>
              </Group>
            </form>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
