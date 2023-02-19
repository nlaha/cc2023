import React, { useState, useEffect } from "react";
import {
  Table,
  Stack,
  Title,
  Group,
  TextInput,
  Button,
  Pagination,
  NumberInput,
} from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "@mantine/form";
import axios from "axios";

export default function Admin() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);

  const [activePage, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user) {
      updateClasses();
    }
  }, [userStatus, user, activePage]);

  const updateClasses = async (new_class) => {
    if (!new_class) {
      let res = await axios.post("/api/classes/getall", {
        skip: activePage * 10,
      });
      await setNumPages(res.data.num_pages);
      await setClasses(
        res.data.results.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.number}</td>
            <td>
              {c.enrolled}/{c.capacity}
            </td>
          </tr>
        ))
      );
    } else {
      // append new class to classes
      await setClasses([
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
        <Pagination
          page={activePage}
          onChange={setPage}
          total={numPages || 1}
        />
        <form
          onSubmit={form.onSubmit((values) => {
            axios.post("/api/classes/add", values).then((res) => {
              updateClasses(res.data);
            });
          })}
        >
          <Title order={3}>Add Class</Title>
          <Group>
            <TextInput
              label="Name"
              placeholder="Name"
              withAsterisk
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Number"
              placeholder="Number"
              withAsterisk
              {...form.getInputProps("number")}
            />
            <NumberInput
              label="Capacity"
              placeholder="Capacity"
              withAsterisk
              {...form.getInputProps("capacity")}
            />
            <Button type="submit">Add</Button>
          </Group>
        </form>
      </Stack>
    </>
  );
}
