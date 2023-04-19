import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { topup, queryPaymentStatus } from "../../app/paymentSlice";
import { Buffer } from "buffer";
import NodeRSA from 'node-rsa';
import { uuid } from "uuidv4";
import { formatVND } from "../../app/util/helpers";

export const ConfirmContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const receivingAccount = useSelector(state => state.payment.receivingAccount);
  const { phone, name, mUid } = receivingAccount;
  const paymentFormData = useSelector(state => state.payment.paymentRequest);
  const amount = parseInt(paymentFormData.amount);

  const appId = parseInt(process.env.REACT_APP_APP_ID);
  const paymentId = process.env.REACT_APP_PAYMENT_ID;
  const partnerOrderId = uuid().toString();

  // query payment status
  let queryPaymentStatusTry = 0;
  let queryPaymentStatusInterval = null;

  const buildTopupRequest = () => {
    // setup topup request data
    const appId = parseInt(process.env.REACT_APP_APP_ID);
    const paymentId = process.env.REACT_APP_PAYMENT_ID;
    const description = `Payment salary for ${name}`;
    const partnerEmbedData = "{\"store_id\":\"s2\",\"store_name\":\"name\"}";
    const extraInfo = "{}";
    const time = Date.now();
    const message = [appId, paymentId, partnerOrderId, mUid, amount, description, partnerEmbedData, extraInfo, time].join("|");

    const mac = CryptoJS.HmacSHA256(message, process.env.REACT_APP_HMAC_KEY).toString();
    const msg = Buffer.from(mac);
    const secretKey = process.env.REACT_APP_PRIVATE_KEY;
    const privateKey = Buffer.from(secretKey);
    const key = new NodeRSA(privateKey, 'pkcs8');
    const signed = key.sign(msg, 'base64', 'utf8');

    return {
      app_id: appId,
      payment_id: paymentId,
      partner_order_id: partnerOrderId,
      m_u_id: mUid,
      amount: amount,
      description: description,
      partner_embed_data: partnerEmbedData,
      extra_info: extraInfo,
      time: time,
      sig: signed,
    };
  };

  const isSucessful = (res) => {
    return res.return_code === 1 && res.data?.status === 1;
  }

  const isProcessing = (res) => {
    return res.return_code === 1 && res.data?.status === 3;
  }

  const handleConfirm = (event) => {
    dispatch(topup(buildTopupRequest()))
      .unwrap()
      .then(res => {
        if (isSucessful(res)) {
          navigate(`/status/success?reason=${name}`, { replace: true });
          return;
        }

        if (isProcessing(res)) {
          queryPaymentStatusInterval = setInterval(handleQueryPaymentStatus, 10000);
          return;
        }
        const errorMessage = res.sub_return_message || res.return_message;
        navigate(`/status/error?reason=${errorMessage}`, { replace: true });
      })
      .catch(e => {
        console.log(e);
      });
  };

  const buildQueryPaymentStatusRequest = () => {
    const time = Date.now();
    const message = [appId, partnerOrderId, time].join("|");
    const mac = CryptoJS.HmacSHA256(message, process.env.REACT_APP_HMAC_KEY).toString();

    return {
      app_id: appId,
      partner_order_id: partnerOrderId,
      time: time,
      mac: mac,
    };
  };

  const handleQueryPaymentStatus = async () => {
    dispatch(queryPaymentStatus(buildQueryPaymentStatusRequest()))
      .unwrap()
      .then(res => {
        if (isSucessful(res)) {
          clearInterval(queryPaymentStatusInterval);
          navigate(`/status/success?reason=${name}`, { replace: true });
          return;
        }

        if (isProcessing(res)) {
          if (queryPaymentStatusTry <= 3) {
            queryPaymentStatusTry++;
          } else {
            clearInterval(queryPaymentStatusInterval);
            const timoutMessage = 'Payment status query is over 3 times';
            navigate(`/status/error?reason=${timoutMessage}`, { replace: true });
          }
          return;
        }

        const errorMessage = res.sub_return_message || res.return_message;
        navigate(`/status/error?reason=${errorMessage}`, { replace: true });
        clearInterval(queryPaymentStatusInterval);
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <main>
      <section className="payroll">
        <h2>Confirm Pay</h2>
        <div>
          <div className="payment-info-item">
            <p className="payment-info-item-left">Receiver </p>
            <span className="payment-info-item-right">{name}</span>
          </div>
          <div className="payment-info-item">
            <p className="payment-info-item-left">Phone No.</p>
            <p className="payment-info-item-right">{phone}</p>
          </div>
          <div className="payment-info-item">
            <p className="payment-info-item-left">Amount</p>
            <p className="payment-info-item-right">{formatVND(amount)} VNĐ</p>
          </div>
        </div>
        <div className="payroll-footer">
          <button className="button" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </section>
    </main>
  );
}
