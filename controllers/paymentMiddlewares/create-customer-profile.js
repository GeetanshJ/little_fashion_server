import pkg from "authorizenet";
const { APIContracts, APIControllers } = pkg;
export async function createCustomerProfile(userInfo, callback) {

  // it wil generate 5 length random string for unique merchant customer id and description

  function generateString() {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  var merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(process.env.AUTH_NET_API_LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(
    process.env.AUTH_NET_TRANSACTION_KEY
  );

  const creditCard = new APIContracts.CreditCardType();
  creditCard.setCardNumber(userInfo.cardNumber);
  creditCard.setExpirationDate("0925");

  var paymentType = new APIContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  var customerAddress = new APIContracts.CustomerAddressType();
  customerAddress.setFirstName(userInfo.firstname);
  customerAddress.setLastName(userInfo.lastname);
  customerAddress.setAddress(userInfo.address);
  customerAddress.setCity(userInfo.city);
  customerAddress.setState(userInfo.state);
  customerAddress.setZip(userInfo.zip);
  customerAddress.setCountry(userInfo.country);
  customerAddress.setPhoneNumber(userInfo.phone);

  var customerPaymentProfileType =
    new APIContracts.CustomerPaymentProfileType();
  customerPaymentProfileType.setCustomerType(
    APIContracts.CustomerTypeEnum.INDIVIDUAL
  );
  customerPaymentProfileType.setPayment(paymentType);
  customerPaymentProfileType.setBillTo(customerAddress);

  var paymentProfilesList = [];
  paymentProfilesList.push(customerPaymentProfileType);

  var customerProfileType = new APIContracts.CustomerProfileType();
  customerProfileType.setMerchantCustomerId(
    "MC" + generateString()
  );
  customerProfileType.setDescription(
    "DESC" + generateString()
  );
  customerProfileType.setEmail(userInfo.email);
  customerProfileType.setPaymentProfiles(paymentProfilesList);

  var createRequest = new APIContracts.CreateCustomerProfileRequest();
  createRequest.setProfile(customerProfileType);
  createRequest.setValidationMode(APIContracts.ValidationModeEnum.TESTMODE);
  createRequest.setMerchantAuthentication(merchantAuthenticationType);



  var ctrl = new APIControllers.CreateCustomerProfileController(
    createRequest.getJSON()
  );

  ctrl.execute(function () {
    var apiResponse = ctrl.getResponse();

    if (apiResponse != null)
      var response = new APIContracts.CreateCustomerProfileResponse(
        apiResponse
      );

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        APIContracts.MessageTypeEnum.OK
      ) {
        console.log(
          "Successfully created a customer profile with id: " +
            response.getCustomerProfileId()
        );
      } else {
        console.log("Result Code: " + response.getMessages().getResultCode());
        console.log(
          "Error Code: " + response.getMessages().getMessage()[0].getCode()
        );
        console.log(
          "Error message: " + response.getMessages().getMessage()[0].getText()
        );
      }
    } else {
      var apiError = ctrl.getError();
      console.log(apiError);
      console.log("Null response received");
    }

    callback(response);
  });
}
