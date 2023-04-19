const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { uuid } = require("uuidv4");

// init app
const app = express();
// setup request logging
app.use(morgan("dev"));
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Serve client from build folder
app.use(express.static(path.join(__dirname, "build")));

// enables environment variables by
// parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env",
});

/* ################# API ENDPOINTS ###################### */

// Get ZaloPay account
app.post("/v2/disbursement/user", async (req, res) => {
  try {
    console.log("Received get user request", req.body);

    const { phone } = req.body;
    const data = {
      return_code: 1,
      return_message: "Success",
      sub_return_code: 1,
      sub_return_message: "Success",
      data: {
        name: "User test",
        phone: phone,
        m_u_id: uuid(),
      }
    };
    res.json(data); // sending a tuple with orderRef as well to inform about the unique order reference
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Get merchant balance
app.post("/v2/disbursement/balance", async (req, res) => {
  try {
    console.log("Received get balance request", req.body);

    const { appId, paymentId } = req.body;
    const data = {
      return_code: 1,
      return_message: "Success",
      sub_return_code: 1,
      sub_return_message: "Success",
      data: {
        balance: 100000,
      }
    };
    res.json(data); // sending a tuple with orderRef as well to inform about the unique order reference
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Topup
app.post("/v2/disbursement/topup", async (req, res) => {
  try {
    console.log("Received topup request", req.body);

    const { m_u_id, amount, description, extra_info, time, order_id } = req.body;
    const data = {
      return_code: 1,
      return_message: "Success",
      sub_return_code: 1,
      sub_return_message: "Success",
      data: {
        order_id: order_id,
        status: 3,
        m_u_id: m_u_id,
        phone: "0123456789",
        amount: amount,
        description: description,
        partner_fee: 0,
        extra_info: extra_info,
        time: time,
      }
    };
    res.json(data); // sending a tuple with orderRef as well to inform about the unique order reference
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Query order status
app.post("/v2/disbursement/txn", async (req, res) => {
  try {
    console.log("Received query order status request", req.body);

    const { partner_order_id, time } = req.body;
    const data = {
      return_code: 1,
      return_message: "Success",
      sub_return_code: 1,
      sub_return_message: "Success",
      data: {
        order_id: partner_order_id,
        status: 3,
        m_u_id: "m_u_id",
        phone: "0123456789",
        amount: 1111,
        description: "description",
        partner_fee: 0,
        zlp_fee: 0,
        extra_info: "extra_info",
        time: time,
        zp_trans_id: uuid(),
        result_url: "",
      }
    };
    res.json(data); // sending a tuple with orderRef as well to inform about the unique order reference
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

/* ################# end API ENDPOINTS ###################### */

/* ################# CLIENT ENDPOINTS ###################### */

// Handles any requests that doesn't match the above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

/* ################# end CLIENT ENDPOINTS ###################### */

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
