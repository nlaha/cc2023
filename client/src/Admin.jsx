import React, { useState, useEffect } from "react";
import { Table, Stack, Title, Group, Input, Button } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "@mantine/form";
import axios from "axios";

export default function Admin() {
  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);

  const form = useForm({
    initialValues: {
      name: "",
      number: "",
      capacity: 100,
    },

    validate: {},
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
          <tbody>{user && user.lms.classes ? user.lms.classes : <> </>}</tbody>
        </Table>
        <form
          onSubmit={form.onSubmit((values) =>
            axios.post("/api/classes/add", values)
          )}
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
