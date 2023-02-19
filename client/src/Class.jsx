import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Stack, Table, Title } from "@mantine/core";
import axios from "axios";

export default function Classes() {
  let [searchParams, setSearchParams] = useSearchParams();
  const [classInfo, setClassInfo] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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
      .post(`/api/classes/students`, { id: searchParams.get("id") })
      .then((res) => {
        setStudents(
          res.data.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
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
          <Title order={2}>Class Info</Title>
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
        </Stack>
      )}
    </Stack>
  );
}
