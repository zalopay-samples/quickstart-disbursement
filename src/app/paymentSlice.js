import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const retrieveBalance = createAsyncThunk(
  "disbursement/balance",
  async (data) => {
    const response = await fetch(`/v2/disbursement/balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
);

export const retrieveReceivingAccount = createAsyncThunk(
  "disbursement/user",
  async (data) => {
    const response = await fetch(`/v2/disbursement/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
);

export const topup = createAsyncThunk(
  "disbursement/topup",
  async (data) => {
    const response = await fetch(`/v2/disbursement/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
);

export const queryPaymentStatus = createAsyncThunk(
  "disbursement/txn",
  async (data) => {
    const response = await fetch(`/v2/disbursement/txn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
);

export const slice = createSlice({
  name: "payment",
  initialState: {
    error: "",
    session: null,
    paymentDataStoreRes: null,
    balance: "",
    receivingAccount: null,
    paymentRequest: null,
  },
  reducers: {
    submitPay: (state, action) => {
      const { name, phone, amount } = action.payload;
      state.paymentRequest = {
        name,
        phone,
        amount,
      };
    },
  },
  extraReducers: {
    [retrieveBalance.fulfilled]: (state, action) => {
      state.balance = action.payload.data?.balance;
    },
    [retrieveReceivingAccount.fulfilled]: (state, action) => {
      const { m_u_id, phone, name } = action?.payload?.data;
      const revAccount = {
        mUid: m_u_id,
        phone,
        name
      };
      state.receivingAccount = revAccount;
    },
    [topup.fulfilled]: (state, action) => {
      state.paymentDataStoreRes = action.payload;
    },
    [queryPaymentStatus.fulfilled]: (state, action) => {
      state.paymentStatus = action.payload;
    },    
  },
});

export const { submitPay, receivingAccountData, paymentDataStore } = slice.actions;

export default slice.reducer;
