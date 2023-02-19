import React, { useState, useEffect } from "react";
import { Table, Stack, Title, Group, Input, Button } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "@mantine/form";
import axios from "axios";

export default function Admin() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);

  const [classes, setClasses] = useState([]);

  const updateClasses = () => {
    axios.get("/api/classes/getall").then((res) => {
      setClasses(
        res.data.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.number}</td>
            <td>
              {c.enrolled}/{c.capacity}
            </td>
          </tr>
        ))
      );
    });
  };

  useEffect(() => {
    if (user) {
      updateClasses();
    }
  }, [userStatus, user]);

  const form = useForm({
    initialValues: {
      name: "",
      number: "",
      capacity: 100,
    },

    validate: {
      capacity: (value) => (!/[0-9]/.test(value) ? "Must be a number" : null),
    },
  });

  return (
    <>
      <Stack spacing={10}>
        <Title order={2}>Admin</Title>
        <Title order={3}>Classes</Title>
        <Table striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Enrolled/Capacity</th>
            </tr>
          </thead>
          <tbody>{classes ? classes : <> </>}</tbody>
        </Table>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await axios.post("/api/classes/add", values);
            updateClasses();
          })}
        >
          <Group>
            <Title order={3}>Add Class</Title>
            <Input placeholder="Name" {...form.getInputProps("name")} />
            <Input placeholder="Number" {...form.getInputProps("number")} />
            <Input placeholder="Capacity" {...form.getInputProps("capacity")} />
            <Button type="submit">Add</Button>
          </Group>
        </form>
      </Stack>
    </>
  );
}
