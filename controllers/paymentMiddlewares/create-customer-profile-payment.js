import pkg from "authorizenet";
const { APIContracts, APIControllers } = pkg;

export function createCustomerPaymentProfile(customerProfileId,userInfo, callback) {

  var merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(process.env.AUTH_NET_API_LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(process.env.AUTH_NET_TRANSACTION_KEY);

	var creditCard = new APIContracts.CreditCardType();
	creditCard.setCardNumber(userInfo.cardNumber);
	creditCard.setExpirationDate('0925');

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

	var profile = new APIContracts.CustomerPaymentProfileType();
	profile.setBillTo(customerAddress);
	profile.setPayment(paymentType);

	var createRequest = new APIContracts.CreateCustomerPaymentProfileRequest();

	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setCustomerProfileId(customerProfileId);
	createRequest.setPaymentProfile(profile);
	var ctrl = new APIControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.CreateCustomerPaymentProfileResponse(apiResponse);

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK)
			{
				console.log('createCustomerPaymentProfile: Successfully created a customer payment profile with id: ' + response.getCustomerPaymentProfileId());
			}
			else
			{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			var apiError = ctrl.getError();
			console.log(apiError);
			console.log('Null response received');
		}

		callback(response);
	});
}
