
import pkg from "authorizenet";
const { APIContracts, APIControllers } = pkg;
export function validateCustomerPaymentProfile(customerProfileId, customerPaymentProfileId, callback) {

  	var merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  	merchantAuthenticationType.setName(process.env.AUTH_NET_API_LOGIN_ID);
  	merchantAuthenticationType.setTransactionKey(process.env.AUTH_NET_TRANSACTION_KEY);

	var validateRequest = new APIContracts.ValidateCustomerPaymentProfileRequest();
	validateRequest.setMerchantAuthentication(merchantAuthenticationType);
	validateRequest.setCustomerProfileId(customerProfileId);	
	validateRequest.setCustomerPaymentProfileId(customerPaymentProfileId);
	validateRequest.setValidationMode(APIContracts.ValidationModeEnum.LIVEMODE);
	validateRequest.setCardCode('122');

		
	var ctrl = new APIControllers.ValidateCustomerPaymentProfileController(validateRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.ValidateCustomerPaymentProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK)
			{
				console.log('Successfully validated the customer payment profile with id : ' + customerPaymentProfileId);
			}
			else
			{
				//console.log('Result Code: ' + response.getMessages().getResultCode());
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
