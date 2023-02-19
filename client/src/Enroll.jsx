import { Button, Group, Table, Input, Stack, Text, Title } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons";
import { useForm } from "@mantine/form";
import axios from "axios";
import { useSelector } from "react-redux";

export default function Enroll() {
  const form = useForm({
    initialValues: {
      query_string: "",
    },

    validate: {},
  });

  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);

  const [classes, setClasses] = useState([]);

  const updateClasses = (search_results) => {
    if (!search_results) {
      <Text>No classes found by that name...</Text>;
    } else {
      // replace classes with search results
      setClasses(
        search_results.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.number}</td>
            <td>
              {c.enrolled}/{c.capacity}
            </td>
            {c.enrolled < c.capacity ? (
              <td>
                <Button
                  onClick={() => {
                    axios
                      .post("/api/classes/enroll", { number: c.number })
                      .then((res) => {
                        updateClasses();
                        window.location.reload(false);
                      });
                  }}
                >
                  Enroll
                </Button>
              </td>
            ) : (
              <td>
                <Button disabled color="red">
                  FULL
                </Button>
              </td>
            )}
          </tr>
        ))
      );
    }
  };

  return (
    <>
      <Stack>
        <Title order={2}>Search & Enroll</Title>
        <form
          onSubmit={form.onSubmit((values) => {
            axios.post("/api/classes/search", values).then((res) => {
              updateClasses(res.data);
            });
          })}
        >
          <Group>
            <Input
              {...form.getInputProps("query_string")}
              icon={<IconSearch />}
              placeholder="Search for a class"
            />
            <Button type="submit">Search</Button>
          </Group>
        </form>
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
      </Stack>
    </>
  );
}
