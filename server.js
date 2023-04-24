const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { uuid } = require("uuidv4");
const crypto = require("crypto-js");
const rsa = require("node-rsa");
const { validatePhone, validateAmount } = require("./src/app/util/helpers");

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
// Enable cors
app.use(cors());
// enables environment variables by
// parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env",
});

const IS_MOCK = process.env.REACT_APP_IS_MOCK === "1";
const SANDBOX_URL = process.env.REACT_APP_SANDBOX_URL;
const API_BASE_PATH = "/api/v2";

const appId = parseInt(process.env.REACT_APP_APP_ID);
const paymentId = process.env.REACT_APP_PAYMENT_ID;

/* ################# API ENDPOINTS ###################### */

// Get ZaloPay account
app.post(`${API_BASE_PATH}/disbursement/user`, async (req, res) => {
  try {
    console.log("Received get user request", req.body);
    const { phone } = req.body;
    const validatePhoneResult = validatePhone(phone);
    if (validatePhoneResult !== "") {
      return res.status(400).json(validatePhoneResult);
    }
    if (IS_MOCK) {
      const data = {
        return_code: 1,
        return_message: "Success",
        sub_return_code: 1,
        sub_return_message: "Success",
        data: {
          name: "Longhb",
          phone: phone,
          m_u_id: uuid(),
        }
      };
      return res.json(data);
    }
    const time = Date.now();
    const message = [appId, phone, time].join("|");
    const mac = crypto.HmacSHA256(message, process.env.REACT_APP_KEY1).toString();

    const response = await fetch(`${SANDBOX_URL}/v2/disbursement/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ app_id: appId, phone, time, mac })
    });
    return res.json(await response.json());
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Get merchant balance
app.post(`${API_BASE_PATH}/disbursement/balance`, async (req, res) => {
  try {
    console.log("Received get balance request", req.body);

    if (IS_MOCK) {
      const data = {
        return_code: 1,
        return_message: "Success",
        sub_return_code: 1,
        sub_return_message: "Success",
        data: {
          balance: 100000,
        }
      };
      return res.json(data);
    }

    const time = Date.now();
    const message = [appId, paymentId, time].join("|");
    const mac = crypto.HmacSHA256(message, process.env.REACT_APP_KEY1).toString();
    const response = await fetch(`${SANDBOX_URL}/v2/disbursement/balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ app_id: appId, payment_id: paymentId, time, mac })
    });
    return res.json(await response.json());
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Topup
app.post(`${API_BASE_PATH}/disbursement/topup`, async (req, res) => {
  try {
    console.log("Received topup request", req.body);

    const partnerOrderId = req.body.partner_order_id;
    if (!partnerOrderId || partnerOrderId.trim().length === 0) {
      return res.status(400).json("partner_order_id field is required");
    }
    const mUId = req.body.m_u_id;
    if (!mUId || mUId.trim().length === 0) {
      return res.status(400).json("m_u_id field is required");
    }
    const amount = req.body.amount;
    const validateAmountResult = validateAmount(amount);
    if (validateAmountResult !== "") {
      return res.status(400).json(validateAmountResult);
    }

    const description = req.body.description ?? "";
    const partnerEmbedData = req.body.partner_embed_data ?? "{}";
    const extraInfo = req.body.extra_info ?? "{}";
    const time = Date.now();

    if (IS_MOCK) {
      const data = {
        return_code: 1,
        return_message: "Success",
        sub_return_code: 1,
        sub_return_message: "Success",
        data: {
          order_id: partnerOrderId,
          status: 3,
          m_u_id: mUId,
          phone: "0123456789",
          amount: amount,
          description: description,
          partner_fee: 0,
          extra_info: extraInfo,
          time: time,
        }
      };
      return res.json(data);
    }
    const message = [appId, paymentId, partnerOrderId, mUId, amount, description, partnerEmbedData, extraInfo, time].join("|");
    const mac = crypto.HmacSHA256(message, process.env.REACT_APP_KEY1).toString();
    const msg = Buffer.from(mac);
    const secretKey = process.env.REACT_APP_PRIVATE_KEY;
    const privateKey = Buffer.from(secretKey);
    const key = new rsa(privateKey, 'pkcs8');
    const signed = key.sign(msg, 'base64', 'utf8');

    const topupReq = {
      app_id: appId,
      payment_id: paymentId,
      partner_order_id: partnerOrderId,
      m_u_id: mUId,
      amount: amount,
      description: description,
      partner_embed_data: partnerEmbedData,
      extra_info: extraInfo,
      time: time,
      sig: signed,
    };

    const response = await fetch(`${SANDBOX_URL}/v2/disbursement/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(topupReq)
    });
    return res.json(await response.json());
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Query order status
app.post(`${API_BASE_PATH}/disbursement/txn`, async (req, res) => {
  try {
    console.log("Received query order status request", req.body);
    const partnerOrderId = req.body.partner_order_id;
    if (!partnerOrderId || partnerOrderId.trim().length === 0) {
      return res.status(400).json("partner_order_id field is required");
    }
    const time = Date.now();

    if (IS_MOCK) {
      const data = {
        return_code: 1,
        return_message: "Success",
        sub_return_code: 1,
        sub_return_message: "Success",
        data: {
          order_id: partnerOrderId,
          status: 1,
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
      return res.json(data);
    }
    const message = [appId, partnerOrderId, time].join("|");
    const mac = crypto.HmacSHA256(message, process.env.REACT_APP_KEY1).toString();
    const queryPaymentStatusReq = {
      app_id: appId,
      partner_order_id: partnerOrderId,
      time: time,
      mac: mac,
    };
    const response = await fetch(`${SANDBOX_URL}/v2/disbursement/txn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPaymentStatusReq)
    });
    return res.json(await response.json());
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
