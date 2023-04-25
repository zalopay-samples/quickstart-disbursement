import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { retrieveBalance, retrieveReceivingAccount, submitPay } from "../../app/paymentSlice";
import { formatVND, validateAmount, validatePhone } from "../../app/util/helpers";

export const PayrollRequestContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [balance, setBalance] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const appId = parseInt(process.env.REACT_APP_APP_ID);
  const paymentId = process.env.REACT_APP_PAYMENT_ID;

  const handlePhoneOnChange = (event) => {
    const phoneNo = event.target.value;
    setPhone(phoneNo);
  };

  const handleAmountOnChange = (event) => {
    const amount = event.target.value.toString().replaceAll(",", "");
    setAmount(amount);
  };

  const isValidAmount = () => {
    const validateAmountResult = validateAmount(amount);
    setAmountError(validateAmountResult);
    if (validateAmountResult !== "") {
      return false;
    }
    if(amount > balance) {
      setAmountError("Current balance is not enough for targe amount");
      return false;
    }
    return true;
  }

  const isValidPhoneNumber = () => {
    const validatePhoneResult = validatePhone(phone);
    setPhoneError(validatePhoneResult);
    if (validatePhoneResult !== "") {
      return false;
    }
    return true;
  }

  const isFormDataValid = () => {
    return isValidPhoneNumber() && isValidAmount();
  }

  const handlePayOnClick = (event) => {
    if (!isFormDataValid()) {
      return;
    }
    dispatch(submitPay({ phone, amount }));
    dispatch(retrieveReceivingAccount({ phone }))
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
    dispatch(retrieveBalance())
      .unwrap()
      .then(res => {
        setBalance(res.data.balance);
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

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
            <p className="payment-info-item-right"> {formatVND(balance)} VNĐ</p>
          </div>
          <h5 className="heading">Payment Info</h5>
          <div className="payment-form">
            <div className="payment-form-field">
              <p className="payment-info-item-left"> Phone No.</p>
              <div className="payment-info-item-right">
                <input
                  type="tel"
                  className="phone"
                  placeholder="Enter phone number"
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
                    placeholder="Enter amount"
                    value={amount ? formatVND(amount) : ""}
                    onChange={handleAmountOnChange}
                  />
                  <span>VNĐ</span>
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
