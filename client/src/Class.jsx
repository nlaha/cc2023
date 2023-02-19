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
} from "@mantine/core";
import { openConfirmModal, openModal, closeAllModals } from "@mantine/modals";
import axios from "axios";
import { useForm } from "@mantine/form";
import { DatePicker } from "@mantine/dates";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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

  const openAddInstructorModal = () =>
    openModal({
      title: "Subscribe to newsletter",
      children: (
        <>
          <TextInput
            label="Instructor Email"
            placeholder="foo.bar@example.edu"
            data-autofocus
            onChange={(e) => setInstructorEmail(e.target.value)}
            value={instructorEmail}
          />
          <Button
            fullWidth
            onClick={() => {
              axios
                .post(`/api/classes/add_instructor`, {
                  id: classInfo.id,
                  email: instructorEmail,
                })
                .then((res) => {
                  console.log(res);
                  closeAllModals();
                });
            }}
            mt="md"
          >
            Submit
          </Button>
        </>
      ),
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

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: form.values.description,
  });

  const updateAssignments = async (new_assignment) => {
    if (!new_assignment) {
      let res = await axios.post("/api/assignments/get");
      await setAssignments(
        res.data.results.map((a) => (
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
    } else {
      setAssignments(
        assignments.map((a) => (
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
    }
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
              {isInstructor ? <span color="lime">(Instructor)</span> : null}
            </Title>
            <Button color="grape" onClick={openAddInstructorModal}>
              Add Instructor
            </Button>
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
                    updateAssignments(res.data);
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
                    <RichTextEditor
                      editor={editor}
                      {...form.getInputProps("description")}
                    >
                      <RichTextEditor.Toolbar
                        sticky
                        stickyOffset={60}
                        sx={{ width: "100%" }}
                      >
                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Bold />
                          <RichTextEditor.Italic />
                          <RichTextEditor.Strikethrough />
                          <RichTextEditor.ClearFormatting />
                          <RichTextEditor.Code />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.H1 />
                          <RichTextEditor.H2 />
                          <RichTextEditor.H3 />
                          <RichTextEditor.H4 />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Blockquote />
                          <RichTextEditor.Hr />
                          <RichTextEditor.BulletList />
                          <RichTextEditor.OrderedList />
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                          <RichTextEditor.Link />
                          <RichTextEditor.Unlink />
                        </RichTextEditor.ControlsGroup>
                      </RichTextEditor.Toolbar>

                      <RichTextEditor.Content />
                    </RichTextEditor>
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
