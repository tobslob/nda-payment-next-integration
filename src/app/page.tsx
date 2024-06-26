"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";

declare global {
  interface Window {
    dnaPayments: {
      hostedFields: {
        create: (options: any) => Promise<any>;
      };
    };
  }
}

console.log(window);

const INVOICE_ID = generateInvoiceId();
const TERMINAL = "8911a14f-61a3-4449-a1c1-7a314ee5774c";
const AMOUNT = 5.88;
const PAYMENT_DATA = getPaymentData();

const IndexPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  // const [modal, setModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = async () => {
    try {
      const response = await axios.post(
        "https://test-api.dnapayments.com/v1/oauth2/test-token",
        {
          terminal: TERMINAL,
          invoiceId: INVOICE_ID,
          amount: AMOUNT,
          currency: "GBP",
          scope:
            "payment integration_hosted integration_embedded integration_seamless",
        }
      );
      // Handle response here
      console.log(response.data);
      initializeHostedFields(response.data.access_token);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  const initializeHostedFields = async (accessToken: string) => {
    const cardholderName = document.querySelector("#hf-name");
    const cardNumber = document.querySelector("#hf-number");
    const cardDate = document.querySelector("#hf-date");
    const cardCvv = document.querySelector("#hf-cvv");
    const successAlert = document.querySelector("#success");
    const failedAlert = document.querySelector("#failed");
    const errorsAlert = document.querySelector("#errors");

    const threeDSecureModal = document.querySelector("#threeDSecureModal");
    const threeDSecureModalContent = document.querySelector(
      "#threeDSecureModalContent"
    );

    const payBtn = document.querySelector("#pay-btn");

    console.log(
      cardholderName,
      cardNumber,
      cardDate,
      cardCvv,
      payBtn,
      threeDSecureModal,
      threeDSecureModalContent
    );

    let attemptCount = 0,
      sendCallbackEveryFailedAttempt = 3;

    if (
      !cardholderName ||
      !cardNumber ||
      !cardDate ||
      !cardCvv ||
      !threeDSecureModal ||
      !threeDSecureModalContent ||
      !payBtn
    ) {
      console.error("Failed to find all required DOM elements.");
      // return;
    }

    const hf = await window.dnaPayments.hostedFields.create({
      isTest: true,
      accessToken: accessToken,
      styles: {
        input: {
          "font-size": "14px",
          "font-family": "Open Sans",
        },
        ".valid": {
          color: "green",
        },
        ".invalid": {
          color: "red",
        },
      },
      threeDSecure: {
        container: threeDSecureModalContent,
      },
      fontNames: ["Open Sans"],
      fields: {
        cardholderName: {
          container: cardholderName,
          placeholder: "Cardholder name",
        },
        cardNumber: {
          container: cardNumber,
          placeholder: "Card number",
        },
        expirationDate: {
          container: cardDate,
          placeholder: "Expiry date",
        },
        cvv: {
          container: cardCvv,
          placeholder: "CSC/CVV",
        },
      },
    });

    console.log("HFFFFFFF", hf);
    // .then((res) => {
    //   hf = res;

    //   hf.on("dna-payments-three-d-secure-show", (data: any) => {
    //     console.log("show", data);
    //     setModal(true);
    //   });

    //   hf.on("dna-payments-three-d-secure-hide", () => {
    //     console.log("hides");
    //     setModal(false);
    //   });

    //   payBtn?.addEventListener("click", () => {
    //     startLoading();
    //     // clear();
    //     // submits card data to pay
    //     hf.submit({ paymentData: PAYMENT_DATA })
    //       .then((res: any) => {
    //         stopLoading();
    //         hf.clear(); // Clears payment fields (Cardholder name, Credit card number, expiration date, cvv)
    //         showResult(true);
    //         console.log("res", res);
    //       })
    //       .catch((err: { code: string; message: string | undefined }) => {
    //         stopLoading();
    //         if (err.code === "NOT_VALID_CARD_DATA") {
    //           showResult(false, err.message);
    //         } else {
    //           attemptCount++;
    //           showResult(false, err.message);
    //           if (
    //             sendCallbackEveryFailedAttempt &&
    //             attemptCount >= sendCallbackEveryFailedAttempt
    //           ) {
    //             alert("Callback has been sent");
    //             attemptCount = 0;
    //           }
    //           hf.clear();
    //         }
    //         console.log("err", err);
    //       });
    //   });
    // })
    // .catch((e) => {
    //   setError(JSON.stringify(e, null, 2));
    // });
  };

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const showResult = (isSuccess: boolean, text?: string) => {
    if (isSuccess) {
      alert("Payment was successful");
    } else {
      alert(text || "Payment was unsuccessful");
    }
  };

  return (
    <div className="container mt-5">
      <Head>
        <title>DNA Payment</title>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        />
      </Head>
      <form className="container">
        <h1>DNA PAYMENT</h1>
        <br />
        <div id="loader" className={loading ? "" : "hidden"}>
          Loading token ....
        </div>
        <div id="hosted-fields" className={!loading ? "" : "hidden"}>
          {/* Hosted fields and other HTML structure */}

          <div id="hf-name" className="form-control"></div>

          <div id="hf-number" className="form-control"></div>

          <div id="hf-date" className="form-control"></div>

          <div id="hf-cvv" className="form-control"></div>

          <button
            id="pay-btn"
            className="btn btn-success"
            type="submit"
            value="Pay"
          />
        </div>
        <div className="row">
          <div id="success" className="alert alert-success hidden" role="alert">
            Payment was successful
          </div>
          <div id="failed" className="alert alert-danger hidden" role="alert">
            Payment was unsuccessful
          </div>
          <pre
            id="errors"
            className="alert alert-danger hidden"
            role="alert"
          ></pre>
        </div>
      </form>

      {/* {modal && ( */}
      <div
        className="modal fade"
        id="threeDSecureModal"
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title" id="myModalLabel">
                Three D Secure
              </h4>
            </div>
            <div className="modal-body" id="threeDSecureModalContent"></div>
          </div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default IndexPage;

function generateInvoiceId() {
  return new Date().getTime().toString();
}

function getPaymentData() {
  return {
    currency: "GBP",
    description: "Car Service",
    paymentSettings: {
      terminalId: TERMINAL,
      returnUrl: "https://test-pay.dnapayments.com/checkout/success.html",
      failureReturnUrl:
        "https://test-pay.dnapayments.com/checkout/failure.html",
      callbackUrl: "https://pay.dnapayments.com/checkout",
      failureCallbackUrl: "https://testmerchant/order/1123/fail",
    },
    customerDetails: {
      accountDetails: {
        accountId: "uuid000001",
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        addressLine1: "Fulham Rd",
        postalCode: "SW6 1HS",
        city: "London",
        country: "GB",
      },
      deliveryDetails: {
        deliveryAddress: {
          firstName: "John",
          lastName: "Doe",
          addressLine1: "Fulham Rd",
          addressLine2: "Fulham",
          postalCode: "SW6 1HS",
          city: "London",
          phone: "0475662834",
          country: "GB",
        },
      },
      email: "demo@dnapayments.com",
    },
    deliveryType: "service",
    invoiceId: INVOICE_ID,
    amount: AMOUNT,
  };
}
