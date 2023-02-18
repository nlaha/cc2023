import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
  const res = await axios.get(process.env.REACT_APP_API_URL + "/user");
  return res.data;
});

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    status: "idle",
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUser.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        console.log(action.error);
      });
  },
});

// Action creators are generated for each case reducer function
//export const {  } = userSlice.actions;

export default userSlice.reducer;
