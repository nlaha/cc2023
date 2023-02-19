import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Stack, Title } from "@mantine/core";

export default function Classes() {
  let [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <Stack>
        <Title order={2}>{searchParams.id}</Title>
      </Stack>
    </>
  );
}
