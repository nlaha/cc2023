import {
  Button,
  Group,
  Table,
  Input,
  Pagination,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons";
import { useForm } from "@mantine/form";
import axios from "axios";
import { useSelector } from "react-redux";
import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

export default function Enroll() {
  const form = useForm({
    initialValues: {
      query_string: "",
    },

    validate: {},
  });

  const user = useSelector((state) => state.user.user);
  const userStatus = useSelector((state) => state.user.status);

  const [activePage, setPage] = useState(1);
  const [classes, setClasses] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      updateClasses();
    }
  }, [userStatus, user, searchQuery, activePage]);

  const updateClasses = async () => {
    let res = await axios.post("/api/classes/search", {
      query_string: searchQuery,
      skip: activePage * 10,
    });
    let search_results = res.data;

    if (!search_results.results) {
      <Text>No classes found by that name...</Text>;
    } else {
      await setNumPages(search_results.num_pages);
      // replace classes with search results
      await setClasses(
        search_results.results.map((c) => (
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
                      .post("/api/classes/enroll", {
                        number: c.number,
                        id: c.id,
                      })
                      .then((res) => {
                        updateClasses();
                        window.location.reload(false);
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }}
                  color="lime"
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
            setSearchQuery(values.query_string);
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
        <Pagination
          page={activePage}
          onChange={setPage}
          total={numPages || 1}
        />
      </Stack>
    </>
  );
}
