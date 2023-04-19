import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { retrieveBalance, retrieveReceivingAccount, submitPay } from "../../app/paymentSlice";
import CryptoJS from "crypto-js";
import { formatVND } from "../../app/util/helpers";

export const PayrollRequestContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [balance, setBalance] = useState("");

  const handlePhoneOnChange = (event) => {
    const phoneNo = event.target.value;
    setPhone(phoneNo);
  };

  const handleAmountOnChange = (event) => {
    const amount = event.target.value.toString().replace(",", "");
    setAmount(amount);
  };

  const appId = parseInt(process.env.REACT_APP_APP_ID);
  const paymentId = process.env.REACT_APP_PAYMENT_ID;

  const validateAmount = () => {
    if (amount.length <= 0) {
      setAmountError("Amount is required");
      return false;
    }
    if (isNaN(amount)) {
      setAmountError("Amount must be a number");
      return false;
    }
    setAmountError("");
    return true;
  }

  const validatePhone = () => {
    if (phone.length <= 0) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (isNaN(phone)) {
      setPhoneError("Phone must be a number");
      return false;
    }
    if (phone.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  }

  const isValid = () => {
    return validatePhone() && validateAmount();
  }

  const handlePayOnClick = (event) => {
    // validate form data
    const isFormDataValid = isValid();
    if (!isFormDataValid) {
      return;
    }

    dispatch(submitPay({ phone, amount }));

    const time = Date.now();
    const message = [appId, phone, time].join("|");
    const mac = CryptoJS.HmacSHA256(message, process.env.REACT_APP_HMAC_KEY).toString();
    dispatch(retrieveReceivingAccount({ app_id: appId, phone, time, mac }))
      .unwrap()
      .then(res => {
        const hasNotAccount = res.return_code !== 1 && res.sub_return_code === -101;
        if (hasNotAccount) {
          setPhoneError("Phone number has not wallet account");
          return;
        }
        navigate(`/confirm`, { replace: true });
      })
      .catch(e => {
        console.log(e);
      });
  };

  useEffect(() => {
    const time = Date.now();
    const message = [appId, paymentId, time].join("|");
    const mac = CryptoJS.HmacSHA256(message, process.env.REACT_APP_HMAC_KEY).toString();
    dispatch(retrieveBalance({ app_id: appId, payment_id: paymentId, time, mac }))
      .unwrap()
      .then(res => {
        console.log(res);
        setBalance(res.data.balance);
      })
      .catch(e => {
        console.log(e);
      });
  }, [dispatch]);

  return (
    <main>
      <section className="payroll">
        <h2>Payroll Request</h2>
        <div>
          <div className="payment-info-item">
            <p className="payment-info-item-left"> Merchant ID</p>
            <p className="payment-info-item-right"> {appId}</p>
          </div>
          <div className="payment-info-item">
            <p className="payment-info-item-left"> Payment ID</p>
            <p className="payment-info-item-right"> {paymentId}</p>
          </div>
          <div className="payment-info-item">
            <p className="payment-info-item-left"> Balance</p>
            <p className="payment-info-item-right"> {formatVND(balance)}</p>
          </div>
          <h5 className="heading">Payment Info</h5>
          <div className="payment-form">
            <div className="payment-form-field">
              <p className="payment-info-item-left"> Phone No.</p>
              <div className="payment-info-item-right">
                <input
                  type="tel"
                  className="phone"
                  placeholder="090xxxxxxx"
                  value={phone}
                  onChange={handlePhoneOnChange}
                />
                {phoneError &&
                  <p className="error-message">{phoneError}</p>
                }
              </div>
            </div>
            <div className="payment-form-field">
              <p className="payment-info-item-left"> Amount</p>
              <div>
                <div>
                  <input
                    type="text"
                    className="payment-form-field-input, amount"
                    placeholder="1000xxx"
                    value={amount ? formatVND(amount) : ""}
                    onChange={handleAmountOnChange}
                  />
                  <span> VNĐ</span>
                </div>
                {amountError &&
                  <p className="error-message">{amountError}</p>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="payroll-footer">
          <button className="button" onClick={handlePayOnClick}>
            Pay
          </button>
        </div>
      </section>
    </main >
  );
}
