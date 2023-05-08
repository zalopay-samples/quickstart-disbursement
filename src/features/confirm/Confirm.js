import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { topup, queryPaymentStatus } from "../../app/paymentSlice";
import { uuid } from "uuidv4";
import { formatVND } from "../../app/util/helpers";

export const ConfirmContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const receivingAccount = useSelector(state => state.payment.receivingAccount);
  const { phone, name, mUid } = receivingAccount;
  const paymentFormData = useSelector(state => state.payment.paymentRequest);
  const amount = parseInt(paymentFormData.amount);

  const partnerOrderId = uuid().toString();

  // query payment status
  let queryPaymentStatusTry = 0;
  let queryPaymentStatusInterval = null;

  const buildTopupRequest = () => {
    const description = `Payment salary for ${name}`;
    const partnerEmbedData = "{\"store_id\":\"s2\",\"store_name\":\"name\"}";
    const extraInfo = "{}";

    return {
      partner_order_id: partnerOrderId,
      m_u_id: mUid,
      amount: amount,
      description: description,
      partner_embed_data: partnerEmbedData,
      extra_info: extraInfo,
    };
  };

  const isSucessful = (res) => {
    return res.return_code === 1 && res.data?.status === 1;
  }

  const isProcessing = (res) => {
    return res.return_code === 1 && res.data?.status === 3;
  }

  const clearAndNavigate = (url) => {
    clearInterval(queryPaymentStatusInterval);
    navigate(url, { replace: true });
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
          queryPaymentStatusInterval = setInterval(handleQueryPaymentStatus, 1000);
          return;
        }
        const errorMessage = res.sub_return_message || res.return_message;
        navigate(`/status/error?reason=${errorMessage}`, { replace: true });
      })
      .catch(e => {
        console.log(e);
      });
  };

  const handleQueryPaymentStatus = async () => {
    dispatch(queryPaymentStatus({ partner_order_id: partnerOrderId }))
      .unwrap()
      .then(res => {
        if (isSucessful(res)) {
          clearAndNavigate(`/status/success?reason=${name}`);
          return;
        }
        if (isProcessing(res) && queryPaymentStatusTry < 3) {
          queryPaymentStatusTry++;
          return;
        }
        const errorMessage = isProcessing(res) ? 'Payment status query is over 3 times' : res.sub_return_message || res.return_message;
        clearAndNavigate(`/status/error?reason=${errorMessage}`);
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
