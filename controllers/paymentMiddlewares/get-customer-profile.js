import pkg from "authorizenet";
const { APIContracts, APIControllers } = pkg;

export function getCustomerProfile(customerProfileId, callback) {

	var merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.AUTH_NET_API_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.AUTH_NET_TRANSACTION_KEY);

	var getRequest = new APIContracts.GetCustomerProfileRequest();
	getRequest.setCustomerProfileId(customerProfileId);
	getRequest.setMerchantAuthentication(merchantAuthenticationType);

		
	var ctrl = new APIControllers.GetCustomerProfileController(getRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.GetCustomerProfileResponse(apiResponse);


		if(response != null) 
		{
			if(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK)
			{
				console.log('Customer profile ID : ' + response.getProfile().getCustomerProfileId());
				console.log('Customer Email : ' + response.getProfile().getEmail());
				console.log('Description : ' + response.getProfile().getDescription());
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


