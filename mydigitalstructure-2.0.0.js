/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 */

var mydigitalstructure = {_scope: {sentToView: [], viewQueue: {base: []}, session: {}}};

mydigitalstructure.init = function (data)
{
	if (typeof arguments[0] != 'object')
	{
		data =
		{
			viewStart: arguments[0],
			viewUpdate: arguments[1],
			options: arguments[2],
			views: arguments[3]
		}
	}

	mydigitalstructure._scope.app = data;
	
	mydigitalstructure._util.init(data);
}

mydigitalstructure.register = function (data)
{
	if (typeof arguments[0] != 'object')
	{
		data =
		{
			businessname: arguments[0],
			firstname: arguments[1],
			surname: arguments[2],
			email: arguments[3],
			emaildocument: arguments[4],
			notes: arguments[5],
			type: arguments[6] || 'space'
		}
	}

	mydigitalstructure._util.register[data.type](data);
}

mydigitalstructure.auth = function (data)
{
	if (typeof arguments[0] != 'object')
	{
		data =
		{
			logon: arguments[0],
			password: arguments[1],
			callback: arguments[2],
			code: arguments[3]
		}
	}

	if (mydigitalstructure._scope.logonInitialised)
	{
		mydigitalstructure._util.logon.send(data);
	}
	else
	{
		mydigitalstructure._util.logon.init(data);
	}	
}

mydigitalstructure.deauth = function (data)
{
	mydigitalstructure._util.logoff(data);
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
	hash: 		function(data)
				{
					//requires /jscripts/md5-min.js
					
					if (data !== undefined)
					{	
						return hex_md5(data);
					}	
				},

	sendToView: function(param)
				{
					mydigitalstructure._scope.sentToView.unshift(param);
					if (mydigitalstructure._scope.app.viewUpdate) {mydigitalstructure._scope.app.viewUpdate(param)};
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
					mydigitalstructure._util.sendToView(
					{
						from: 'myds-init',
						status: 'start'
					});

					$.ajaxSetup(
					{
						cache: false,
						dataType: 'json',
						global: true
					});

					$(window).on('hashchange', function()
					{
 						mydigitalstructure._util.sendToView(
						{
							from: 'myds-init',
							status: 'uri-changed',
							message: window.location.hash
						});
					});

					var oView = mydigitalstructure._util.view.get(window.location.pathname);

					if (oView != undefined)
					{	
						if (oView.controller != undefined)
						{
							myApp.controller[oView.controller]();
						}	
					}	

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

						if (mydigitalstructure._util.param.get(oParam, 'assistWithBehavior', {"default": false}).value)
						{
							$(document).on('click', '#myds-logon', function(event)
							{
								mydigitalstructure.auth(
								{
									logon: $('#myds-logonname').val(),
									password: $('#myds-logonpassword').val()
								})
							});
						}	
					}	
					else
					{	
						var callback = mydigitalstructure._util.param.get(oParam, 'viewStart').value;

						$.ajax(
						{
							type: 'GET',
							url: '/rpc/core/?method=CORE_GET_USER_DETAILS',
							dataType: 'json',
							cache: false,
							global: false,
							success: function(data) 
							{
								mydigitalstructure._util.sendToView(
								{
									from: 'myds-init',
									status: 'end'
								});
								
								if (data.status === 'ER')
								{
									mydigitalstructure._scope.session.logonKey = data.logonkey;
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
									mydigitalstructure._util.sendToView(
									{
										from: 'myds-logon-init',
										status: 'start'
									});

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

												oData.passwordhash = mydigitalstructure._util.hash({value: logon + password + mydigitalstructure._scope.session.logonKey});

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

														if (data.status == 'ER')
														{	
															mydigitalstructure._util.sendToView(
															{
																from: 'myds-logon-init',
																status: 'error',
																message: 'There is an issue with your user account (' + data.error.errornotes + ').'
															});
		
															mydigitalstructure._util.doCallBack(callback, {status: 'error'});
														}
														else
														{
															mydigitalstructure._util.sendToView(
															{
																from: 'myds-logon-init',
																status: 'end'
															});

															mydigitalstructure._scope.logonInitialised = true;
															mydigitalstructure._util.doCallBack(callback, {status: 'get2ndFactorCode', codeDelivery: mydigitalstructure._scope.authenticationDelivery});
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
									mydigitalstructure._util.sendToView(
									{
										from: 'myds-logon-send',
										status: 'start'
									});

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
										oData.passwordhash = mydigitalstructure._util.hash(logon + password + mydigitalstructure._scope.session.logonKey)
									}
									else if (iAuthenticationLevel == 3)
									{
										oData.passwordhash = mydigitalstructure._util.hash(logon + password + mydigitalstructure._scope.session.logonKey + code)
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
													from: 'myds-logon-send',
													status: 'error',
													message: 'Logon name or password is incorrect.'
												});

												mydigitalstructure._util.doCallBack(callback, {status: 'ER'});
											}
											else 
											{		
												mydigitalstructure._util.sendToView(
												{
													from: 'myds-logon-send',
													status: 'end'
												});

												mydigitalstructure._scope.session = data;
											
												if (callback == undefined) {callback = mydigitalstructure._scope.app.viewStart}							
												mydigitalstructure._util.doCallBack(callback, {status: data.passwordStatus, isLoggedOn: true});
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

	logoff: 	function ()
				{
					$.ajax(
					{
						type: 'GET',
						url: '/rpc/core/?method=CORE_LOGOFF',
						dataType: 'json',
						global: false,
						success: function ()
						{
							window.location.href = '/';	
						}
					})	
				},		

	send: 		function(param)
				{
					var object = mydigitalstructure._util.param.get(param, 'object').value;
					var data = mydigitalstructure._util.param.get(param, 'data', {"default": {}}).value;
					var callback = mydigitalstructure._util.param.get(param, 'callback').value;
					var url = mydigitalstructure._util.param.get(param, 'url').value;
					var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'POST'}).value;

					mydigitalstructure._util.sendToView(
					{
						from: 'myds-send',
						status: 'start'
					});

					data.sid = mydigitalstructure._scope.session.sid;
					data.logonkey = mydigitalstructure._scope.session.logonkey;

					$.ajax(
					{
						type: type,
						url: url,
						dataType: 'json',
						cache: false,
						data: data,
						success: function(data) 
						{
							mydigitalstructure._util.sendToView(
							{
								from: 'myds-send',
								status: 'end'
							});

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
				},

	view: 		{
					get: 	function (data)
							{
								var aView = $.grep(mydigitalstructure._scope.app.views, function (view) {return view.uri==data});
								if (aView.length==1) {return aView[0]}	
							},

					render: function (data)
							{
								var oView = mydigitalstructure._util.view.get(data);

								if (oView != undefined)
								{	
									if (oView.html != undefined)
									{
										window.location.hash = data;
										$(myApp.options.container).html(oView.html);
										if (oView.controller != undefined)
										{
											myApp.controller[oView.controller]();
										}	
									}
									else
									{
										document.location.href = oView.uri;
									}
								}
							},

					queue: 	{
								clear: function (param)
								{
									var sType = mydigitalstructure._util.param.get(param, 'type', {"default": 'data'}).value;
									var sQueueID = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									var bPreserve = mydigitalstructure._util.param.get(param, 'preserve', {"default": false}).value;
									
									if (!bPreserve) {mydigitalstructure._scope.viewQueue[sType][sQueueID] = []};
								},

								add: function (sData, param)
								{
									var sType = mydigitalstructure._util.param.get(param, 'type', {"default": 'data'}).value;
									var sQueueID = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									var bClear = mydigitalstructure._util.param.get(param, 'clear', {"default": false}).value;
									
									if (bClear) {mydigitalstructure._util.view.queue.clear(oParam)}
									if (mydigitalstructure._scope.viewQueue[sType][sQueueID] == undefined) {mydigitalstructure._scope.viewQueue[sType][sQueueID] = []}
									mydigitalstructure._scope.viewQueue[sType][sQueueID].push(sData);
								},

								render: function (sElementSelector, param)
								{
									var sType = mydigitalstructure._util.param.get(param, 'type', {"default": 'data'}).value;
									var sQueueID = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;

									if (sElementSelector == undefined)
									{
										console.log(mydigitalstructure._scope.viewQueue[sType][sQueueID].join(''));
									}
									else
									{
										if (mydigitalstructure._scope.viewQueue[sType][sQueueID] != undefined)
										{	
											$(sElementSelector).html(mydigitalstructure._scope.viewQueue[sType][sQueueID].join(''));
										}
	
										mydigitalstructure._util.view.queue.clear(oParam);
									}	
								},

								get: function (param)
								{
									var sType = mydigitalstructure._util.param.get(param, 'type', {"default": 'data'}).value;
									var sQueueID = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									var sReturn = mydigitalstructure._scope.viewQueue[sType][sQueueID].join('');
									mydigitalstructure._util.view.queue.clear(param);

									return sReturn	
								},

								show: function (sElementSelector, sData, param)
								{
									this.clear(oParam);
									this.add(sData, oParam);
									this.render(sElementSelector, param);
								},

								exists: function (param)
								{
									var sType = mydigitalstructure._util.param.get(param, 'type', {"default": 'data'}).value;
									var sQueueID = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									return (mydigitalstructure._scope.viewQueue[sType][sQueueID].length!=0);
								}
							}			
				},

	register: 	{
					space: 	function (param)
							{
								var data = param;

								data.registration_emailapplysystemtemplate = param.registration_emailapplysystemtemplate || 'N';
								data.registration_emaildocument = param.emaildocument || param.registration_emaildocument;
								data.registration_notes = param.notes || param.registration_notes;
								data.registration_trial = param.trial || param.registration_trial;
								data.contactbusiness_tradename = param.businessname || param.contactbusiness_tradename;
								data.contactperson_firstname = param.firstname || param.contactperson_firstname;
								data.contactperson_surname = param.surname || param.contactperson_surname;
								data.contactperson_email = param.email || param.contactperson_email;
								data.template_businessname = data.contactbusiness_tradename;
								data.template_firstname = data.contactperson_firstname;
								data.template_surname = data.contactperson_surname;
							
								console.log(data);

								/*
								$.ajax(
								{
									type: 'POST',
									url: 'rpc/register/?method=REGISTER_SPACE_MANAGE',
									dataType: 'json',
									cache: false,
									data: data,
									success: function(data) 
									{
										mydigitalstructure._util.sendToView(
										{
											from: 'myds-setup-space',
											status: 'start'
										});

										mydigitalstructure._util.doCallBack(callback, data);
									}
								});	
								*/	


							},

					user: 	function (param)
							{

							}
				}					
}
