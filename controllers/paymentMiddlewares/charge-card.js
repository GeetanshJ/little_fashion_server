












import pkg from "authorizenet";
const { APIContracts, APIControllers } = pkg;

export function chargeCustomerProfile(addressInfo, cartInfo,customerProfileId, customerPaymentProfileId, callback) {
	var merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(process.env.AUTH_NET_API_LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(process.env.AUTH_NET_TRANSACTION_KEY);

	var profileToCharge = new APIContracts.CustomerProfilePaymentType();
	profileToCharge.setCustomerProfileId(customerProfileId);

	var paymentProfile = new APIContracts.PaymentProfile();
	paymentProfile.setPaymentProfileId(customerPaymentProfileId);
	profileToCharge.setPaymentProfile(paymentProfile);

	var orderDetails = new APIContracts.OrderType();
	orderDetails.setInvoiceNumber('INV-12345');
	orderDetails.setDescription('Product Description');

	const lineItemList = [];
	let totalAmount = 0;

	for (let i = 0; i < cartInfo.length; i++) {
		const item = cartInfo[i];
		const quantity = parseInt(item.qty);
		const price = parseInt(item.price);

		const lineItem = new APIContracts.LineItemType();
		lineItem.setItemId(item.id.toString());
		lineItem.setName(item.name.toString());
		lineItem.setDescription(item.description.toString());
		lineItem.setQuantity(quantity);
		lineItem.setUnitPrice(price);

		lineItemList.push(lineItem);
		totalAmount += quantity * price;
		
	}


	var lineItems = new APIContracts.ArrayOfLineItem();
	lineItems.setLineItem(lineItemList);


	const shipTo = new APIContracts.CustomerAddressType();
	shipTo.setFirstName(addressInfo.firstname);
	shipTo.setLastName(addressInfo.lastname);
	shipTo.setCompany("Demo");
	shipTo.setAddress(addressInfo.address);
	shipTo.setCity(addressInfo.city);
	shipTo.setState(addressInfo.state);
	shipTo.setZip(addressInfo.zip);
	shipTo.setCountry(addressInfo.country);

	var transactionRequestType = new APIContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setProfile(profileToCharge);
	transactionRequestType.setAmount(totalAmount);
	transactionRequestType.setLineItems(lineItems);
	transactionRequestType.setOrder(orderDetails);
	transactionRequestType.setShipTo(shipTo);

	var createRequest = new APIContracts.CreateTransactionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK){
				if(response.getTransactionResponse().getMessages() != null){
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if(response.getTransactionResponse().getErrors() != null){
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction. ');
				if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
				
					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			var apiError = ctrl.getError();
			console.log(apiError);
			console.log('Null Response.');
		}

		callback(response);
	});
}

