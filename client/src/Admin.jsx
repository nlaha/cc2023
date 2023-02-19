import React, { useState, useEffect } from "react";
import { Table, Stack, Title, Group, Input, Button } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "@mantine/form";
import axios from "axios";

export default function Admin() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);

  const [classes, setClasses] = useState([]);

  const updateClasses = (new_class) => {
    if (!new_class) {
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
    } else {
      // append new class to classes
      setClasses([
        ...classes,
        <tr key={new_class.id}>
          <td>{new_class.name}</td>
          <td>{new_class.number}</td>
          <td>
            {new_class.enrolled}/{new_class.capacity}
          </td>
        </tr>,
      ]);
    }
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
          onSubmit={form.onSubmit((values) => {
            axios.post("/api/classes/add", values).then((res) => {
              updateClasses(res.data);
            });
          })}
        >
          <Title order={3}>Add Class</Title>
          <Group>
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
