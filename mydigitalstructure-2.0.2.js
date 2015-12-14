/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 */

var mydigitalstructure = {_scope: {app: {options: {}}, sentToView: [], viewQueue: {content: {}}, session: {}}};

mydigitalstructure.init = function (data)
{
	$.ajaxSetup(
	{
		cache: false,
		dataType: 'json',
		global: true,
		headers: {"cache-control": "no-cache"},
		beforeSend: function (oRequest)
					{
            			oRequest.setRequestHeader("X-HTTP-myds-rest-level", 0);
        			}
	});

	if (typeof arguments[0] != 'object')
	{
		data =
		{
			viewStart: arguments[0],
			viewUpdate: arguments[1],
			options: arguments[2],
			views: arguments[3],
			site: arguments[4]
		}
	}

	data.site = data.site || mydigitalstructureSiteId;
	data.options.objects = (data.options.objects!=undefined?data.options.objects:true);

	mydigitalstructure._scope.app = data;

	if (mydigitalstructure._scope.app.options.auth == undefined)
		{mydigitalstructure._scope.app.options.auth = true}
	
	mydigitalstructure._util.init(data);
}

mydigitalstructure.register = function (param)
{
	//object: space|website

	if (typeof arguments[0] != 'object')
	{
		param =
		{
			spacename: arguments[0],
			firstname: arguments[1],
			surname: arguments[2],
			email: arguments[3],
			emaildocument: arguments[4],
			notes: arguments[5],
			type: arguments[6] || 'space',
			callback: arguments[7],
			object: (arguments[8]!=undefined?arguments[8]:'space')
		}
	}

	if (param.object==undefined) {param.object = 'space'}
	param.emaildocument = (param.emaildocument!=undefined?param.emaildocument:mydigitalstructure._scope.app.options.registerDocument);

	mydigitalstructure._util.register[param.object].create(param);
}

mydigitalstructure.reset = function (param)
{
	if (typeof arguments[0] != 'object')
	{
		param =
		{
			currentpassword: arguments[0],
			newpassword: arguments[1],
			newpasswordconfirm: arguments[2],
			expiredays: arguments[3],
			site: arguments[4],
			callback: arguments[5]
		}
	}

	if (param.newpassword != param.newpasswordconfirm)
	{
		mydigitalstructure._util.sendToView(
		{
			from: 'myds-reset',
			status: 'error',
			message: 'New passwords do not match.'
		});
	}
	else if (param.newpassword == '')
	{
		mydigitalstructure._util.sendToView(
		{
			from: 'myds-reset',
			status: 'error',
			message: 'New password can not be blank.'
		});
	}
	else
	{
		mydigitalstructure._util.user.password[param.type](param);
	}	
}

mydigitalstructure.auth = function (param)
{
	if (typeof arguments[0] != 'object')
	{
		param =
		{
			logon: arguments[0],
			password: arguments[1],
			code: arguments[2],
			callback: arguments[3]
		}
	}

	if (mydigitalstructure._scope.logonInitialised)
	{
		mydigitalstructure._util.logon.send(param);
	}
	else
	{
		mydigitalstructure._util.logon.init(param);
	}	
}

mydigitalstructure.deauth = function (param)
{
	mydigitalstructure._util.logoff(param);
}

mydigitalstructure.create = function (param)
{
	if (typeof arguments[0] != 'object')
	{
		param =
		{
			object: arguments[0],
			data: arguments[1],
			callback: arguments[2]
		}
	}

	var endpoint = param.object.split('_')[0];	

	mydigitalstructure._util.send(
	{
		object: param.object,
		data: param.data,
		callback: param.callback,
		type: 'POST',
		url: '/rpc/' + endpoint + '/?method=' + (param.object).toUpperCase() + '_MANAGE',
	});
}

mydigitalstructure.retrieve = function (param)
{
	if (typeof arguments[0] != 'object')
	{
		param =
		{
			object: arguments[0],
			data: arguments[1],
			callback: arguments[2]
		}
	}

	if (param.object == undefined)
	{
		mydigitalstructure._util.sendToView(
		{
			from: 'myds-retrieve',
			status: 'error-internal',
			message: 'No object'
		});
	}
	else
	{
		param.endpoint = param.object.split('_')[0];	

		if (typeof param.data != 'object')
		{
			var id = param.data;

			param.data = {criteria: mydigitalstructure._util.search.init()};

			var object = $.grep(mydigitalstructure._objects, function (object) {return object.name == param.object})[0];
			if (object) {param.data.criteria.fields = $.map(object.properties, function (property) {return {name: property.name}})}

			param.data.criteria.filters.push(
			{
				name: 'id',
				comparison: 'EQUAL_TO',
				value1: id
			});
		}

		param.type = 'POST';
		param.url = '/rpc/' + param.endpoint + '/?method=' + (param.object).toUpperCase() + '_SEARCH';

		mydigitalstructure._util.send(param);
	}	
}

mydigitalstructure.update = function (object, data, callback)
{
	if (typeof arguments[0] != 'object')
	{
		param =
		{
			object: arguments[0],
			data: arguments[1],
			callback: arguments[2]
		}
	}

	param.endpoint = param.object.split('_')[0];

	mydigitalstructure._util.send(
	{
		object: param.object,
		data: param.data,
		callback: param.callback,
		type: 'POST',
		url: '/rpc/' + param.endpoint + '/?method=' + (param.object).toUpperCase() + '_MANAGE',
	});
}

mydigitalstructure.delete = function (param)
{
	if (typeof arguments[0] != 'object')
	{
		param =
		{
			object: arguments[0],
			data: arguments[1],
			callback: arguments[2]
		}
	}

	if (typeof param.data != 'object')
	{
		param.data = {id: param.data}
	}

	param.endpoint = param.object.split('_')[0];
	param.remove = 1;

	mydigitalstructure._util.send(
	{
		object: param.object,
		data: param.data,
		callback: param.callback,
		type: 'POST',
		url: '/rpc/' + param.endpoint + '/?method=' + (param.object).toUpperCase() + '_MANAGE',
	});

}

mydigitalstructure.help = function ()
{
	return {scope: mydigitalstructure._scope}
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

	doCallBack: function()
				{
					var param, callback, data;

					if (typeof arguments[0] == 'function')
					{
						callback = arguments[0]
						param = arguments[1] || {};
						data = arguments[2]
					}
					else
					{
						param = arguments[0] || {};
						callback = param.callback;
						data = arguments[1];
						delete param.callback;
					}

					if (callback)
					{
						callback(param, data)
					};
				},

	loadScript: function (script)
				{
					var xhtmlHeadID = document.getElementsByTagName("head")[0]; 
					var oScript = document.createElement('script');
					oScript.type = 'text/javascript';
					oScript.src = script;
					xhtmlHeadID.appendChild(oScript);
				},			

	init: 		function(param)
				{
					mydigitalstructure._util.sendToView(
					{
						from: 'myds-init',
						status: 'start'
					});

					mydigitalstructure._scope.app.site = mydigitalstructureSiteId;

					$.ajaxSetup(
					{
						cache: false,
						dataType: 'json',
						global: true
					});

					$(window).off('hashchange');

					$(window).on('hashchange', function()
					{
 						mydigitalstructure._util.sendToView(
						{
							from: 'myds-init',
							status: 'uri-changed',
							message: window.location.hash
						});
					});

					if (mydigitalstructure._objects == undefined && mydigitalstructure._scope.app.options.objects)
					{	
						mydigitalstructure._util.loadScript('/jscripts/md5-min.js')

						$.ajax(
						{
							type: 'GET',
							url: '/site/' + mydigitalstructure._scope.app.site  + '/mydigitalstructure.model.objects-1.0.0.json',
							dataType: 'json',
							success: 	function(data)
										{
											mydigitalstructure._objects = data.objects;

											$.ajax(
											{
												type: 'GET',
												url: '/site/' + mydigitalstructure._scope.app.site  + '/mydigitalstructure.model.objects.properties-1.0.0.json',
												dataType: 'json',
												success: 	function(data)
															{
																$.each(data.objects, function (po, propertyobject)
																{
																	var object = $.grep(mydigitalstructure._objects, function (object) {return object.name == propertyobject.name})[0];

																	if (object)
																	{
																		object.properties = propertyobject.properties;
																	}
																});

																mydigitalstructure._util.init(param);
															},

												error: 		function(data)
															{
																mydigitalstructure._util.init(param);
															}						
											});					
										},

							error: 		function(data)
										{
											mydigitalstructure._objects = [];
											mydigitalstructure._util.init(param);
										}			
						});

						if (mydigitalstructure._util.param.get(param, 'assistWithBehavior', {"default": false}).value)
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
						mydigitalstructure._scope.app.objects = mydigitalstructure._objects;

						var callback = mydigitalstructure._util.param.get(param, 'viewStart').value;

						if (mydigitalstructure._scope.app.options.auth)
						{	
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
										mydigitalstructure._scope.session.logonkey = data.logonkey;
										mydigitalstructure._util.doCallBack(callback, {isLoggedOn: false});
									}
									else
									{
										mydigitalstructure._scope.user = data;

										if (mydigitalstructure._scope.app.options.logonSuffix != undefined)
										{
											mydigitalstructure._scope.user.userlogonname = mydigitalstructure._scope.user.userlogonname.replace(mydigitalstructure._scope.app.options.logonSuffix, '')
										}

										param.isLoggedOn = true;

										if (mydigitalstructure._scope.app.viewStart != undefined)
										{
											mydigitalstructure._scope.app.viewStart(param)
										}
										else
										{
											mydigitalstructure._util.doCallBack(callback, param);
										}	
									}		
								}
							});
						}	
						else
						{
							mydigitalstructure._util.doCallBack(callback);
						}	
					}

					if (mydigitalstructure._scope.app.options.location)
					{	
						mydigitalstructure._util.location.get();
					}		
				},					

	logon: 		{
					init:		function(param)
								{
									var logon, password, callback, code;

									mydigitalstructure._util.sendToView(
									{
										from: 'myds-logon-init',
										status: 'start'
									});

									if (typeof param == 'object')
									{	
										logon = mydigitalstructure._util.param.get(param, 'logon').value;
										password = mydigitalstructure._util.param.get(param, 'password').value;
										callback = mydigitalstructure._util.param.get(param, 'callback').value;
										code = mydigitalstructure._util.param.get(param, 'code').value;
									}
									else
									{
										logon = arguments[0];
										password = arguments[1];
										callback = arguments[2];
										code = arguments[3];
									}	

									if (mydigitalstructure._scope.app.options.logonSuffix != undefined)
									{
										logon = logon + mydigitalstructure._scope.app.options.logonSuffix;
										param.logon = logon;
									}

									if (mydigitalstructure._scope.app.options.passwordSuffix != undefined)
									{
										password = password + mydigitalstructure._scope.app.options.passwordSuffix;
										param.password = password;
									}	

									var data = 
									{
										method: 'LOGON_GET_USER_AUTHENTICATION_LEVEL',
										logon: logon
									};	

									data.passwordhash = mydigitalstructure._util.hash(logon + password);
									
									mydigitalstructure._util.sendToView(
									{
										from: 'myds-logon-init',
										status: 'start'
									});
										
									$.ajax(
									{
										type: 'POST',
										url: '/rpc/logon/',
										data: data,
										dataType: 'json',
										error: function ()
										{
											console.log('error')
										},
										success: function (data)
										{
											mydigitalstructure._util.sendToView(
											{
												from: 'myds-logon-init',
												status: 'end'
											});

											mydigitalstructure._scope.authenticationLevel = data.authenticationlevel;
											mydigitalstructure._scope.authenticationDelivery = (data.authenticationdelivery==1?'email':'SMS');

											if (mydigitalstructure._scope.authenticationLevel == '3')
											{	
												mydigitalstructure._util.sendToView(
												{
													from: 'myds-logon-init',
													status: 'information',
													message: 'A logon code is being sent to you via ' + mydigitalstructure._scope.authenticationDelivery + '.'
												});

												var data = 
												{
													method: 'LOGON_SEND_PASSWORD_CODE',
													logon: logon
												};

												data.passwordhash = mydigitalstructure._util.hash({value: logon + password + mydigitalstructure._scope.session.logonkey});

												mydigitalstructure._util.sendToView(
												{
													from: 'myds-logon-init',
													status: 'start'
												});

												$.ajax(
												{
													type: 'POST',
													url: '/rpc/logon/',
													data: data,
													dataType: 'json',
													success: function (data)
													{
														mydigitalstructure._util.sendToView(
														{
															from: 'myds-logon-init',
															status: 'end'
														});

														if (data.status == 'ER')
														{	
															mydigitalstructure._util.sendToView(
															{
																from: 'myds-logon-init',
																status: 'error',
																message: 'There is an issue with your user account (' + data.error.errornotes + ').'
															});
		
															mydigitalstructure._util.doCallBack(callback, {status: 'error', message: data.error.errornotes});
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
												mydigitalstructure._util.logon.send(param);
											}
										}	
									});
								},

					send: 		function (param)
								{
									mydigitalstructure._util.sendToView(
									{
										from: 'myds-logon-send',
										status: 'start'
									});

									var authenticationLevel = mydigitalstructure._scope.authenticationLevel;
									var logon = mydigitalstructure._util.param.get(param, 'logon').value;
									var password = mydigitalstructure._util.param.get(param, 'password').value;
									var code = mydigitalstructure._util.param.get(param, 'code').value;
									var callback = mydigitalstructure._util.param.get(param, 'callback').value;

									var data = 
									{
										method: 'LOGON',
										logon: logon
									}	

									if (authenticationLevel == 1)
									{
										data.passwordhash = mydigitalstructure._util.hash(logon + password);
									}
									else if (authenticationLevel == 2)
									{
										data.passwordhash = mydigitalstructure._util.hash(logon + password + mydigitalstructure._scope.session.logonkey)
									}
									else if (authenticationLevel == 3)
									{
										data.passwordhash = mydigitalstructure._util.hash(logon + password + mydigitalstructure._scope.session.logonkey + code)
									}
									
									mydigitalstructure._util.sendToView({status: 'request-start'});
									
									$.ajax(
									{
										type: 'POST',
										url: '/rpc/logon/',
										data: data,
										dataType: 'json',
										error: function ()
										{
											console.log('error')
										},
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
											
												mydigitalstructure._util.init(param);
												//if (callback == undefined) {callback = mydigitalstructure._scope.app.viewStart}							
												//mydigitalstructure._util.doCallBack(callback, {status: data.passwordStatus, isLoggedOn: true});
											}
										}
									})
								}
				},

	param: 		{
					get: 		function(param, name, options)
								{
									if (param == undefined) {param = {}}
									if (options == undefined) {options = {}}
							
									var data = {exists: false, value: options.default};

									var split = options.split;
									var index = options.index;
									var remove = options.remove;	
									var set = options.set;
								
									if (param.hasOwnProperty(name))
									{
										data.value = param[name];
										data.exists = true;

										if (index !== undefined && split === undefined) {split = '-'}

										if (split !== undefined)
										{
											if (param[name] !== undefined)
											{	
												data.values = param[name].split(split);

												if (index !== undefined)
												{
													if (index < data.values.length)
													{
														data.value = data.values[index];
													}
												}
											}	
										}

										if (remove) {delete param[name]};
										if (set) {param[name] = data.value};
									}

									return data;
								}						
				},

	logoff: 	function (param)
				{
					var uri = mydigitalstructure._util.param.get(param, 'uri', {"default": '/'}).value;

					$.ajax(
					{
						type: 'GET',
						url: '/rpc/core/?method=CORE_LOGOFF',
						dataType: 'json',
						global: false,
						success: function (data)
						{
							if (data.status == 'OK')
							{	
								mydigitalstructure._scope.user = undefined;
								window.location.href = uri;
							}	
						}
					})	
				},		

	send: 		function(param)
				{
					var object = mydigitalstructure._util.param.get(param, 'object').value;
					var data = mydigitalstructure._util.param.get(param, 'data', {"default": {}}).value;
					var url = mydigitalstructure._util.param.get(param, 'url').value;
					var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'POST'}).value;

					mydigitalstructure._util.sendToView(
					{
						from: 'myds-send',
						status: 'start'
					});

					data.sid = mydigitalstructure._scope.session.sid;
					data.logonkey = mydigitalstructure._scope.session.logonkey;

					if (data.criteria == undefined && url.toLowerCase().indexOf('_search') != -1)
					{
						data.criteria = mydigitalstructure._util.search.init();
						data.criteria.fields.push({name: 'id'});
					}

					if (data.criteria != undefined)
					{	
						data.criteria = JSON.stringify(data.criteria);
						url = url + '&advanced=1';
					}	
				
					$.ajax(
					{
						type: type,
						url: url,
						dataType: 'json',
						cache: false,
						data: data,
						success: function(response) 
						{
							mydigitalstructure._util.sendToView(
							{
								from: 'myds-send',
								status: 'end'
							});

							mydigitalstructure._util.doCallBack(param, response);
						}
					});	
				},

	search:  	{	
					init: 		function ()
								{
									var criteria = 
									{
										"fields": [],
										"summaryFields": [],
										"filters": [],
										"sorts": [],
										"options": {},
										"customoptions": []
									}

									return criteria
								},

					comparison: function ()
								{
									//return comparisons
								}
				},

	view: 		{
					get: 	function (uri)
							{
								if (typeof arguments[0] == 'object') {uri = arguments[0].uri;}

								var view = $.grep(mydigitalstructure._scope.app.views, function (view) {return view.uri==uri});
								if (view.length==1) {return view[0]}
							},

					render: function ()
							{
								var uri, uriContext;

								if (typeof arguments[0] == 'object')
								{
									uri = arguments[0].uri;
									uriContext = arguments[0].uriContext;
								}
								else
								{
									uri = arguments[0];
									uriContext = arguments[1];
								}

								mydigitalstructure._scope.app.view =
								{
									uri: uri,
									uriContext: uriContext
								}

								if (uriContext != undefined)
								{
									if ($(uriContext).length != 0)
									{
										$(myApp.options.container).html($(uriContext).clone().html());
									}
								}

								var view = mydigitalstructure._util.view.get(uri);

								if (view != undefined)
								{	
									if (view.html != undefined)
									{
										$(myApp.options.container).html(view.html);	
									}
									else if (view.selector != undefined)
									{
										$('div.view').hide();
										$(view.selector).show();
									}

									if (view.controller != undefined)
									{
										myApp.controller[view.controller]();
									}

									mydigitalstructure._util.view.access(
									{
										view: view,
										uriContext: uriContext
									})
								}
							},

					access: function (param)
							{
								var view = mydigitalstructure._util.param.get(param, 'view').value;
								var uriContext = mydigitalstructure._util.param.get(param, 'uriContext').value;
								var viewContext = uriContext.replace('#', '');
								
								var contexts = $.grep(view.contexts, function (context) {return context.id==viewContext});
								var elements = [];
								var elementsShow = [];
								var access;

								$.each(contexts, function (v, context)
								{
									$.each(context.elements, function (e, element) {elements.push(element)});

									access = false;

									$.each(context.roles, function (r, role)
									{
										if (!access)
										{	
											access = mydigitalstructure._util.user.roles.has({roleTitle: role.title, exact: false})
										}	
									});

									if (access) {$.each(context.elements, function (e, element) {elementsShow.push(element)});}
								});

								mydigitalstructure._util.sendToView(
								{
									from: 'myds-view-access',
									status: 'context-changed',
									message: {hide: elements, show: elementsShow}
								});

								/*
								$(elements.join(',')).addClass('hidden');
								$(elementsShow.join(',')).removeClass('hidden');
								*/
							},		

					queue: 	{
								clear: function (param)
								{
									var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'content'}).value;
									var queue = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									var preserve = mydigitalstructure._util.param.get(param, 'preserve', {"default": false}).value;
									
									if (!preserve) {mydigitalstructure._scope.viewQueue[type][queue] = []};
								},

								add: function (content, param)
								{
									if (typeof arguments[0] == 'object')
									{
										param = arguments[0];
										content = (arguments.length>1?arguments[1]:param.content);
									}

									var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'content'}).value;
									var queue = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									var clear = mydigitalstructure._util.param.get(param, 'clear', {"default": false}).value;
									var useTemplate = mydigitalstructure._util.param.get(param, 'useTemplate', {"default": false}).value;
									
									if (clear) {mydigitalstructure._util.view.queue.clear(param)}
									if (mydigitalstructure._scope.viewQueue[type][queue] == undefined) {mydigitalstructure._scope.viewQueue[type][queue] = []}

									if (useTemplate && type == 'content')
									{
										var data = $.extend(true, {}, content);
										content = mydigitalstructure._util.view.queue.get({type: 'template', queue: param.queue});
										
										for (var key in data)
								  		{
								     		if (data.hasOwnProperty(key))
								     		{
								     			content.replace('{{' + key + '}}', data[key]);
								     		}
								     	}
									}	
									else
									{
										mydigitalstructure._scope.viewQueue[type][queue].push(content);
									}	
								},

								render: function (selector, param)
								{
									if (typeof arguments[0] == 'object')
									{
										param = arguments[0];
										selector = (arguments.length>1?arguments[1]:param.selector);
									}

									var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'content'}).value;
									var queue = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;

									if (selector == undefined)
									{
										console.log(mydigitalstructure._scope.viewQueue[type][queue].join(''));
									}
									else
									{
										if (mydigitalstructure._scope.viewQueue[type][queue] != undefined)
										{	
											$(selector).html(mydigitalstructure._scope.viewQueue[type][queue].join(''));
										}
	
										mydigitalstructure._util.view.queue.clear(param);
									}	
								},

								get: function (param)
								{
									var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'content'}).value;
									var queue = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									var content = mydigitalstructure._scope.viewQueue[type][queue].join('');
									mydigitalstructure._util.view.queue.clear(param);

									return content	
								},

								show: function (selector, content, param)
								{
									if (typeof arguments[0] == 'object')
									{
										param = arguments[0];
										selector = (arguments.length>1?arguments[1]:param.selector);
									}

									this.clear(oParam);
									this.add(sData, oParam);
									this.render(sElementSelector, param);
								},

								exists: function (param)
								{
									var type = mydigitalstructure._util.param.get(param, 'type', {"default": 'data'}).value;
									var queue = mydigitalstructure._util.param.get(param, 'queue', {"default": 'base'}).value;
									return (mydigitalstructure._scope.viewQueue[type][queue].length!=0);
								}
							}			
				},

	register: 	{
					space:
					{
						create: function (param)
								{
									mydigitalstructure._util.sendToView(
									{
										from: 'myds-register-space',
										status: 'start'
									});

									var data = $.extend(true, {}, param);
									delete data.callback;

									data.registration_emailapplysystemtemplate = param.registration_emailapplysystemtemplate || 'N';
									data.registration_emaildocument = param.emaildocument || param.registration_emaildocument;
									data.registration_notes = param.notes || param.registration_notes;
									data.registration_trial = param.trial || param.registration_trial;
									data.registration_spacename = param.spacename || data.registration_spacename;
									data.contactperson_firstname = param.firstname || param.contactperson_firstname;
									data.contactperson_surname = param.surname || param.contactperson_surname;
									data.contactperson_email = param.email || param.contactperson_email;
									data.template_businessname = data.contactbusiness_tradename;
									data.template_firstname = data.contactperson_firstname;
									data.template_surname = data.contactperson_surname;

									data.site = data.site || mydigitalstructureSiteId;
								
									$.ajax(
									{
										type: 'POST',
										url: '/rpc/register/?method=REGISTER_SPACE_MANAGE',
										dataType: 'json',
										cache: false,
										data: data,
										success: function(response) 
										{
											mydigitalstructure._util.sendToView(
											{
												from: 'myds-register-space',
												status: 'end'
											});

											mydigitalstructure._util.doCallBack(param, response);
										}
									});	
								}
							},	

					website:	
							{		
								templates:
										function (param, response)
										{
											if (mydigitalstructure._scope.register ==  undefined)
												{mydigitalstructure._scope.register = {website: {}}}

											if (mydigitalstructure._scope.register.website.templates == undefined)
											{
												var siteID = mydigitalstructureSiteId;

												if (mydigitalstructure._scope.user != undefined)
												{	
													siteID = mydigitalstructure._scope.user.site;
												}	

												$.ajax(
												{
													type: 'GET',
													url: '/site/' + siteID + '/mydigitalstructure.framework.templates-1.0.0.json',
													dataType: 'json',
													global: false,
													success: function(data)
													{
														mydigitalstructure._scope.register.website.templates = data.templates;
														mydigitalstructure._util.register.website.templates(param);
													},
													error: function(data) {}
												});
											}
											else
											{
												mydigitalstructure._util.sendToView(
												{
													from: 'myds-register-templates',
													status: 'initialised'
												});

												mydigitalstructure._util.doCallBack(param);
											}
										},		

								create: function (param)
										{
											//sdk - language
											//template - ui frame work
											//urls
											//headers

											//Get the default site and update as required.

											var templateName = mydigitalstructure._util.param.get(param, 'templateName').value;

											if (mydigitalstructure._scope.register ==  undefined)
												{mydigitalstructure._scope.register = {website: {}}}

											mydigitalstructure._util.sendToView(
											{
												from: 'myds-register-app',
												status: 'start'
											});

											var paramSend = $.extend(true, param,
											{
												url: '/rpc/setup/?method=SETUP_SITE_SEARCH',
												callback: mydigitalstructure._util.register.website.process
											});

											mydigitalstructure._util.send(paramSend);
										},

								process:
										function (param, response)
										{
											var templateName = mydigitalstructure._util.param.get(param, 'templateName').value;

											if (response.data.rows.length != 0)
											{
												param.siteID = response.data.rows[0].id;
											}	

											if (templateName != undefined)
											{
												param.callback = mydigitalstructure._util.register.website.update;
												mydigitalstructure._util.register.website.templates(param);
											}
											else
											{
												mydigitalstructure._util.doCallBack(param)
											}
										},	

								update: function (param, response)
										{
											var siteID = mydigitalstructure._util.param.get(param, 'siteID').value;
											var templateName = mydigitalstructure._util.param.get(param, 'templateName').value;
											var template;

											var paramSend =
											{	
												url: '/rpc/setup/?method=SETUP_SITE_MANAGE',
												data: (param.data!=undefined?param.data:{})
											};

											if (siteID != undefined)
											{	
												paramSend.data.id = siteID;
											}	

											if (templateName != undefined && siteID == undefined)
											{
												template = $.grep(mydigitalstructure._scope.register.website.templates, function (template)
																		{return template.name == templateName})[0];
											
												paramSend.data = $.extend(true, paramSend.data, template.data);
												
												for (var key in paramSend.data)
										  		{
										     		if (paramSend.data.hasOwnProperty(key))
										     		{
										     			paramSend.data[key] = _.escape(paramSend.data[key]);
										     		}
										     	}

												paramSend.callback = mydigitalstructure._util.register.website.headers;
											}
											else
											{
												paramSend.callback = mydigitalstructure._util.register.website.complete;
											}

											mydigitalstructure._util.send(paramSend);
										},

								headers: 
										function (param)
										{
											//Create headers
											mydigitalstructure._util.register.website.complete(param);
										},

								complete:
										function (param)
										{
											mydigitalstructure._util.sendToView(
											{
												from: 'myds-register-app',
												status: 'end'
											});
										}					
							}
				},

	user: 		{
					password: 	
							function (param, callback)
							{
								mydigitalstructure._util.sendToView(
								{
									from: 'myds-user-password',
									status: 'start'
								});

								var data = param;
								data.site = data.site || mydigitalstructureSiteId;
							
								$.ajax(
								{
									type: 'POST',
									url: '/rpc/register/?method=SITE_USER_PASSWORD_MANAGE',
									dataType: 'json',
									cache: false,
									data: data,
									success: function(data) 
									{
										mydigitalstructure._util.sendToView(
										{
											from: 'myds-user-password',
											status: 'end'
										});

										mydigitalstructure._util.doCallBack(callback, data);
									}
								});	
							},

					roles: 	{
								get: 
									function (param)
									{
										var aRoles;

										if (mydigitalstructure._scope.user != undefined)
										{	
											aRoles = $.map(mydigitalstructure._scope.user.roles.rows, function (row) {return row});
										}

										return aRoles;
									},

								has: 
									function (param)
									{
										var roleTitle = mydigitalstructure._util.param.get(param, 'roleTitle').value;
										var exact = mydigitalstructure._util.param.get(param, 'exact', {"default": true}).value;

										var bHas = false;

										if (mydigitalstructure._scope.user != undefined)
										{	
											bHas = ($.grep(mydigitalstructure._scope.user.roles.rows, function (row)
														{return (exact?row.title==roleTitle:row.title.indexOf(roleTitle)!=-1)}).length > 0);
										}

										return bHas;
									}	
							}		
				},

	location: 	{
					get: 	function ()
							{
							    if (navigator.geolocation)
							    {
							        navigator.geolocation.getCurrentPosition(
							        				mydigitalstructure._util.location.process,
							        				mydigitalstructure._util.location.process,
							        				{
														enableHighAccuracy: true
							        				});
							    }
							    else
							    {
        							mydigitalstructure._util.location.process();
        						}
        					},

        			process: 	
        					function (position)
							{
							    if (position != undefined)
							    {
							       	var data =
							       	{
							       		available: true,
							       		coords:
								       	{
								       		latitude: position.coords.latitude,
	    									longitude: position.coords.longitude
	    								}
    								}	
							    }
							    else
							    {
        							var data =
							       	{
							       		available: false
    								}	
        						}

        						mydigitalstructure._scope.location = data;

        							mydigitalstructure._util.sendToView(
									{
										from: 'myds-util-location',
										status: 'end',
										message: data
									});

        					}
				},

	object:  	{
					get: 	function (param)
							{
								var objectTitle = mydigitalstructure._util.param.get(param, 'context', {index: 2, split: '/'}).value;
								if (objectTitle == undefined) {var objectTitle = mydigitalstructure._util.param.get(param, 'objectTitle').value}

								mydigitalstructure.retrieve(
								{
									object: 'setup_method',
									data:
									{
										criteria:
										{
											fields:
											[
												{name: 'object'},
												{name: 'objecttext'},
												{name: 'endpoint'},
												{name: 'endpointtext'},
												{name: 'title'},
												{name: 'notes'},
												{name: 'removeavailable'},
												{name: 'addavailable'},
												{name: 'unrestrictedaccess'},
												{name: 'unrestrictedloggedonaccess'},
												{name: 'updateavailable'},
												{name: 'useavailable'}
											],
											filters:
											[
												{
													name: 'objecttext',
													comparison: 'EQUAL_TO',
													value1: objectTitle
												}
											],
											options: {rows: 1000}
										}
									},
									callback: mydigitalstructure._util.object.properties
								});	
							},		

					properties:
							function (param, response)
							{
								console.log(response)

								var objectTitle = mydigitalstructure._util.param.get(param, 'context', {index: 2, split: '/'}).value;
								if (objectTitle == undefined) {var objectTitle = mydigitalstructure._util.param.get(param, 'objectTitle').value}

								var includeProperties = mydigitalstructure._util.param.get(param, 'includeProperties').value;

								mydigitalstructure.retrieve(
								{
									object: 'setup_method',
									data:
									{
										criteria:
										{
											fields:
											[
												{name: 'object'},
												{name: 'objecttext'},
												{name: 'endpointtext'},
												{name: 'title'},
												{name: 'method.property.datalength'},
												{name: 'method.property.datatype'},
												{name: 'method.property.datatypetext'},
												{name: 'method.property.mandatory'},
												{name: 'method.property.notes'},
												{name: 'method.property.searchendpoint'},
												{name: 'method.property.searchmethod'},
												{name: 'method.property.searchrelatedproperty'},
												{name: 'method.property.title'}
											],
											filters:
											[
												{
													name: 'objecttext',
													comparison: 'EQUAL_TO',
													value1: objectTitle
												}
											],
											options: {rows: 1000}
										}
									},
									callback: mydigitalstructure._util.object.properties
								});
							},	
								
					methods:
							function (param)
							{}
				}															
}	
