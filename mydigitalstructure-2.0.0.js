/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 */

var mydigitalstructure = {_scope: {}};

mydigitalstructure.init = function (callback, callview, options)
{
	mydigitalstructure.callview = callview;
	mydigitalstructure._scope.options = options;

	var assistController = mydigitalstructure._util.param.get(options, 'assistMeWithBehavior').value;

	mydigitalstructure._util.init(
	{
		callback: callback,
		controller: assistController
	});
}

mydigitalstructure.auth = function (logon, password, callback, code)
{
	if (mydigitalstructure._scope.logonInitialised)
	{
		mydigitalstructure._util.logon.send(
		{
			logon: logon,
			password: password,
			callback: callback,
			code: code
		});
	}
	else
	{
		mydigitalstructure._util.logon.init(
		{
			logon: logon,
			password: password,
			callback: callback
		});
	}	
}

mydigitalstructure.create = function (object, data, callback)
{
	var endpoint = object.split('_')[0];	

	mydigitalstructure._util.send(
	{
		object: object,
		data: data,
		callback: callback,
		type: 'POST',
		url: '/rpc/' + endpoint + '/?method=' + (object).toUpperCase() + '_MANAGE',
	});
}

mydigitalstructure.retrieve = function (object, data, callback)
{
	var endpoint = object.split('_')[0];	

	if (typeof data != 'object')
	{
		data = {id: data}

		//get all parameters from model json
	}

	mydigitalstructure._util.send(
	{
		object: object,
		data: data,
		callback: callback,
		type: 'GET',
		url: '/rpc/' + endpoint + '/?method=' + (object).toUpperCase() + '_SEARCH&advanced=1',
	});

}

mydigitalstructure.update = function (object, data, callback)
{

	var endpoint = object.split('_')[0];

	mydigitalstructure._util.send(
	{
		object: object,
		data: data,
		callback: callback,
		type: 'POST',
		url: '/rpc/' + endpoint + '/?method=' + (object).toUpperCase() + '_MANAGE',
	});

}

mydigitalstructure.delete = function (object, data, callback)
{
	if (typeof data != 'object')
	{
		data = {id: data}
	}

	data.remove = 1;

	mydigitalstructure._util.send(
	{
		object: object,
		data: data,
		callback: callback,
		type: 'POST',
		url: '/rpc/' + endpoint + '/?method=' + (object).toUpperCase() + '_MANAGE',
	});

}

mydigitalstructure.help = function ()
{
	return mydigitalstructure._scope
}

mydigitalstructure._util =
{
	hash: 		function(sValue)
				{
					//requires /jscripts/md5-min.js
					
					if (sValue !== undefined)
					{	
						return hex_md5(sValue);
					}	
				},

	sendToView: function(oParam)
				{
					if (mydigitalstructure.callview) {mydigitalstructure.callview(oParam)};
				},

	doCallBack: function(callback, oParam)
				{
					if (callback) {callback(oParam)};
				},

	loadScript: function (sScript)
				{
					var xhtmlHeadID = document.getElementsByTagName("head")[0]; 
					var oScript = document.createElement('script');
					oScript.type = 'text/javascript';
					oScript.src = sScript;
					xhtmlHeadID.appendChild(oScript);
				},			

	init: 		function(oParam)
				{
					$.ajaxSetup(
					{
						cache: false,
						dataType: 'json',
						global: true
					});

					if (mydigitalstructure._objects == undefined)
					{	
						mydigitalstructure._util.loadScript('/jscripts/md5-min.js')

						$.ajax(
						{
							type: 'GET',
							url: '/site/1745/mydigitalstructure.model.objects-1.0.0.json',
							dataType: 'json',
							success: 	function(data)
										{
											mydigitalstructure._objects = data.objects
											mydigitalstructure._util.init(oParam)
										}
						});

						if (mydigitalstructure._util.param.get(oParam, 'controller', {"default": false}).value)
						{
							$(document).on('click', '#myds-logon', function(event) {console.log(event)})
						}	
					}	
					else
					{	
						var callback = mydigitalstructure._util.param.get(oParam, 'callback').value;

						mydigitalstructure._util.sendToView({status: 'request-start'});

						$.ajax(
						{
							type: 'GET',
							url: '/rpc/core/?method=CORE_GET_USER_DETAILS',
							dataType: 'json',
							cache: false,
							global: false,
							success: function(data) 
							{
								mydigitalstructure._util.sendToView({status: 'request-end'});

								if (data.status === 'ER')
								{
									mydigitalstructure._scope.logonKey = data.logonkey;
									mydigitalstructure._util.doCallBack(callback, {isLoggedOn: false});
								}
								else
								{
									mydigitalstructure._scope.user = data;
									mydigitalstructure._util.doCallBack(callback, {isLoggedOn: true});
								}		
							}
						});	
					}

					
				},					

	logon: 		{
					init:		function(oParam)
								{
									var logon = mydigitalstructure._util.param.get(oParam, 'logon').value;
									var password = mydigitalstructure._util.param.get(oParam, 'password').value;
									var callback = mydigitalstructure._util.param.get(oParam, 'callback').value;
									var code = mydigitalstructure._util.param.get(oParam, 'code').value;

									var oData = 
									{
										method: 'LOGON_GET_USER_AUTHENTICATION_LEVEL',
										logon: logon
									};	

									oData.passwordhash = mydigitalstructure._util.hash(logon + password);
									
									mydigitalstructure._util.sendToView({status: 'request-start'});
										
									$.ajax(
									{
										type: 'POST',
										url: '/rpc/logon/',
										data: oData,
										global: false,
										dataType: 'json',
										success: function (data)
										{
											mydigitalstructure._util.sendToView({status: 'request-end'});

											mydigitalstructure._scope.authenticationLevel = data.authenticationlevel;
											mydigitalstructure._scope.authenticationDelivery = (data.authenticationdelivery==1?'email':'SMS');

											if (mydigitalstructure._scope.authenticationLevel == '3')
											{	
												mydigitalstructure._util.sendToView({message: 'A logon code is being sent to you via ' + mydigitalstructure._scope.authenticationDelivery + '.'});

												var oData = 
												{
													method: 'LOGON_SEND_PASSWORD_CODE',
													logon: logon
												};

												oData.passwordhash = mydigitalstructure._util.hash({value: logon + password + mydigitalstructure._scope.logonKey});

												mydigitalstructure._util.sendToView({status: 'request-start'});

												$.ajax(
												{
													type: 'POST',
													url: '/rpc/logon/',
													data: oData,
													global: false,
													dataType: 'json',
													success: function (data)
													{
														mydigitalstructure._util.sendToView({status: 'request-end'});

														if (data.status == 'OK')
														{	
															mydigitalstructure._scope.logonInitialised = true;
															mydigitalstructure._util.doCallBack(callback, {status: 'get2ndFactorCode', codeDelivery: mydigitalstructure._scope.authenticationDelivery});
														}
														else
														{
															mydigitalstructure._util.sendToView(
															{
																status: 'error',
																message: 'There is an issue with your user account (' + data.error.errornotes + ').'
															});
		
															mydigitalstructure._util.doCallBack(callback, {status: 'error'});
														}	
													}
												});		
											}
											else
											{	
												mydigitalstructure._util.logon.send(oParam);
											}
										}	
									});
								},

					send: 		function (oParam)
								{
									var iAuthenticationLevel = mydigitalstructure._scope.authenticationLevel;
									var logon = mydigitalstructure._util.param.get(oParam, 'logon').value;
									var password = mydigitalstructure._util.param.get(oParam, 'password').value;
									var code = mydigitalstructure._util.param.get(oParam, 'code').value;
									var callback = mydigitalstructure._util.param.get(oParam, 'callback').value;

									var oData = 
									{
										method: 'LOGON',
										logon: logon
									}	

									if (iAuthenticationLevel == 1)
									{
										oData.passwordhash = mydigitalstructure._util.hash(logon + password);
									}
									else if (iAuthenticationLevel == 2)
									{
										oData.passwordhash = mydigitalstructure._util.hash(logon + password + mydigitalstructure._scope.logonKey)
									}
									else if (iAuthenticationLevel == 3)
									{
										oData.passwordhash = mydigitalstructure._util.hash(logon + password + mydigitalstructure._scope.logonKey + code)
									}
									
									mydigitalstructure._util.sendToView({status: 'request-start'});
									
									$.ajax(
									{
										type: 'POST',
										url: '/rpc/logon/',
										global: false,
										data: oData,
										dataType: 'json',
										success: function (data)	
										{		
											if (data.status === 'ER')
											{
												mydigitalstructure._util.sendToView(
												{
													status: 'error',
													message: 'Logon name or password is incorrect.'
												});

												mydigitalstructure._util.doCallBack(callback, {status: 'ER'});
											}
											else 
											{			
												mydigitalstructure._scope.sid = data.sid;
												mydigitalstructure._scope.logonKey = data.logonkey;								
												mydigitalstructure._util.doCallBack(callback, {status: data.passwordStatus});
											}
										}
									})
								}
				},

	param: 		{
					get: 		function(oParam, sParam, oOption)
								{
									var oReturn = {exists: false};

									if (oParam !== undefined) 
									{ 
										var sDefault = mydigitalstructure._util.param.get(oOption, 'default').value;
										var sSplit = mydigitalstructure._util.param.get(oOption, 'split').value;
										var iIndex = mydigitalstructure._util.param.get(oOption, 'index').value;
										var bRemove = mydigitalstructure._util.param.get(oOption, 'remove').value;	
									
										if (oParam.hasOwnProperty(sParam))
										{
											oReturn.value = oParam[sParam];
											oReturn.exists = true;

											if (iIndex !== undefined && sSplit === undefined) {sSplit = '-'}

											if (sSplit !== undefined)
											{
												if (oParam[sParam] !== undefined)
												{	
													oReturn.values = oParam[sParam].split(sSplit);

													if (iIndex !== undefined)
													{
														if (iIndex < oReturn.values.length)
														{
															oReturn.value = oReturn.values[iIndex];
														}
													}
												}	
											}

											if (bRemove) {delete oParam[sParam]};
										}
									}	

									return oReturn;
								}						
				},

	send: 		function(oParam)
				{
					var object = mydigitalstructure._util.param.get(oParam, 'object').value;
					var data = mydigitalstructure._util.param.get(oParam, 'data').value;
					var callback = mydigitalstructure._util.param.get(oParam, 'callback').value;
					var url = mydigitalstructure._util.param.get(oParam, 'url').value;
					var type = mydigitalstructure._util.param.get(oParam, 'type').value;

					mydigitalstructure._util.sendToView({status: 'request-start'});

					$.ajax(
					{
						type: type,
						url: url,
						dataType: 'json',
						cache: false,
						data: data,
						success: function(data) 
						{
							mydigitalstructure._util.sendToView({status: 'request-end'});
							mydigitalstructure._util.doCallBack(callback, data);
						}
					});	
				},

	search:  	{	
					init: 		function ()
								{
									var oCriteria = 
									{
										"fields": [],
										"summaryFields": [],
										"filters": [],
										"sorts": [],
										"options": {},
										"customoptions": []
									}

									return oCriteria
								},

					comparison: function ()
								{
									//return comparisons
								}
				}										
}
