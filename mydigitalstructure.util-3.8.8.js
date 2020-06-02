/*!
 * This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
 * http://creativecommons.org/licenses/by-sa/4.0/
 * Requires: jQuery, /jscripts/md5-min.js
 * Based on mydigitalstructure.com RPC platform
 * boostrap 3 & 4
 */

 "use strict";

mydigitalstructure.compatible = (typeof document.addEventListener == 'function');
mydigitalstructure.ie = (navigator.appVersion.indexOf('MSIE') != -1)

if (_.isFunction(window.sprintf))
{
	_.mixin({format: window.sprintf})
}

if (_.isFunction(window.format))
{
	_.mixin({format: window.format})
}

if (_.startsWith(_.VERSION, '4'))
{	
	_.pluck = _.map;
	_.contains = _.includes;
}

_.replaceAll = function (str, from, to) {
  return str.replace(new RegExp(from, 'g'), to);
}

try
{
	mydigitalstructure.saveAs = !!new Blob;
}
catch (e)
{
	mydigitalstructure.saveAs = false
}

$(document).off('click', '.myds-logoff').on('click', '.myds-logoff', function(event)
{
	mydigitalstructure.deauth();
});

$(document).off('click', '#myds-logon, .myds-logon')
.on('click', '#myds-logon, .myds-logon', function(event)
{
	var password = $('#myds-logonpassword').val();

	if ($('#myds-logonpassword').attr('data-password') != undefined)
	{
		password = $('#myds-logonpassword').attr('data-password');
	}

	mydigitalstructure.auth(
	{
		logon: $('#myds-logonname').val(),
		password: password,
		code: $('#myds-logoncode').val()
	});
});

$(document).off('click', '#myds-register, .myds-register')
.on('click', '#myds-register, .myds-register', function(event)
{
	mydigitalstructure.register(
	{
		spacename: $('#myds-spacename').val(),
		firstname: $('#myds-firstname').val(),
		surname: $('#myds-surname').val(),
		email: $('#myds-email').val(),
		notes: $('#myds-notes').val()
	});	
});

$(document).off('keypress', '#myds-logonname, #myds-logonpassword, #myds-logoncode')
.on('keypress', '#myds-logonname, #myds-logonpassword, #myds-logoncode', function(e)
{
    if (e.which === 13)
    {
    	var password = $('#myds-logonpassword').val();

		if ($('#myds-logonpassword').attr('data-password') != undefined)
		{
			password = $('#myds-logonpassword').attr('data-password');
		}

		mydigitalstructure.auth(
		{
			logon: $('#myds-logonname').val(),
			password: password,
			code: $('#myds-logoncode').val()
		});
    }
});

$(document).off('click', '.myds-click, .myds')
.on('click', '.myds-click, .myds', function (event)
{
	var element = $(this);
	var id = element.attr('id');
	var controller = element.data('controller');

	if (element.hasClass('list-group-item'))
	{
		element.closest('li').siblings().removeClass('active');
		element.closest('li').addClass('active');
	}

	if (controller != undefined)
	{
		var param = {}

		if (mydigitalstructure._scope.app.uriContext != undefined)
		{ 
			param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
		}

		var data = mydigitalstructure._util.data.clean(element.data());
		param.dataContext = data;
		app.data[controller] = data;
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		mydigitalstructure._util.controller.invoke({name: controller}, param)
	}
	else
	{
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{	
				var param = {}

				if (mydigitalstructure._scope.app.uriContext != undefined)
				{ 
					param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
				}

				var data = mydigitalstructure._util.data.clean(element.data());
				param.dataContext = data;
				app.data[controller] = data;

				if (app.data[controller] == undefined) {app.data[controller] = {}}
				app.controller[id](param);
			}
		}
	}	
});

$(document).off('click', '.myds-navigate')
.on('click', '.myds-navigate', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var target = $(this).data('target');
	var context = $(this).attr('data-context');

	if (controller == undefined) {controller = scope}

	if (controller == undefined && target != undefined)
	{
		controller = target.replace('#', '')
	}

	if (controller == undefined && $(this).attr('href') != undefined)
	{
		controller = $(this).attr('href').replace('#', '')
	}

	if (controller != undefined)
	{
		var routerElement = $('.myds-router');

		if (routerElement.length > 0)
		{
			var element = routerElement.children('.btn');
			if (element.length == 0)
			{
				element = routerElement.children('.dropdown-toggle');
			}

			if (element.length > 0)
			{
				var textElement = element.siblings().find('[data-context="' + controller + '"]')

				if (textElement.length > 0)
				{
					var text = textElement.html();

					var elementText = element.find('span.dropdown-text');

					if (elementText.length != 0)
					{
						elementText.html(text)
					}
					else
					{
						element.html(text + ' <span class="caret"></span>');
					}	
				}
			}
		}

		var param = {}

		if (mydigitalstructure._scope.app.uriContext != undefined)
		{ 
			param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
		}

		param.dataContext = mydigitalstructure._util.data.clean($(this).data());
		app.data[controller] = mydigitalstructure._util.data.clean($(this).data());

		var locationHash = '#' + controller;

		if (context != undefined)
		{
			locationHash = locationHash + '/' + context
		}

		window.location.hash = locationHash;
	}
});

$(document).off('click', '.myds-navigate-to')
.on('click', '.myds-navigate-to', function (event)
{
	var target = $(this).attr('target');
	if (target == undefined) {target = $(this).data('target')};
	var type = $(this).data('type');
	if (type == undefined) {type = 'tab'}

	if (type == 'tab')
	{
		$('[href="' + target + '"]').tab('show')
	}
});

$(document).off('click', '.myds-show, .myds-invoke')
.on('click', '.myds-show, .myds-invoke', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var target = $(this).data('target');
	var targetClass = $(this).data('target-class')

	$(targetClass).addClass('hidden d-none');
	$(target).removeClass('hidden d-none');

	if (controller == undefined) {controller = scope}

	if (controller == undefined && target != undefined)
	{
		controller = target.replace('#', '')
	}

	if (controller != undefined)
	{
		var param = {dataContext: mydigitalstructure._util.data.clean($(this).data())};
		app.data[controller] = mydigitalstructure._util.data.clean($(this).data());

		mydigitalstructure._util.controller.invoke(
		{
			name: controller,
			controllerParam: param
		});
	}
});

$(document).off('click', '.myds-close')
.on('click', '.myds-close', function (event)
{
	var context = $(this).data('context');

	if (context == 'popover' && typeof $.fn.popover == 'function')
	{
		$('.popover:visible').popover("hide");
	}
});

$(document).off('click', '.myds-export')
.on('click', '.myds-export', function(event)
{
	var context = $(this).data('context');
	var container = $(this).data('container');
	var filename = $(this).data('filename');
	var scope = $(this).data('scope');

	app.controller['util-export-table'](
	{
		context: context,
		filename: filename,
		container: container,
		scope: scope
	})
});

$(document).off('click', '.myds-dropdown')
.on('click', '.myds-dropdown', function (event)
{
	var id = $(this).attr('id');
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');
	var html = $(this).html();

	if (controller == undefined) {controller = scope}

	if (controller == undefined)
	{
		controller = id
	}

	var button = $(this).parents(".btn-group").find('.btn');

	if (button.length == 0)
	{
		button = $(this).parents('.dropdown').find('.dropdown-toggle');
	}

	if (button.length == 0)
	{
		button = $(this).parents('.dropdown-menu').siblings('.dropdown-toggle');
	}

	if (button.length != 0)
	{
		var buttonText = button.find('span.dropdown-text');

		if (buttonText.length != 0)
		{
			buttonText.html(html)
		}
		else
		{
			button.html(html + ' <span class="caret"></span>');
		}

		if (controller == undefined)
		{
			controller = $(this).closest('ul.dropdown-menu').data('controller');
		}

		if (context == undefined)
		{
			context = $(this).closest('ul.dropdown-menu').data('context');
		}

		var otherData;

		if ($(this).closest('ul.dropdown-menu').length != 0)
		{
			otherData = mydigitalstructure._util.data.clean($(this).closest('ul.dropdown-menu').data())
		}

		var param = {}
		param.dataContext = _.assign(otherData, mydigitalstructure._util.data.clean($(this).data()));
		param._dataContext = _.assign(otherData, mydigitalstructure._util.data.clean($(this).data()));
		
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.data[controller].dataContext = _.assign(otherData, mydigitalstructure._util.data.clean($(this).data()));

		if (context != undefined && $(this).data('id') != undefined)
		{
			app.data[controller][context] = $(this).data('id');
			app.data[controller]['_' + context] = [$(this).data('id')];
		}	

		mydigitalstructure._util.controller.invoke({name: controller}, param);
	}	
});

$(document).off('click', '.myds-list')
.on('click', '.myds-list', function (event)
{
	var element = $(this);
	var id = element.attr('id');
	var controller = element.data('controller');
	var scope = element.data('controller');
	var context = element.data('context');
	
	element.closest('li').siblings().removeClass('active');
	element.closest('li').addClass('active');

	if (controller == undefined) {controller = scope}

	if (controller != undefined)
	{
		var param = {}
		param.dataContext = element.data();
		
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.data[controller].dataContext = element.data();

		if (context != undefined)
		{
			app.data[controller][context] = element.data('id');
			app.data[controller]['_' + context] = [element.data('id')];
		}	

		app.controller[controller](param);
	}
	else
	{
		if (id != '')
		{	
			if (app.controller[id] != undefined)
			{	
				var param = {}
				param.dataContext = element.data();
				if (app.data[controller] == undefined) {app.data[controller] = {}}
				app.controller[id](param);
			}
		}
	}	
});

$(document).off('click', '.myds-check')
.on('click', '.myds-check', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var controllerBefore = $(this).data('controller-before');
	var context = $(this).data('context');

	if (scope == undefined) {scope = controller}

	if ((controller != undefined || scope != undefined) && context != undefined)
	{	
		if (app.data[scope] == undefined) {app.data[scope] = {}}

		var dataID = $(this).data('id');
		var selected = $(this).prop('checked');
		var dataUnselectedID = $(this).data('unselectedId');

		if (dataUnselectedID == undefined)
		{
			dataUnselectedID = $(this).data('uncheckedId');
		}
		
		if (!selected && dataUnselectedID != undefined)
		{
			dataID = dataUnselectedID;
		}
			
		var param =
		{
			selected: selected,
			dataID: dataID,
			dataContext: $(this).data(),
			controller: controller,
			scope: scope
		}

		if (controllerBefore != undefined)
		{
			app.controller[controllerBefore](param);
		}

		var ids = [];
		var uncheckedids = [];

		if (selected)
		{
			ids.push(dataID)
		}
		else
		{
			uncheckedids.push(dataID)
		}
		
		if (controller != undefined)
		{
			var inputs = $('input.myds-check[data-controller="' + controller + '"][data-context="' + context + '"]:visible');
		
			
			if (inputs.length != 1)
			{
	 			var checked = $('input.myds-check[data-controller="' + controller + '"][data-context="' + context + '"]:checked:visible');
	 			ids = $.map(checked, function (c)
	 			{
	 				return $(c).data('id')}
	 			);

	 			var unchecked = $('input.myds-check[data-controller="' + controller + '"][data-context="' + context + '"]:not(:checked):visible');
	 			uncheckedids = $.map(unchecked, function (c)
	 			{
	 				return $(c).data('id')}
	 			);
			}
		}
		else
		{
			var inputs = $('input.myds-check[data-scope="' + scope + '"][data-context="' + context + '"]:visible');
			
			if (inputs.length != 1)
			{
	 			var checked = $('input.myds-check[data-scope="' + scope + '"][data-context="' + context + '"]:checked:visible');
	 			ids = $.map(checked, function (c) {return $(c).data('id')});

	 			var unchecked = $('input.myds-check[data-scope="' + scope + '"][data-context="' + context + '"]:not(:checked):visible');
	 			uncheckedids = $.map(unchecked, function (c)
	 			{
	 				return $(c).data('id')}
	 			);
			}
		}
		
 		app.data[scope][context] = (ids.length==0?'':ids.join(','));
 		app.data[scope]['_' + context] = ids;

 		app.data[scope][context + '-unselected'] = (uncheckedids.length==0?'':uncheckedids.join(','));
 		app.data[scope]['_' + context + '-unselected'] = uncheckedids;

		if (controller != undefined)
		{	
			app.invoke(controller, param);
		}
	}		
});

$(document).off('keyup', '.myds-text')
.on('keyup', '.myds-text', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');
	var enter = $(this).data('enter');
	var clean = $(this).data('clean');

	var returnValue;

	if (event.which == '13' && enter == 'stop')
	{
		event.preventDefault();
		returnValue = false;
	}

	var val = $(this).val();
	var data = $(this).data();

	if (clean != 'disabled')
	{
		val = mydigitalstructure._util.clean(val);
		data = mydigitalstructure._util.data.clean(data);
	}

	if (scope != undefined && context != undefined)
	{
		if (app.data[scope] == undefined) {app.data[scope] = {}}
 		app.data[scope][context] = val;
 		app.data[scope]['_' + context] = data;
	}
	
	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = val;
 		app.data[controller]['_' + context] = data;
 		app.data[controller]['_' + context]._type = 'keyup';
 		app.data[controller]['_' + context]._source = event.target.id;
 		app.data[controller]['_' + context]._value = val;

		if (app.controller[controller] != undefined)
		{	
			if (app.data[controller].timerText != 0) {clearTimeout(app.data[controller].timerText)};
			
			var param = JSON.stringify(
			{
				dataContext: app.data[controller][context],
				_type: 'keyup',
				_dataContext: app.data[controller]['_' + context],
			});

			app.data[controller].timerText = setTimeout('app.controller["' + controller + '"](' + param + ')', 500);
		}
	}
	
	return returnValue
});

$(document).off('changeDate clearDate', '.myds-date, .myds-date-time')
.on('changeDate clearDate', '.myds-date, .myds-date-time', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');
	var enter = $(this).data('enter');
	var returnValue;

	if (controller == undefined) {controller = scope}

	if (controller == undefined)
	{
		controller = $(this).children('input').data('controller');
	}

	if (context == undefined)
	{
		context = $(this).children('input').data('context');
	}

	if (event.which == '13' && enter == 'stop')
	{
		event.preventDefault();
		returnValue = false;
   }
	
	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = event.format();
 		app.data[controller]['_' + context] = event;

		if (app.controller[controller] != undefined)
		{	
			if (app.data[controller].timerText != 0) {clearTimeout(app.data[controller].timerText)};
			
			var param = {dataContext: $(this).children('input').data()};

			if (context != undefined)
			{
				param.dataContext[context] = event.format();
				param.dataContext._value = event.format();
				param._type = 'dateChange'
			}

			app.data[controller].timerText = setTimeout('app.controller["' + controller + '"](' + JSON.stringify(param) + ')', 500);
		}
	}
	
	return returnValue
});

$(document).off('keypress', '.myds-text')
.on('keypress', '.myds-text', function (event)
{
	var enter = $(this).data('enter');

	if (event.which == '13' && enter == 'stop')
	{
		event.preventDefault();
		return false
    }
});


$(document).off('focusout', '.myds-focus')
.on('focusout', '.myds-focus', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');
	var clean = $(this).data('clean');

	var val = $(this).val();
	var data = $(this).data();

	if (clean != 'disabled')
	{
		val = mydigitalstructure._util.clean(val);
		data = mydigitalstructure._util.data.clean(data);
	}
	
	if (scope != undefined && context != undefined)
	{
		if (app.data[scope] == undefined) {app.data[scope] = {}}
 		app.data[scope][context] = val;
 		app.data[scope]['_' + context] = data;
	}

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

		app.data[controller][context] = val;
 		app.data[controller]['_' + context] = data;
 		app.data[controller]['_' + context]._type = 'focusout';
 		app.data[controller]['_' + context][context] = val;
 		app.data[controller]['_' + context]._value = val;
 	
		if (app.controller[controller] != undefined)
		{	
			app.controller[controller](
			{
				dataContext: app.data[controller]['_' + context],
				_type: 'focusout',
				_class: 'myds-text',
				_xhtmlElementID: $(this).attr('id')
			});
		}
	}		
});

$(document).off('focusout', '.myds-text-select')
.on('focusout', '.myds-text-select', function (event)
{
	if ($(this).val() == '')
	{
		var scope = $(this).data('scope');
		if (_.isUndefined(scope)) {scope = $(this).data('controller')}
		var context = $(this).data('context');
		
		if (scope != undefined && context != undefined)
		{
			if (!_.isUndefined(app.data[scope])) {app.data[scope][context] = ''}
			$(this).attr('data-id', '');
		}
	}
});

$(document).off('change', '.myds-text-select')
.on('change', '.myds-text-select', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');

	if (scope == undefined)
	{
		scope = controller;
	}

	var clean = $(this).data('clean');

	var val = $(this).val();
	var data = $(this).data();

	if (clean != 'disabled')
	{
		val = mydigitalstructure._util.clean(val);
		data = mydigitalstructure._util.data.clean(data);
	}
	
	if (scope != undefined && context != undefined)
	{
		if (app.data[scope] == undefined) {app.data[scope] = {}}
		
		if (val == '')
		{
			app.data[scope]['_' + context] = undefined;
			app.data[scope][context] = '';

			if ($(this).attr('data-none') != undefined)
			{
				app.data[scope][context] = $(this).attr('data-none');
			}
		}
		else
		{
			if (typeof $.fn.typeahead == 'function')
			{
				app.data[scope]['_' + context] = $(this).typeahead("getActive")

				if (app.data[scope]['_' + context] != undefined)
				{
					app.data[scope][context] = app.data[scope]['_' + context].id
					$(this).attr('data-id', app.data[scope][context].id);
				}
			}
			else
			{
	 			app.data[scope][context] = val;
	 			$(this).attr('data-id', val);
	 			app.data[scope]['_' + context] = data;
	 			app.data[scope]['_' + context]._type = 'change';
	 			app.data[scope]['_' + context][context] = val;
	 			app.data[scope]['_' + context]._value = val;
	 		}	
	 	}	
	}

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

		if (typeof $.fn.typeahead == 'function')
		{
			var set = $(this).attr('data-context-set');

			app.data[controller]['_' + context] = $(this).typeahead("getActive");

			if (set == 'id')
			{
				app.data[controller][context] = app.data[controller]['_' + context].id;
			}
			else
			{
				app.data[controller][context] = $(this).typeahead("getActive");
				app.data[controller][context + '-id'] = app.data[controller][context].id;
			}
				
			$(this).attr('data-id', app.data[controller][context].id);
		}
		else
		{
 			app.data[controller][context] = val;
 			app.data[controller]['_' + context] = data;
 			delete app.data[controller]['_' + context].chosen;  //?
 			app.data[controller]['_' + context]._type = 'change';
 			app.data[controller]['_' + context][context] = val;
 			app.data[controller]['_' + context]._value = val;
 		}	

		if (app.controller[controller] != undefined)
		{				
			var param =
			{
				dataContext: app.data[controller]['_' + context],
				_type: 'change',
				_class: 'myds-text-select',
				_xhtmlElementID: $(this).attr('id')
			}

			app.controller[controller](param);
		}
	}		
});

$(document).off('change', '.myds-select')
.on('change', '.myds-select', function (event)
{
	var controller = $(this).data('controller');
	var scope = $(this).data('scope');
	var context = $(this).data('context');

	var clean = $(this).data('clean');

	var val = $(this).val();
	var data = $(this).data();

	if (clean != 'disabled')
	{
		val = mydigitalstructure._util.clean(val);
		data = mydigitalstructure._util.data.clean(data);
	}
	
	if (scope != undefined && context != undefined)
	{
		if (app.data[scope] == undefined) {app.data[scope] = {}}
 		app.data[scope][context] = val;
 		app.data[scope]['_' + context] = data;
	}

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

		app.data[controller][context] = val;
 		app.data[controller]['_' + context] = data;
 	
		if (app.controller[controller] != undefined)
		{	
			app.controller[controller]({dataContext: app.data[controller]['_' + context]});
		}
	}		
});

$(document).off('change', '.myds-change')
.on('change', '.myds-change', function (event)
{
	var controller = $(this).data('controller');
	var context = $(this).data('context');
	var clean = $(this).data('clean');

	var val = $(this).val();
	var data = $(this).data();

	if (clean != 'disabled')
	{
		val = mydigitalstructure._util.clean(val);
		data = mydigitalstructure._util.data.clean(data);
	}

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = val;
 		app.data[controller]['_' + context] = data;

		if (app.controller[controller] != undefined)
		{	
			var param = {dataContext: app.data[controller][context]}
			app.controller[controller](param);
		}
	}		
});

$(document).off('click', '.myds-sort')
.on('click', '.myds-sort', function (event)
{
	var sort = $(this).attr('data-sort');
	var sortDirection = $(this).attr('data-sort-direction');
	var controller = $(this).attr('data-controller');
	var scope = $(this).attr('data-scope');
	var context = $(this).attr('data-context');
	var clean = $(this).data('clean');

	var val = $(this).val();
	var data = $(this).data();

	if (scope == undefined) {scope = controller}

	if (clean != 'disabled')
	{
		val = mydigitalstructure._util.clean(val);
		data = mydigitalstructure._util.data.clean(data);
	}

	if (_.isUndefined(controller))
	{
		controller = $(this).parent().attr('data-controller');
	}

	if (_.isUndefined(context))
	{
		context = $(this).parent().attr('data-context');
	}

	if (_.isUndefined(context))
	{
		context = 'sort';
	}

	if (_.isUndefined(sortDirection))
	{
		sortDirection = 'desc';
	}

	sortDirection = (sortDirection=='desc'?'asc':'desc')

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = {name: sort, direction: sortDirection};
 		app.data[controller]['_' + context] = data;

		if (app.controller[controller] != undefined)
		{	
			var param = {sort: app.data[controller][context]}
			param.context = context;
			app.controller[controller](param);
		}
	}		
});

$(document).off('focusout keyup', '.myds-validate')
.on('focusout keyup', '.myds-validate', function (event)
{
	mydigitalstructure._util.validate.check(
	{
		element: $(this)
	});
});

$(document).off('change.select2 select2:clear', '.myds-validate')
.on('change.select2 select2:clear', '.myds-validate', function (event)
{
	mydigitalstructure._util.validate.check(
	{
		element: $(this)
	});
});

$(document).off('dp.change change.datetimepicker', '.myds, .myds-date, .myds-date-time')
.on('dp.change  change.datetimepicker', '.myds, .myds-date, .myds-date-time', function(event)
{
	var element = $(event.target).children('input');

	var controller = element.data('controller');
	var scope = element.data('scope');
	if (controller == undefined) {controller = scope}

	var context = element.data('context');

	var val = mydigitalstructure._util.clean(element.val());
	var data = mydigitalstructure._util.data.clean(element.data());

	if (controller != undefined && context != undefined)
	{	
 		if (app.data[controller] == undefined) {app.data[controller] = {}}

 		app.data[controller][context] = val;
 		app.data[controller]['_' + context] = data;

		if (app.controller[controller] != undefined)
		{	
			var param = {dataContext: app.data[controller][context]}
			app.controller[controller](param);
		}
	}

	if ($(element).hasClass('myds-validate'))
	{
		mydigitalstructure._util.validate.check(element);
	}
});

$(document).off('change.bs.fileinput', '.myds')
.on('change.bs.fileinput', '.myds', function(event)
{
	var element = $(event.target);
	var elementInput = element.find('input[type="file"]');

	if (elementInput.attr('type') == 'file')
	{
		var controller = element.data('controller');
		var context = element.data('context');

		if (context == undefined) {context = 'file'}

		if (controller != undefined)
		{	
			if (app.data[controller] == undefined) {app.data[controller] = {}}

			if (elementInput.length > 0)
			{
				app.data[controller][context] = {id: elementInput.attr('id')};
				app.data[controller]['_' + context] = elementInput;
			}

			if (app.controller[controller] != undefined)
			{	
				var param = {dataContext: app.data[controller][context]}
				app.controller[controller](param);
			}
		}
	}
});

if (typeof $.fn.metisMenu == 'function')
{ 
	$(document).off('click', '.myds-menu a')
	.on('click', '.myds-menu a', function (e)
	{
		mydigitalstructure._util.menu.set(
		{
			element: $(this)
		});
	});
}

$(document).on('change', '.custom-file-input', function()
{
   let fileName = $(this).val().split('\\').pop();
   $(this).next('.custom-file-label').addClass("selected").html(fileName);
}); 

if (typeof $.fn.tab == 'function')
{ 
	$(document).off('click', '.myds-tab a')
	.on('click', '.myds-tab a', function (e)
	{
		e.preventDefault()
		$(this).tab('show');
		$('.nav-tabs a :visible').parent().parent().removeClass('active');
		$('.nav-tabs a[href="' + $(this).attr("href") + '"] :visible').parent().parent().addClass('active');
	});

	$(document).off('click', '.myds-tab')
	.on('click', '.myds-tab', function (e)
	{
		e.preventDefault()
		$('a[href="' + $(this).attr('href') + '"]').tab('show');
	});

	$(document).off('click', '.myds-pill a')
	.on('click', '.myds-pill a', function (e)
	{
	  	e.preventDefault()
	  	$(this).tab('show');
	});	

	$(document).off('shown.bs.tab show.bs.tab', '.app-tab a, .app-pill a, .myds-tab a')
					.on('shown.bs.tab show.bs.tab', '.app-tab a, .app-pill a, .myds-tab a', function(event)
	{
		var uriContext = $(event.target).attr('href').replace('#', '');
		var controller = $(event.target).attr('data-controller');
		var onshow = $(event.target).attr('data-on-show');

		var status = event.type;

		if (onshow != undefined && event.type == 'show' || event.type == 'shown')
		{
			if (controller == undefined)
			{
				controller = $(event.target).parent().parent().attr('data-controller');
			}

			if (_.has(mydigitalstructure._scope.app.view, 'data'))
			{
				mydigitalstructure._util.view.track(
				{
					view: mydigitalstructure._scope.app.view.data,
					uri: mydigitalstructure._scope.app.uri,
					uriContext: uriContext
				});
			}

			if (controller != undefined)
			{
				var param =
				{
					uriContext: uriContext,
					status: status,
					dataContext: $(event.target).data()
				}

				app.data[controller] = param;

				if (app.controller[controller] != undefined)
				{
					app.controller[controller](param);
				}
				else
				{
					mydigitalstructure._util.log.add(
					{
						message: 'Controller not defined',
						controller: controller,
						param: param
					});
				}
			}
			else
			{
				if (app.controller[uriContext] != undefined)
				{
					if (app.data[uriContext] == undefined) {app.data[uriContext] = {}};
					app.controller[uriContext]();
				}
				else
				{
					var uriContext = uriContext.split('_');

					if (app.controller[uriContext[0]] != undefined)
					{
						if (app.data[uriContext[0]] == undefined) {app.data[uriContext[0]] = {}};
						app.controller[uriContext[0]]({context: uriContext[1]})
					}
				}
			}
		}
	});
}

if (typeof $.fn.modal == 'function')
{ 
	$(document).off('shown.bs.modal')
	.on('shown.bs.modal', function (event)
	{
		var id = event.target.id;

		if (id != '')
		{			
			var controller = $(event.target).attr('data-controller');
			if (controller == undefined) {controller = id}

			var param = {viewStatus: 'shown'}

			if (mydigitalstructure._scope.app.uriContext != undefined)
			{ 
				param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
			}

			if (event.relatedTarget != undefined)
			{
				param.dataContext = $(event.relatedTarget).data();
				$(event.target.id).data('context', param.dataContext);
			}
			else if (mydigitalstructure._scope.app.dataContext != undefined)
			{
				param = $.extend(true, param, {dataContext: mydigitalstructure._scope.app.dataContext})
			}

			if (app.data[id] == undefined) {app.data[id] = {}};
			app.data[id] = _.extend(app.data[id], param);

			if (app.data[controller] == undefined) {app.data[controller] = {}};
			app.data[controller] = _.extend(app.data[controller], param);

			if (_.has(mydigitalstructure._scope.app.view, 'data'))
			{
				mydigitalstructure._util.view.track(
				{
					view: mydigitalstructure._scope.app.view.data,
					uri: mydigitalstructure._scope.app.options.startURI,
					uriContext: id,
					dataContext: param.dataContext
				});
			}

			if (app.controller[controller] != undefined)
			{	
				app.controller[controller](param);
			}
		}	
    });

    $(document).off('show.bs.modal')
    .on('show.bs.modal', function (event)
	{
		var id = event.target.id;

		mydigitalstructure._util.reset({controller: id});

		var controller;

		if ($(event.target).attr('data-controller-show') != undefined)
		{
			controller = $(event.target).attr('data-controller-show')
		}

		var param = {viewStatus: 'show'}

		if (mydigitalstructure._scope.app.uriContext != undefined)
		{ 
			param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
		}

		if (id != '')
		{
			if (event.relatedTarget != undefined)
			{
				param.dataContext = $(event.relatedTarget).data();
				$(event.target.id).data('context', param.dataContext);
			}
			if (event.target != undefined)
			{
				param.dataContext = $(event.target).data();
				$(event.target.id).data('context', param.dataContext);
			}
			else if (mydigitalstructure._scope.app.dataContext != undefined)
			{
				param = $.extend(true, param, {dataContext: mydigitalstructure._scope.app.dataContext})
			}

			if (app.data[id] == undefined) {app.data[id] = {}};
			app.data[id] = _.extend(app.data[id], param);
		}	

		if (app.controller[controller] != undefined)
		{	
			if (app.data[controller] == undefined) {app.data[controller] = {}};
			app.data[controller] = _.extend(app.data[controller], param);

			app.controller[controller](param);
		}

		if (typeof $.fn.popover == 'function')
		{ 
			$('.popover').popover('hide');
		}	
	});
}

if (typeof $.fn.collapse == 'function')
{
	$(document).off('hidden.bs.collapse', '.myds-collapse')
	.on('hidden.bs.collapse', '.myds-collapse', function (event)
	{
		var id = event.target.id;

		var controller = $(event.target).attr('data-controller')
		if (controller == undefined) {controller = $(event.target).attr('data-scope')}
		if (controller == undefined) {controller = id}

		if (id != '')
		{	
			var source = $('[data-target="#' + id + '"]');
			if (source != undefined)
			{	
				if (source.html() != undefined && source.attr('data-auto') != 'false')
				{	
					if ((source.html()).indexOf('Hide') != -1)
					{
						source.html(source.html().replace('Hide', 'Show'));
					}
				}	
			}	

			if (app.controller[controller] != undefined)
			{
				if (app.data[controller] == undefined) {app.data[controller] = {}};
				app.data[controller] = _.extend(app.data[controller], {status: 'hidden'});

				if (typeof app.controller[controller] == 'function')
				{
					app.controller[controller]({status: 'hidden'});
				}
			}
		}	
    });

    $(document).off('shown.bs.collapse', '.myds-collapse:visible')
	.on('shown.bs.collapse', '.myds-collapse:visible', function (event)
	{
		var processEvent = true;
		var eventID;

		_.each(event, function (value, key)
		{
			if (_.includes(key, 'jQuery'))
			{
				eventID = _.replace(key, 'jQuery', '')
			}
		});

		if (eventID != undefined)
		{
			if (mydigitalstructure._events == undefined)
			{
				mydigitalstructure._events = {}
			}

			processEvent = (mydigitalstructure._events[eventID] == undefined);
			mydigitalstructure._events[eventID] = event;
		}

		//if (processEvent)
		if (true)
		{
			var id = event.target.id;

			var controller = $(event.target).attr('data-controller')
			if (controller == undefined) {controller = $(event.target).attr('data-scope')}
			if (controller != undefined) {id = controller}
			
			if (id != '')
			{	
				var source = $('[data-target="#' + id + '"]');
				if (source != undefined)
				{
					if (source.html() != undefined && source.attr('data-auto') != 'false')
					{
						if ((source.html()).indexOf('Show') != -1)
						{
							source.html(source.html().replace('Show', 'Hide'));
						}
					}	
				}	

				if (app.controller[id] != undefined)
				{
					if (app.data[id] == undefined) {app.data[id] = {}};
					app.data[id].viewStatus = 'shown';
					app.data[id].dataContext = $(event.target).data();

					if (typeof app.controller[id] == 'function')
					{
						app.controller[id](
						{
							status: 'shown',
							dataContext: $(event.target).data()
						});
					}
				}
			}	
		}
    });
	
	$(document).off('show.bs.collapse', '.myds-collapse:visible')
	.on('show.bs.collapse', '.myds-collapse:visible', function (event)
	{
		var id = event.target.id;

		var onshow = $(event.target).attr('data-on-show');

		if (onshow)
		{
			if ($(event.target).attr('data-controller') != undefined)
			{
				id = $(event.target).attr('data-controller')
			}
			
			if (id != '')
			{	
				if (app.controller[id] != undefined)
				{
					if (app.data[id] == undefined) {app.data[id] = {}};
					app.data[id].viewStatus = 'show';
					app.data[id].dataContext = $(event.target).data();
					app.controller[id](
					{
						status: 'show',
						dataContext: $(event.target).data()
					});
				}
			}	
		}
   });
}    

if (typeof $.fn.popover == 'function')
{ 
	//myds-popover
   $(document).off('shown.bs.popover').on('shown.bs.popover', function (event)
	{
		if (event.target != undefined)
		{
			var id = event.target.id;
			if (id == '') {id = $(event.target).attr('data-controller')}

			if (id != '')
			{	
				var param = {}

				if (mydigitalstructure._scope.app.uriContext != undefined)
				{ 
					param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
				}

				param.dataContext = 
				{
					id: $(event.target).attr('data-id'),
					reference: $(event.target).attr('data-reference'),
				}
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
    });

	$(document).off('show.bs.popover').on('show.bs.popover', function (event)
	{
		$('.popover:visible').popover("hide")	
    });
}    

if (typeof $.fn.carousel == 'function')
{ 
	//myds-popover
   $(document).off('slide.bs.carousel', 'myds-slide')
   .on('slide.bs.carousel', 'myds-slide', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var id = event.relatedTarget.id;
			if (id == '') {id = $(event.relatedTarget).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'slide'}

				if (mydigitalstructure._scope.app.uriContext != undefined)
				{ 
					param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
				}

				param.dataContext = 
				{
					id: $(event.relatedTarget).attr('data-id'),
					reference: $(event.relatedTarget).attr('data-reference'),
				}
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
	});
}

if (typeof $.fn.carousel == 'function')
{ 
    $(document).off('slid.bs.carousel')
    .on('slid.bs.carousel', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var id = event.relatedTarget.id;
			if (id == '') {id = $(event.relatedTarget).attr('data-controller')}

			if (id != '')
			{	
				var param = {status: 'slid'}

				if (mydigitalstructure._scope.app.uriContext != undefined)
				{ 
					param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
				}

				param.dataContext = 
				{
					id: $(event.relatedTarget).attr('data-id'),
					reference: $(event.relatedTarget).attr('data-reference'),
				}
			}	

			if (app.controller[id] != undefined)
			{
				if (app.data[id] == undefined) {app.data[id] = {}};
				app.controller[id](param);
			}
		}	
	});
}

if (typeof $.fn.dropdown == 'function')
{ 
	$(document).off('show.bs.dropdown', '.myds-dropdown')
	.on('show.bs.dropdown', '.myds-dropdown', function (event)
	{
		if (event.relatedTarget != undefined)
		{
			var controller = $(event.relatedTarget).data('controller');

			var param = {status: 'show'}

			if (mydigitalstructure._scope.app.uriContext != undefined)
			{ 
				param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
			}

			param.dataContext = mydigitalstructure._util.data.clean($(event.relatedTarget).data());
			
			if (app.data[controller] == undefined) {app.data[controller] = {}}
			app.data[controller].dataContext = param.dataContext;

			mydigitalstructure._util.controller.invoke({name: controller}, param)
		}	
	});
}

$(document).off('click', '.myds-more')
.on('click', '.myds-more', function (event)
{
	$(this).addClass('disabled');

	var id = $(this).attr('data-id');
	var start = $(this).attr('data-start');
	var rows = $(this).attr('data-rows');
	var controller = $(this).attr('data-controller');
	var context = $(this).attr('data-context');

	if (controller != undefined)
	{
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.data[controller].dataContext = mydigitalstructure._util.data.clean($(this).data());
	}

	mydigitalstructure._util.view.moreSearch(
	{
		id: id,
		startrow: start,
		rows: rows,
		controller: controller,
		context: context
	});
});

$(document).off('click', '.myds-page')
.on('click', '.myds-page', function (event)
{
	$(this).addClass('disabled');

	var id = $(this).attr('data-id');
	var page = $(this).attr('data-page');
	var pages = $(this).attr('data-pages');
	var showPages = $(this).attr('data-show-pages');
	var showPagesMaximum = $(this).attr('data-show-pages-maximum');
	var controller = $(this).attr('data-controller');
	var context = $(this).attr('data-context');
	var start = $(this).attr('data-start');
	var rows = $(this).attr('data-rows');

	if (controller != undefined)
	{
		if (app.data[controller] == undefined) {app.data[controller] = {}}
		app.data[controller].dataContext = mydigitalstructure._util.data.clean($(this).data());
	}
	
	mydigitalstructure._util.view.showPage(
	{
		id: id,
		number: page,
		pages: pages,
		showPages: showPages,
		showPagesMaximum: showPagesMaximum,
		controller: controller,
		context: context,
		startrow: start,
		rows: rows
	});
});

String.prototype.formatXHTML = function(bDirection)
{
	var sValue = this;
	
	var aFind = [
		String.fromCharCode(8220),
		String.fromCharCode(8221),
		String.fromCharCode(8216),
		String.fromCharCode(8217),
		String.fromCharCode(8211),
		String.fromCharCode(8212),
		String.fromCharCode(189),
		String.fromCharCode(188),
		String.fromCharCode(190),
		String.fromCharCode(169), 
		String.fromCharCode(174),
		String.fromCharCode(8230)
	];	

	var aReplace = [
		'"',
		'"',
		"'",
		"'",
		"-",
		"--",
		"1/2",
		"1/4",
		"3/4",
		"(C)",
		"(R)",
		"..."
	];

	if (bDirection)
	{
		sValue = sValue.replace(/\&/g,'&amp;');
		sValue = sValue.replace(/</g,'&lt;');
		sValue = sValue.replace(/>/g,'&gt;');
		sValue = sValue.replace(/-/g, '&#45;');
		sValue = sValue.replace(/@/g, '&#64;');
		sValue = sValue.replace(/\//g, '&#47;');
		sValue = sValue.replace(/"/g, '&quot;');
		sValue = sValue.replace(/\\/g, '&#39;');
	}
	else
	{
		sValue = sValue.replace(/\&amp;/g,'&');
		sValue = sValue.replace(/\&lt;/g,'<');
		sValue = sValue.replace(/\&gt;/g,'>');
		sValue = sValue.replace(/\&#45;/g, '-');
		sValue = sValue.replace(/\&#64;/g, '@');
		sValue = sValue.replace(/\&#47;/g, '/');
		sValue = sValue.replace(/\&quot;/g, '"');
		sValue = sValue.replace(/\&#39;/g, '\'');
		sValue = sValue.replace(/\&#60;/g,'<');
		sValue = sValue.replace(/\&#62;/g,'>');
		sValue = sValue.replace(/\&#244;/g,'\'');
		sValue = sValue.replace(/[\u0092]/g,'\'');

		for ( var i = 0; i < aFind.length; i++ ) 
		{
			var regex = new RegExp(aFind[i], "gi");
			sValue = sValue.replace(regex, aReplace[i]);
		}
	}
	
	return sValue;
};

mydigitalstructure._util.view.more = function (response, param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var scope = mydigitalstructure._util.param.get(param, 'scope').value;
	var queue = mydigitalstructure._util.param.get(param, 'queue').value;
	var context = mydigitalstructure._util.param.get(param, 'context').value;
	var button = $('button[data-id="' + response.moreid + '"]');
	var styles = mydigitalstructure._scope.app.options.styles;
	var buttonClass = 'btn btn-default btn-sm';
	var orientation = mydigitalstructure._util.param.get(param, 'orientation', {"default": 'vertical'}).value;
	var pageRows = mydigitalstructure._util.param.get(param, 'rows', {"default": mydigitalstructure._scope.app.options.rows}).value;
	var progressive = mydigitalstructure._util.param.get(param, 'progressive', {"default": true}).value;
	var containerID = mydigitalstructure._util.param.get(param, 'containerID').value;
	var showAlways = mydigitalstructure._util.param.get(param, 'showAlways', {"default": false}).value;
	var showFooter = mydigitalstructure._util.param.get(param, 'showFooter', {"default": true}).value;

	if (scope == undefined) {scope = queue}

	if (containerID != undefined)
	{
		queue = containerID;
		param = mydigitalstructure._util.param.set(param, 'queue', queue);
		app.vq.clear({queue: queue})
	}

	if (_.isObject(styles))
	{
		if (!_.isUndefined(styles.button))
		{
			buttonClass = styles.button;
		}
	}

	if (_.isUndefined(controller)) {controller = queue}

	if (_.isUndefined(mydigitalstructure._scope.data[scope]))
	{
		mydigitalstructure._scope.data[scope] = {}
	}

	mydigitalstructure._scope.data[scope]._retrieve = _.clone(response);

	if (orientation == 'vertical')
	{
		if (response.morerows == 'true' && !_.isUndefined(scope))
		{
			app.vq.add('<div class="text-center m-b m-t mb-2 mt-2">' +
      					'<button class="' + buttonClass + ' myds-more" data-id="' + response.moreid + '"' +
      					' data-start="' + (_.toNumber(response.startrow) + _.toNumber(response.rows)) + '"' +
      					' data-rows="' + response.rows + '"' +
      					' data-context="' + context + '"' +
      					' data-controller="' + controller + '">' +
        					'Show More</button></div>', param);

			if (_.isObject(app.data[scope]))
			{
				if (!_.isUndefined(app.data[scope].count))
				{
					if (showFooter)
					{
						app.vq.add('<div class="text-center m-b mb-2 small text-muted"><span class="myds-info" data-id="' + response.moreid + '">' +
										(_.toNumber(response.startrow) + _.toNumber(response.rows)) + ' of ' + app.data[scope].count + '</span></div>', param);
					}
				};
			}

			button.removeClass('disabled');
			button.blur();
		}
		else
		{
			if (showFooter)
			{
				app.vq.add('<div class="text-center m-b m-t mb-2 mb-2 small text-muted">' +
									'All ' + app.data[scope].count + ' shown</div>', param);
			}
		}
	}
	else //horizontal
	{
		var data = mydigitalstructure._util.data.get(
		{
			controller: scope
		});

		var rowsTotal = data.count;
		var rowsCurrent = data.all.length;
		var pagesCurrent = Math.ceil(_.toNumber(rowsCurrent) / _.toNumber(pageRows));
		var pagesTotal = Math.ceil(_.toNumber(rowsTotal) / _.toNumber(pageRows));
		var startRow = response.startrow;

		var currentPage = mydigitalstructure._util.data.get(
		{
			scope: 'util-view-table',
			context: context,
			name: 'currentPage'
		});

		if (currentPage == undefined)
		{
			currentPage = Math.ceil((_.toNumber(startRow) + _.toNumber(pageRows)) / _.toNumber(pageRows));
		}

		currentPage = _.toNumber(currentPage);
		
		var allPagesTotal = pagesTotal;
		var showPagesTotal = currentPage;
		var showPagesMaximum;

		if (data._param != undefined)
		{
			if (data._param.options != undefined)
			{
				showPagesMaximum = data._param.options.countPagesAtStart
			}
		}

		if (showPagesMaximum == undefined)
		{
			showPagesMaximum = (progressive?0:10)
		}

		if (showPagesTotal < showPagesMaximum) {showPagesTotal = showPagesMaximum} 

		if (!progressive)
		{
			if (pagesTotal > showPagesTotal) //20
			{
				pagesTotal = showPagesTotal;
			}
		}

		var bPrevious = false;
		var bNext = true;

		if (currentPage != 1)
		{
			bPrevious = true
		}

		if (currentPage == pagesTotal)
		{
			bNext = false
		}

		if (progressive)
		{
			if (data._pages == undefined)
			{
				data._pages = []
			}

			var page = $.grep(data._pages, function (page) {return page.number == currentPage})[0];

			if (page == undefined)
			{
				page =
				{
					number: currentPage,
					start: startRow,
					rows: pageRows
				}

				data._pages.push(page)
			}
		}
		else
		{
			//data._pages = _.times(pagesTotal, function(p)
			data._pages = _.times(allPagesTotal, function(p)
			{
				return {number: p+1, start: (pageRows * p), rows: pageRows}
			});
		}

		var html = [];

		html.push('<nav aria-label="page navigation">' +
						  	'<ul class="pagination">');

		if (!progressive)
		{
			html.push('<li class="page-item' + (bPrevious?'':' disabled') + ' myds-previous"' +
									' data-id="' + response.moreid + '"' +
									'>' +
							   	'<a class="page-link myds-page" aria-label="Previous"' +
							   	' data-id="' + response.moreid + '"' +
						      	' data-page="' + (_.toNumber(currentPage) - 1) + '"' +
									' data-pages="' + allPagesTotal + '"' +
									' data-show-pages="' + showPagesTotal + '"' +
									' data-show-pages-maximum="' + showPagesMaximum + '"' +
									' data-start="' + (_.toNumber(startRow) - _.toNumber(pageRows)) + '"' +
									' data-rows="' + pageRows + '"' +
									' data-controller="' + controller + '"' +
		      					' data-context="' + context + '"' +
							   	(bPrevious?' style="cursor:pointer;"':'') +
							   	' data-id="' + response.moreid + '"' +
							   	'>' +
							        	'<span aria-hidden="true">&laquo;</span>' +
							        	'<span class="sr-only">Previous</span>' +
							      '</a>' +
							   '</li>');
		}	

		var firstShowPage = (showPagesTotal - showPagesMaximum) + 1;
		var lastShowPage = (showPagesTotal)

		if (currentPage < firstShowPage)
		{
			firstShowPage = currentPage
			lastShowPage = firstShowPage + showPagesMaximum
		}

		if ((currentPage + 1) > (showPagesMaximum/2))
		{
			if ((currentPage + (showPagesMaximum/2)) > allPagesTotal)
			{
				firstShowPage = allPagesTotal - showPagesMaximum
				lastShowPage = allPagesTotal
			}
			else
			{
				firstShowPage = currentPage - (showPagesMaximum / 2);
				lastShowPage = currentPage + (showPagesMaximum / 2)
			}
		}

		$.each(data._pages, function (p, page)
		{
			html.push('<li class="page-item' + (page.number==currentPage?' active':'') + 
								((page.number >= firstShowPage) && (page.number <= lastShowPage)?'':' hidden d-none') + '"' +
								' data-page="' + page.number + '"' +
								' data-id="' + response.moreid + '">' +
								'<a class="page-link myds-page" style="cursor:pointer;"' +
								' data-page="' + page.number + '"' +
								' data-pages="' + allPagesTotal + '"' +
								' data-show-pages="' + showPagesTotal + '"' +
								' data-show-pages-maximum="' + showPagesMaximum + '"' +
								' data-id="' + response.moreid + '"' +
								' data-start="' + page.start + '"' +
								' data-rows="' + page.rows + '"' +
								' data-controller="' + controller + '"' +
	      					' data-context="' + context + '"' +
								'>' + page.number + '</a></li>');
		});

		if (progressive)
		{	
			if (bNext)
			{
				html.push('<li class="page-item">' +
						      '<a class="page-link myds-more myds-page" aria-label="Next" style="cursor:pointer;"' +
						      	' data-id="' + response.moreid + '"' +
						      	' data-start="' + (_.toNumber(response.startrow) + _.toNumber(response.rows)) + '"' +
	      						' data-rows="' + response.rows + '"' +
	      						' data-controller="' + controller + '"' +
	      						' data-context="' + context + '"' +
						      '>More' +
						      '</a>' +
						   '</li>');
			}
						   
			html.push('</ul></nav>');
		}
		else
		{
			if (response.morerows == 'false')
			{
				allPagesTotal = currentPage
			}

			if (currentPage < allPagesTotal)
			{
				html.push('<li class="page-item myds-next">' +
						      '<a class="page-link myds-page" aria-label="Next" style="cursor:pointer;"' +
						      	' data-id="' + response.moreid + '"' +
						      	' data-page="' + (_.toNumber(currentPage) + 1) + '"' +
									' data-pages="' + allPagesTotal + '"' +
									' data-show-pages="' + showPagesTotal + '"' +
									' data-show-pages-maximum="' + showPagesMaximum + '"' +
									' data-start="' + (_.toNumber(startRow) + _.toNumber(pageRows)) + '"' +
									' data-rows="' + pageRows + '"' +
									' data-controller="' + controller + '"' +
		      					' data-context="' + context + '"' +
						      	'>' +
						        	'<span aria-hidden="true">&raquo;</span>' +
						        	'<span class="sr-only">More</span>' +
						      '</a>' +
						   '</li>' +
						  	'</ul>' +
						'</nav>');

			}
			else
			{
				html.push('<li class="page-item' + (bNext?'':' disabled') + ' myds-next"' +
								' data-id="' + response.moreid + '"' +
								'>' +
						      '<a class="page-link myds-page" aria-label="Next"' +
						      	' data-id="' + response.moreid + '"' +
						      	' data-page="' + (_.toNumber(currentPage)) + '"' +
									' data-pages="' + allPagesTotal + '"' +
									' data-show-pages="' + showPagesTotal + '"' +
									' data-show-pages-maximum="' + showPagesMaximum + '"' +
									' data-start="' + (_.toNumber(startRow) + _.toNumber(pageRows)) + '"' +
									' data-rows="' + pageRows + '"' +
									' data-controller="' + controller + '"' +
		      					' data-context="' + context + '"' +
						      	(bNext?' style="cursor:pointer;"':'') + '>' +
						        	'<span aria-hidden="true">&raquo;</span>' +
						        	'<span class="sr-only">More</span>' +
						      '</a>' +
						   '</li>' +
						  	'</ul>' +
						'</nav>');
			}	
		}

		app.vq.add('<div class="text-center m-b mb-2 small text-muted" data-id="' + response.moreid + '">' + 
									html.join('') + '</div>', param);
	}

	if (containerID != undefined)
	{
		if (showAlways || allPagesTotal != 1)
		{
			app.vq.render('#' + containerID, param);
		}	
	}
}

mydigitalstructure._util.view.showPage = function (param)
{
	var number = mydigitalstructure._util.param.get(param, 'number').value;
	var pages = mydigitalstructure._util.param.get(param, 'pages').value;
	var context = mydigitalstructure._util.param.get(param, 'context').value;
	var showPages = mydigitalstructure._util.param.get(param, 'showPages').value;
	var showPagesMaximum = mydigitalstructure._util.param.get(param, 'showPagesMaximum').value;
	var id = mydigitalstructure._util.param.get(param, 'id').value;

	if (number != undefined)
	{
		mydigitalstructure._util.data.set(
		{
			scope: 'util-view-table',
			context: context,
			name: 'currentPage',
			value: number
		});

		if (pages == number)
		{
			$('li.myds-next[data-id="' + id + '"]').addClass('disabled');
			$('li.myds-next[data-id="' + id + '"] a').removeAttr('style');
		}
		else
		{
			$('li.myds-next[data-id="' + id + '"]').removeClass('disabled');
			$('li.myds-next[data-id="' + id + '"] a').attr('style', 'cursor:pointer;');
		}

		if (number == 1)
		{
			$('li.myds-previous[data-id="' + id + '"]').addClass('disabled');
			$('li.myds-previous[data-id="' + id + '"] a').removeAttr('style');
		}
		else
		{
			$('li.myds-previous[data-id="' + id + '"]').removeClass('disabled');
			$('li.myds-previous[data-id="' + id + '"] a').attr('style', 'cursor:pointer;');
		}

		if ($('div.myds-page-view[data-page="' + number + '"][data-context="' + context + '"]').length != 0)
		{
			$('div.myds-page-view[data-context="' + context + '"]').hide();
			$('div.myds-page-view[data-page="' + number + '"][data-context="' + context + '"]').show();

			$('li.page-item[data-id="' + id + '"]').removeClass('active');
			$('li.page-item[data-id="' + id + '"][data-page="' + number + '"]').addClass('active');
			$('li.page-item[data-id="' + id + '"][data-page="' + number + '"]').removeClass('hidden d-none');

			var previous = $('li.myds-previous a')
			if (previous.length != 0)
			{
				var previousPage = parseInt(previous.attr('data-page'));

				if (number != 1)
				{
					previous.attr('data-page', (parseInt(number) - 1))
				}
			}

			var next = $('li.myds-next a')
			if (next.length != 0)
			{
				var nextPage = parseInt(next.attr('data-page'));

				if (number != pages)
				{
					next.attr('data-page', (parseInt(number) + 1))
				}
			}

			var currentPage = _.toNumber(number);
			var firstShowPage = 1;
			var lastShowPage = _.toNumber(showPagesMaximum);
			var allPagesTotal = _.toNumber(pages);
			showPagesMaximum = _.toNumber(showPagesMaximum);

			var shownPages = (parseInt(pages) - parseInt(number) + 1); //check

			if ((currentPage + 1) > (showPagesMaximum/2))
			{
				if ((currentPage + (showPagesMaximum/2)) > allPagesTotal)
				{
					firstShowPage = allPagesTotal - showPagesMaximum
					lastShowPage = allPagesTotal
				}
				else
				{
					firstShowPage = currentPage - (showPagesMaximum / 2);
					lastShowPage = currentPage + (showPagesMaximum / 2)
				}
			}

			$('div[data-id="' + id + '"] li.page-item[data-page]').addClass('hidden d-none');

			_.each(_.range(firstShowPage, lastShowPage + 1), function (pageNumber)
			{
				$('div[data-id="' + id + '"] li.page-item[data-page="' + _.toString(pageNumber) + '"]').removeClass('hidden d-none');
			})

			if (shownPages > parseInt(showPagesMaximum))
			{	
				//$('li.page-item[data-page="' + (parseInt(number) + parseInt(showPagesMaximum) ) + '"]').addClass('hidden d-none');

				$('li.myds-next[data-id="' + id + '"]').removeClass('disabled');
				$('li.myds-next[data-id="' + id + '"] a').attr('style', 'cursor:pointer;');
			}

			var onComplete = mydigitalstructure._util.data.get(
			{
				scope: context,
				context: '_param',
				name: 'onComplete'
			});
			
			mydigitalstructure._util.onComplete({onComplete: onComplete});
		}
		else
		{
			$('li.page-item[data-id="' + id + '"]').addClass('disabled');
			//$('li.page-item[data-id="' + id + '"][data-page="' + number + '"] a').html('...')
			mydigitalstructure._util.view.moreSearch(param)
		}
	}
}

mydigitalstructure._util.view.moreSearch = function (param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var controllerParam = mydigitalstructure._util.param.get(param, 'controllerParam').value;

	var queue = mydigitalstructure._util.param.get(param, 'queue').value;

	if (!_.isUndefined(controller))
	{
		if (!_.isFunction(controller))
		{
			controller = app.controller[controller];
		}

		if (_.isFunction(controller))
		{	
			mydigitalstructure._util.send(
			{
				data: param,
				callback: controller,
				callbackParam: controllerParam,
				type: 'POST',
				url: '/rpc/core/?method=CORE_SEARCH_MORE',
			});
		}	
	}	
}

if (mydigitalstructure._util.data == undefined) {mydigitalstructure._util.data = {}}

mydigitalstructure._util.data.find = function (param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var scope = mydigitalstructure._util.param.get(param, 'scope').value;

	var context = mydigitalstructure._util.param.get(param, 'context').value;
	
	var dataController = mydigitalstructure._util.param.get(param, 'dataController', {'default': 'setup'}).value;
	var dataController = mydigitalstructure._util.param.get(param, 'dataController', {'default': 'setup'}).value;
	var dataContext = mydigitalstructure._util.param.get(param, 'dataContext').value; 
	
	if (controller == undefined) {controller = scope}

	if (dataContext == undefined && dataController == 'setup')
	{
		dataContext = context;
	}
		
	var name = mydigitalstructure._util.param.get(param, 'name').value;
	var id = mydigitalstructure._util.param.get(param, 'id').value;
	var returnValue = mydigitalstructure._util.param.get(param, 'valueDefault').value;
	
	if (context != undefined)
	{
		if (id == undefined && controller != undefined)
		{
			id = app._util.data.get(
			{
				controller: controller,
				context: context
			});
		}
		
		var data = app._util.data.get(
		{
			controller: dataController,
			context: dataContext
		});
		
		if (data != undefined)
		{
			var _id = id;
				
			if (!_.isArray(_id))
			{	
				_id = _.split(id, ',');
			}
			
			if (_.size(_id) == 1)
			{
				var value = _.find(data, function (d) {return d.id == _id[0]})

				if (name != undefined && value != undefined)
				{
					returnValue = value[name]
				}
			}
			else
			{
				var _values = [];
				var _value;
				
				_.each(_id, function (id)
				{
					_value = _.find(data, function (d) {return d.id == id})

					if (name != undefined && _value != undefined)
					{
						_values.push(_value[name]);
					}
				})
				
				returnValue = _.join(_values, ', ');
			}
		}
	}
	
	return returnValue;
}

mydigitalstructure._util.view.set = function (param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var scope = mydigitalstructure._util.param.get(param, 'scope').value; 
	var context = mydigitalstructure._util.param.get(param, 'context').value;
	var value = mydigitalstructure._util.param.get(param, 'value').value;
	var id = mydigitalstructure._util.param.get(param, 'id').value;
	var contexts = mydigitalstructure._util.param.get(param, 'contexts', {"default": []}).value;

	if (controller == undefined) {controller = scope}

	if (_.isEmpty(contexts))
	{
		contexts.push(
		{
			name: context,
			value: value
		});
	}

	_.each(contexts, function (context)
	{
		var element = $('[data-controller="' + controller + '"][data-context="' + context.name + '"]');

		if (!_.isEmpty(element))
		{
			if (_.isUndefined(context.value)) {context.value = ''};
			context.value = he.decode(context.value);

			if (element.hasClass('myds-text') || element.hasClass('myds-select'))
			{
				element.val(context.value);
			}
			else if (element.hasClass('myds-text-select'))
			{
				element.val(context.value);
				element.attr('data-id', context.id);
			}
			else if (element.hasClass('myds-check'))
			{
				element.filter('[value="' + context.value + '"]').prop('checked', true);
			}
			else
			{
				element.val(context.value);
				element.html(context.value);
			}

			app._util.data.set(
			{
				controller: controller,
				context: context.name,
				value: (_.isUndefined(context.id)?context.value:context.id)
			});
		}
	});
}

mydigitalstructure._util.view.refresh = function (param)
{
	if (_.isArray(param))
	{
		_.each(param, function(_param)
		{
			mydigitalstructure._util.view._refresh(_param)
		})
	}
	else
	{
		mydigitalstructure._util.view._refresh(param)
	}
}

mydigitalstructure._util.view._refresh = function (param)
{
	var scope = mydigitalstructure._util.param.get(param, 'scope').value;
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var data = mydigitalstructure._util.param.get(param, 'data').value;
	var routeTo = mydigitalstructure._util.param.get(param, 'routeTo').value;
	var show = mydigitalstructure._util.param.get(param, 'show').value;
	var hide = mydigitalstructure._util.param.get(param, 'hide').value;
	var template = mydigitalstructure._util.param.get(param, 'template').value;
	var selector = mydigitalstructure._util.param.get(param, 'selector').value;
	var dataScope = mydigitalstructure._util.param.get(param, 'dataScope').value;
	var dataController = mydigitalstructure._util.param.get(param, 'dataController').value;
	var resetScope = mydigitalstructure._util.param.get(param, 'resetScope', {default: false}).value;
	var resetScopeNew = mydigitalstructure._util.param.get(param, 'resetScopeNew', {default: true}).value;
	var validate = mydigitalstructure._util.param.get(param, 'validate', {default: true}).value;
	var hidePopover = mydigitalstructure._util.param.get(param, 'hidePopover', {default: true}).value;

	var includeDates = mydigitalstructure._util.param.get(param, 'includeDates', {default: true}).value;

	if (_.isUndefined(template) && !_.isUndefined(selector)) {template = true}

	if (_.isUndefined(scope)) {scope = controller}
	if (_.isUndefined(controller))
	{
		mydigitalstructure._util.param.set(param, 'controller', scope)
	}

	if (!_.isUndefined(data) && !_.isUndefined(scope))
	{
		_.each(data, function (value, key)
		{
			$('[data-scope="' + scope + '"][data-context="' + key + '"]').html(value);
		});

		if (_.has(data, 'id'))
		{			
			var elementIDs = $('[data-scope="' + scope + '-' + '"][data-id]');
			var elementID;

			_.each(elementIDs, function (element)
			{
				elementID = $(element).attr('id');
				$(element).attr('data-id', data.id);
				$(element).attr('id', elementID + data.id)
				$(element).attr('data-scope', scope + '-' + data.id)
			});

			elementIDs = $('input[data-scope="' + scope + '-' + data.id + '"][data-value]');
			var elementContext;

			_.each(elementIDs, function (element)
			{
				elementContext = $(element).attr('data-context');
				$(element).attr('data-value', data[elementContext]);
			});
		}
	}

	if (!_.isUndefined(dataScope) && !_.isUndefined(data))
	{
		var dataScopeAll = mydigitalstructure._util.data.get(
		{
			scope: dataScope,
			context: 'all',
			valueDefault: []
		});

		var dataInScopeAll = _.find(dataScopeAll, function (d) {return d.id == data.id});

		if (_.isUndefined(dataInScopeAll))
		{
			if (!_.isUndefined(dataController))
			{
				mydigitalstructure._util.controller.invoke(dataController, data)
			}

			dataScopeAll.push(data);
		}
		else
		{
			dataInScopeAll = _.assign(dataInScopeAll, data);

			if (!_.isUndefined(dataController))
			{
				mydigitalstructure._util.controller.invoke(dataController, dataInScopeAll)
			}
		}
	}

	if (resetScope && scope != undefined)
	{
		mydigitalstructure._util.data.reset({scope: scope})
	}

	if (resetScopeNew && scope != undefined)
	{
		mydigitalstructure._util.data.reset({scope: scope + '-'})
	}

	if (template)
	{
		app._util.view.queue.templateRender(param);

		var context;
		var value;

		_.each($(selector + ' input.myds-check[data-context][data-id]'),
			function (element)
		{
			var context = $(element).data('context');
			var value = data[context];

			if (value != undefined)
			{
				$(selector + ' input.myds-check[data-context="' + context + '"][data-id="' + value + '"]').attr('checked', 'checked')
			}
		});

		//_.each(data, function (value, key)
		//{
		//	$(selector + ' input.myds-check[data-context="' + key + '"][data-id="' + value + '"]').attr('checked', 'checked')
		//});
	}

	if (!_.isUndefined(show))
	{
		$(show).removeClass('hidden d-none');
	}
	
	if (!_.isUndefined(hide))
	{
		$(hide).addClass('hidden d-none');
	}

	if (includeDates)
	{
		mydigitalstructure._util.view.datepicker({selector: '.myds-date', format: 'D MMM YYYY'})
		mydigitalstructure._util.view.datepicker({selector: '.myds-date-time', format: 'D MMM YYYY LT'})
	}

	if (validate)
	{
		mydigitalstructure._util.validate.check({scope: scope})
	}

	if (hidePopover)
	{
		$('.popover:visible').popover("hide")
	}

	if (!_.isUndefined(routeTo))
	{
		window.location.hash = '#' + routeTo
	}
}	

mydigitalstructure._util.view.datepicker = function (param)
{
	var selector = mydigitalstructure._util.param.get(param, 'selector').value;
	var format = mydigitalstructure._util.param.get(param, 'format', {"default": 'D MMM YYYY'}).value;
	var pickerOptions = mydigitalstructure._util.param.get(param, 'pickerOptions', {"default": {}}).value; 

	var datepicker = $(selector).data("DateTimePicker");

	if (_.isObject(datepicker))
	{
		datepicker.destroy();
	}

	var icons =
	{
		previous: 'icon icon-chevron-left fa fa-chevron-left',
		next: 'icon icon-chevron-right fa fa-chevron-right',
		time: "fa fa-clock-o",
		date: "fa fa-calendar",
		up: "fa fa-arrow-up",
		down: "fa fa-arrow-down"
	} 

	if (_.has(mydigitalstructure, '_scope.app.options.styles.datePicker.icons'))
	{
		icons = mydigitalstructure._scope.app.options.styles.datePicker.icons
	}

	var options = _.assign({format: format, icons: icons}, pickerOptions);

	if (_.has(mydigitalstructure, '_scope.app.options.styles.datePicker.options'))
	{
		options = _.assign(options, mydigitalstructure._scope.app.options.styles.datePicker.options);
	}

	$(selector).datetimepicker(options);
}

//CHECK
if (mydigitalstructure._util.data == undefined)
{
	mydigitalstructure._util.data = {}
}

mydigitalstructure._util.data.param = 
{
	set: function (controller, param)
	{
		if (controller != undefined && param != undefined)
		{
			app._util.data.set(
			{
				controller: controller,
				context: '_param',
				value: param
			});
		}

		return param;
	},

	get: function (controller, param)
	{
		if (controller != undefined)
		{
			var _param = app._util.data.get(
			{
				controller: controller,
				context: '_param'
			});

			if (_param != undefined) {param = _param}
		}

		return param;
	}
}

mydigitalstructure._util.whoami = function (param)
{
	var whoamiData =
	{
		myFunctionality:
		{
			controllers: mydigitalstructure._util.controller.data.whoami,
			count: mydigitalstructure._util.controller.data.whoami.length
		},
		buildingMe: 
		{
			journal: mydigitalstructure._util.controller.data.build,
			about: mydigitalstructure._scope.app.build
		},
		myForm: {}
	}

	var form = [];
	var elements = $('.myds-view');

	_.each(elements, function (element)
	{
		form.push(
		{
			id: $(element).attr('id'),
			structure: $(element).html()
		})
	});

	whoamiData.myForm.views = form;

	elements = $('.myds-view-template');
	form = [];

	_.each(elements, function (element)
	{
		form.push(
		{
			id: $(element).attr('id'),
			structure: $(element).html()
		})
	});

	whoamiData.myForm.templates = form;

	whoamiData.buildingMe.todo = {};

	_.each(mydigitalstructure._util.controller.data.build, function(buildData, controllerName)
	{
		var todos = _.filter(buildData, function (data)
		{
			return data.todo != undefined
		})

		if (todos.length !=0 )
		{
			
			whoamiData.buildingMe.todo[controllerName] = _.map(todos, function (data) {return data.todo})
		}

	});

	whoamiData.thisInstanceOfMe =
	{
		functionality: {},
		storage: 
		{
			cloud: 
			{
				objects: mydigitalstructure._cloud.object,
				objectsUsed: _.keys(mydigitalstructure._cloud.object).length,
				journal: mydigitalstructure._cloud.log
			}
		}
	}

	if (app != undefined)
	{
		whoamiData.thisInstanceOfMe.storage.local = 
		{
			scopes: _.keys(app.data),
			count: _.keys(app.data).length,
			_storage: app.data
		}
	}

	whoamiData.thisInstanceOfMe.functionality.mostUsed = 
		_.reverse(_.sortBy(_.filter(mydigitalstructure._util.controller.data.whoami, function (whoami)
		{
			return (whoami.invoked != 0)
		}), function (whoamiSort)
		{
			return whoamiSort.invoked
		}));

	whoamiData.thisInstanceOfMe.storage.cloud.mostUsed = 
		_.reverse(_.sortBy(_.filter(mydigitalstructure._cloud.object, function (object)
		{
			return (object.count != 0)
		}), function (objectSort)
		{
			return objectSort.count
		}));

	return whoamiData
}

mydigitalstructure._util.controller = 
{
	data:
	{
		whoami: [],
		unknown: [],
		note: {},
		build: {},
		last: undefined
	},

	invoke: function (param, controllerParam, controllerData)
	{
		var namespace;
		var name;
		var returnData;

		if (_.isObject(param))
		{
			name = mydigitalstructure._util.param.get(param, 'name').value;
			namespace = mydigitalstructure._util.param.get(param, 'namespace').value;
		}
		else
		{
			name = param;
		}
		
		if (namespace == undefined) {namespace = window[mydigitalstructure._scope.app.options.namespace]};
		if (namespace == undefined) {namespace = window.app}

		if (name != undefined)
		{
			var whoami = _.find(mydigitalstructure._util.controller.data.whoami, function (whoami) {return whoami.name == name});

			if (whoami != undefined)
			{
				whoami['invoked'] = 
					numeral(whoami['invoked']).value() + 1
			}
			else
			{
				mydigitalstructure._util.controller.data.unknown.push(
				{
					name: name,
					param: param,
					data: controllerData
				});
			}

			mydigitalstructure._util.data.set(
			{
				controller: name,
				context: '_param',
				value: controllerParam
			});

			if (_.isFunction(namespace.controller[name]))
			{
				mydigitalstructure._util.controller.data.last = name;
				returnData = namespace.controller[name](controllerParam, controllerData);
			}
			else
			{
				returnData = 'No controller named ' + name;

				mydigitalstructure._util.log.add(
				{
					message: 'There is no controller named: ' + name
				})
				
				if (!_.isUndefined(controllerParam))
				{
					mydigitalstructure._util.log.add(
					{
						message: controllerParam
					});
				}

				if (!_.isUndefined(controllerData))
				{
					mydigitalstructure._util.log.add(
					{
						message: controllerData
					});
				}
			}
		}

		return returnData
	},

	add: function(param)
	{
		if (app.controller == undefined) {app.controller = {}}

		if (_.isArray(param))
		{
			var namespace;

			_.each(param, function(controller)
			{
				if (controller.name != undefined)
				{
					mydigitalstructure._util.controller.data.whoami.push( 
					{
						name: controller.name,
						invoked: 0,
						note: (controller.note==undefined?'':controller.note),
						build: (controller.build==undefined?[]:controller.build)
					});

					if (controller.note != undefined)
					{
						mydigitalstructure._util.controller.data.note[controller.name] = controller.note;
					}

					if (controller.build != undefined)
					{
						mydigitalstructure._util.controller.data.build[controller.name] = controller.build;
					}

					namespace = controller.namespace;
					if (namespace == undefined) {namespace = mydigitalstructure._scope.app.options.namespace};
					if (namespace == undefined) {namespace = window.app}

					if (namespace.controller[controller.name] != undefined)
					{
						mydigitalstructure._util.log.add({message: 'Existing controller [' + controller.name + '] was just replaced.'})
					}

					namespace.controller[controller.name] = controller.code;

					if (controller.alias != undefined)
					{
						if (namespace[controller.alias] == undefined)
						{
							namespace[controller.alias] = function(controllerParam, controllerData)
							{
								mydigitalstructure._util.controller.invoke(controller.name, controllerParam, controllerData)
							}
						}
					}
				}
			});
		}
		else
		{
			var name = mydigitalstructure._util.param.get(param, 'name').value;
			var code = mydigitalstructure._util.param.get(param, 'code').value;
			var note = mydigitalstructure._util.param.get(param, 'note').value;
			var alias = mydigitalstructure._util.param.get(param, 'alias').value;
			var build = mydigitalstructure._util.param.get(param, 'build').value;

			var namespace = mydigitalstructure._util.param.get(param, 'namespace').value;
			if (namespace == undefined) {namespace = mydigitalstructure._scope.app.options.namespace};
			if (namespace == undefined) {namespace = window.app}

			if (name != undefined)
			{
				mydigitalstructure._util.controller.data.whoami.push( 
				{
					name: name,
					invoked: 0,
					note: (note==undefined?'':note),
					build: (build==undefined?[]:build)
				});

				if (note != undefined)
				{
					mydigitalstructure._util.controller.data.note[name] = note;
				}

				if (build != undefined)
				{
					mydigitalstructure._util.controller.data.build[name] = build;
				}

				if (name != undefined)
				{
					namespace.controller[name] = code;
				}
			}

			if (alias != undefined)
			{
				if (namespace[alias] == undefined)
				{
					namespace[alias] = function(param, controllerParam, controllerData)
					{
						mydigitalstructure._util.controller.invoke(param, controllerParam, controllerData)
					}
				}
			}
		}
	}
}

mydigitalstructure._util.healthCheck =
{
	data: {},
	
	run: function (param)
	{
		var scope = mydigitalstructure._util.param.get(param, 'scope', {default: 'views'}).value;
		var strategy = mydigitalstructure._util.param.get(param, 'strategy', {default: 'analyse'}).value; //
		var mode = mydigitalstructure._util.param.get(param, 'mode', {default: 'automated'}).value;
		var selector = mydigitalstructure._util.param.get(param, 'selector').value;
		var onlyIfEmpty = mydigitalstructure._util.param.get(param, 'onlyIfEmpty', {default: false}).value;
		var elements;
		var runData = {input: param}
		var elementData;
		var checkParent = mydigitalstructure._util.param.get(param, 'checkParent', {default: false}).value;

		if (selector == undefined)
		{
			selector = '.myds-view'
			if (scope == 'view-templates') {selector = '.myds-view-template'}
		}
	
		if (checkParent)
		{
			elements = $(selector).parent();
		}
		else
		{
			elements = $(selector);
		}

		if (strategy == 'eleminination')
		{
			if (mode == 'automated')
			{
				if (onlyIfEmpty)
				{
					_.each(elements, function (element)
					{
						if ($(element).children().length == 0)
						{
							$(element).remove()
						}
					});
				}
				else
				{
					elements.remove();
				}
			}
			else
			{
				var _continue = true;

				_.each(elements, function (element)
				{
					if (_continue)
					{
						$(element).remove()
						_continue = confirm('Just elemininated ' + element.id + ', continue?');
					}
				});
			}
		}
		else
		{
			var elementDataLog = {};
			var elementData = {};
			var elementIssues = {};
			var elementID;
			var currentParent;

			_.each(['div', 'ul', 'li', 'form', 'textarea'], function (type)
			{
				elementData[type] = {};
				elementIssues[type] = {};
				elementDataLog[type] = [];

				_.each(elements, function (element, e)
				{
					elementID = element.id;
					if (_.isEmpty(elementID))
					{
						elementID = '_' + e 
					}

					elementData[type][elementID] =
					{
						_open: _.split($(element).html(), '<' + type),
						open: _.split($(element).html(), '<' + type).length - 1,
						_close: _.split($(element).html(), '</' + type),
						close: _.split($(element).html(), '</' + type).length - 1,
						parent: $(element).parent().attr('id'),
						_parent: $(element).parent()
					}

					elementData[type][elementID]['difference'] = (
						elementData[type][elementID]['open'] - 
						elementData[type][elementID]['close']);

					elementData[type][elementID]['source'] = $(element).html();

					_.each(elementData[type][elementID]._open, function (openElement)
					{
						if (scope == 'views')
						{
							if (_.includes(openElement, 'myds-view'))
							{
								elementData[type][elementID].missingClose = true;
							}
						}

						if (scope == 'view-templates')
						{
							if (_.includes(openElement, 'myds-view-template'))
							{
								elementData[type][elementID].missingClose = true;
							}
						}
					});

					if (currentParent != $(element).parent().attr('id') && currentParent != undefined)
					{
						elementData[type][elementID]['parentChanged'] = true;
						elementData[type][elementID]['_parentChanged'] =
						{
							from: currentParent,
							to: $(element).parent().attr('id'),
							suspect: _.last(elementDataLog[type])
						}
					}

					currentParent = $(element).parent().attr('id')

					elementData[type][elementID]['issue'] =
					(
						elementData[type][elementID]['difference'] != 0
						|| elementData[type][elementID]['missingClose']
						|| elementData[type][elementID]['parentChanged']
					);

					elementDataLog[type].push(_.assign(
					{
						id: elementID,
						missingClose: elementData[type][elementID]['missingClose'],
						parentChanged: elementData[type][elementID]['parentChanged']
					},
					elementData[type][elementID]));

				});

				elementIssues[type] = _.filter(elementDataLog[type], function (data)
				{
					return data['issue']
				});
			});
		}

		//ANALYSIS
		var resultNotes = [];
		var resultData = []

		_.each(['div'], function (type)
		{
			_.each(elementIssues['div'], function (issue)
			{
				if (issue.parentChanged)
				{
					resultNotes.push(issue.id + ' parent is not as expected; suspect there is an issue with ' + type + ' elements in ' + issue._parentChanged.suspect.id);
					resultData.push($('#' + issue._parentChanged.suspect.id));
				}

				if (issue.missingClose)
				{
					resultNotes.push(issue.id + ' is missing closing ' + type + ' tag.');
					resultData.push($('#' + issue.id))
				}
			});
		});

		runData.data =
		{
			elements: elements,
			data: elementData,
			log: elementDataLog,
			issues: elementIssues
		}

		runData.result = 
		{
			notes: resultNotes,
			data: resultData
		}

		mydigitalstructure._util.healthCheck.data.run = runData;

		return runData;
	}
}

mydigitalstructure._util.access =
{
	has: function (param)
	{
		var roles = mydigitalstructure._util.param.get(param, 'roles').value;
		var access = mydigitalstructure._util.param.get(param, 'access', {"default": false}).value;

		if (roles != undefined)
		{	
			access = false;

			$.each(roles, function (r, role)
			{
				if (!access)
				{	
					if (role.title != undefined)
					{
						access = mydigitalstructure._util.user.roles.has({roleTitle: role.title, exact: false})
					}
					else
					{
						access = mydigitalstructure._util.user.roles.has({role: role.id})
					}
				}	
			});
		}
		
		return access;	
	},

	show: function (param)
	{
		var roles = mydigitalstructure._util.param.get(param, 'roles').value;
		var access = mydigitalstructure._util.param.get(param, 'access', {"default": false}).value;
		var selector = mydigitalstructure._util.param.get(param, 'selector', {"default": false}).value;

		if (roles != undefined)
		{	
			access = false;

			$.each(roles, function (r, role)
			{
				if (!access)
				{	
					if (role.title != undefined)
					{
						access = mydigitalstructure._util.user.roles.has({roleTitle: role.title, exact: false})
					}
					else
					{
						access = mydigitalstructure._util.user.roles.has({role: role.id})
					}
				}	
			});

			$(selector)[(access?'remove':'add') + 'Class']('hidden d-none');
		}
		
		return access;	
	},

	hide: function (param)
	{
		var roles = mydigitalstructure._util.param.get(param, 'roles').value;
		var access = mydigitalstructure._util.param.get(param, 'access', {"default": false}).value;
		var selector = mydigitalstructure._util.param.get(param, 'selector', {"default": false}).value;

		if (roles != undefined)
		{	
			access = true;

			$.each(roles, function (r, role)
			{
				if (access)
				{	
					if (role.title != undefined)
					{
						access = !mydigitalstructure._util.user.roles.has({roleTitle: role.title, exact: false})
					}
					else
					{
						access = !mydigitalstructure._util.user.roles.has({role: role.id})
					}
				}	
			});

			$(selector)[(access?'remove':'add') + 'Class']('hidden d-none');
		}
		
		return access;	
	}
}

mydigitalstructure._util.data = 
{
	reset: function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var scope = mydigitalstructure._util.param.get(param, 'scope').value;
				
				if (controller != undefined)
				{
					app.data[controller] = {}
				}
				
				if (scope != undefined)
				{
					app.data[scope] = {}
				}
			},
	
	clear: 	function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var scope = mydigitalstructure._util.param.get(param, 'scope').value;
				var context = mydigitalstructure._util.param.get(param, 'context').value;
				var name = mydigitalstructure._util.param.get(param, 'name').value;
				var value = mydigitalstructure._util.param.get(param, 'value').value;

				if (controller == undefined)
				{
					controller = scope;
				}

				if (controller != undefined)
				{
					if (context != undefined)
					{
						if (name != undefined)
						{
							if (app.data[controller] != undefined)
							{
								if (app.data[controller][context] != undefined)
								{
									delete app.data[controller][context][name];
								}
							}
						}
						else 
						{
							if (app.data[controller] != undefined)
							{
								delete app.data[controller][context];
							}
						}	
					}
					else
					{
						if (name != undefined)
						{
							if (app.data[controller] != undefined)
							{
								delete app.data[controller][name];
							}
						}
						else
						{
							delete app.data[controller];
						}
					}	
				}
			},

	set: 	function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var scope = mydigitalstructure._util.param.get(param, 'scope').value;
				var context = mydigitalstructure._util.param.get(param, 'context').value;
				var name = mydigitalstructure._util.param.get(param, 'name').value;
				var value = mydigitalstructure._util.param.get(param, 'value').value;
				var merge = mydigitalstructure._util.param.get(param, 'merge', {default: false}).value;
				var data;

				if (controller == undefined)
				{
					controller = scope;
				}
				
				if (controller != undefined)
				{
					if (_.isUndefined(app.data)) {app.data = {}}
						
					if (app.data[controller] == undefined) {app.data[controller] = {}}

					if (context != undefined)
					{
						if (app.data[controller][context] == undefined) {app.data[controller][context] = {}}
					}

					if (context != undefined)
					{
						if (name != undefined)
						{
							if (merge && _.isObject(value) && _.isObject(app.data[controller][context][name]))
							{
								app.data[controller][context][name] = _.assign(app.data[controller][context][name], value);
							}
							else
							{
								app.data[controller][context][name] = value;
							}

							data = app.data[controller][context][name];
						}
						else 
						{
							if (merge && _.isObject(value) && _.isObject(app.data[controller][context]))
							{
								app.data[controller][context] = _.assign(app.data[controller][context], value);
							}
							else
							{
								app.data[controller][context] = value;
							}

							data = app.data[controller][context];
						}	
					}
					else
					{
						if (name != undefined)
						{
							if (merge && _.isObject(value) && _.isObject(app.data[controller][name]))
							{
								app.data[controller][name] = _.assign(app.data[controller][name], value);
							}
							else
							{
								app.data[controller][name] = value;
							}

							data = app.data[controller][name]
						}
						else
						{
							if (merge && _.isObject(value) && _.isObject(app.data[controller]))
							{
								app.data[controller] = _.assign(app.data[controller], value);
							}
							else
							{
								app.data[controller] = value;
							}

							data = app.data[controller];
						}	
					}
				}
				
				return data
			},

	get: 	function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var scope = mydigitalstructure._util.param.get(param, 'scope').value;
				var context = mydigitalstructure._util.param.get(param, 'context').value;
				var name = mydigitalstructure._util.param.get(param, 'name').value;
				var id = mydigitalstructure._util.param.get(param, 'id').value;
				var valueDefault = mydigitalstructure._util.param.get(param, 'valueDefault').value;
				var value;
				var clean = mydigitalstructure._util.param.get(param, 'clean', {"default": false}).value;
				var clone = mydigitalstructure._util.param.get(param, 'clone', {"default": false}).value;

				if (controller == undefined)
				{
					controller = scope;
				}

				if (controller != undefined)
				{
					if (app.data[controller] != undefined)
					{
						if (context != undefined)
						{
							if (app.data[controller][context] != undefined)
							{	
								if (name != undefined)
								{
									value = app.data[controller][context][name];
								}
								else 
								{
									value = app.data[controller][context];
								}
							}
						}
						else
						{
							if (name != undefined)
							{
								value = app.data[controller][name];
							}
							else
							{
								value = app.data[controller];
							}
						}
					}	
				}

				if (value != undefined && id != undefined)
				{
					value = $.grep(value, function (v) {return v.id == id})[0];
				}
				
				if (value == undefined && valueDefault != undefined)
				{
					value = valueDefault;
					param.value = value;
					app._util.data.set(param);
				}

				if (_.isObject(value) && clean)
				{
					value = _.pickBy(value, function (valueValue, key)
								{
									var include = true;

									if (_.startsWith(key, '_'))
									{
										if (value[key.substr(1)] != undefined)
										{
											include = false;
										}
									}

									return include
								})
				}

				var valueReturn = (clone?_.clone(value):value);

				return valueReturn
			},

	find: function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var scope = mydigitalstructure._util.param.get(param, 'scope').value;
				var context = mydigitalstructure._util.param.get(param, 'context', {'default': 'id'}).value;
				var setContext = mydigitalstructure._util.param.get(param, 'setContext', {'default': 'dataContext'}).value;  
				
				var dataController = mydigitalstructure._util.param.get(param, 'dataController', {'default': 'setup'}).value;
				var dataScope = mydigitalstructure._util.param.get(param, 'dataScope', {'default': 'setup'}).value;
				var dataContext = mydigitalstructure._util.param.get(param, 'dataContext', {'default': 'all'}).value;

				if (dataController == undefined) {dataController = dataScope}

				if (controller == undefined) {controller = scope}

				if (dataContext == undefined && dataController == 'setup')
				{
					dataContext = context;
				}
					
				var name = mydigitalstructure._util.param.get(param, 'name').value;
				var id = mydigitalstructure._util.param.get(param, 'id').value;
				var returnValue = mydigitalstructure._util.param.get(param, 'valueDefault').value;
				
				if (context != undefined)
				{
					if (id == undefined && controller != undefined)
					{
						id = app._util.data.get(
						{
							controller: controller,
							context: context
						});
					}
					
					var data = app._util.data.get(
					{
						controller: dataController,
						context: dataContext
					});
					
					if (data != undefined && id != undefined)
					{
						var _id = id;
							
						if (!_.isArray(_id))
						{	
							_id = _.split(id, ',');
						}
						
						if  (_.size(_id) == 1)
						{
							var value = _.find(data, function (d) {return d.id == _id[0]})

							if (name != undefined && value != undefined)
							{
								returnValue = value[name];
							}
							else
							{
								returnValue = value;
							}
						}
						else
						{
							var _values = [];
							var _value;
							
							_.each(_id, function (id)
							{
								_value = _.find(data, function (d) {return d.id == id})

								if (name != undefined && _value != undefined)
								{
									_values.push(_value[name]);
								}
							})
							
							returnValue = _.join(_values, ', ');
						}

						if (!_.isEmpty(setContext))
						{
							mydigitalstructure._util.data.set(
							{
								controller: controller,
								context: setContext,
								value: returnValue
							})
						}
					}
				}
				
				return returnValue;
			}		
}

mydigitalstructure._util.reset = function (param)
{
	var controller = mydigitalstructure._util.param.get(param, 'controller').value;
	var scope = mydigitalstructure._util.param.get(param, 'scope').value;
	if (controller == undefined) {controller = scope}

	var data = mydigitalstructure._util.param.get(param, 'data').value;
	var includeNew = mydigitalstructure._util.param.get(param, 'includeNew', {default: true}).value;
	
	if (data)
	{
		app._util.data.reset(param);

		if (includeNew)
		{
			app._util.data.reset({scope: scope + '-'});
		}
	}

	if (controller != '' && controller != undefined)
	{
		$('#' + controller + ' .myds-text').val('');
		$('#' + controller + ' .myds-check').attr('checked', false);
		$('#' + controller + ' .myds-data').html('...');
		$('#' + controller + ' .myds-data-view').html(mydigitalstructure._scope.app.options.working);
		$('#' + controller + ' .myds-text-select').val('');
		$('#' + controller + ' .myds-text-select').removeAttr('data-id');
		$('#' + controller).removeClass('myds-validate-error');
	}	
}

mydigitalstructure._util.data.clean = function (data)
{
	var dataReturn = {}

	if (_.isObject(data))
	{
		_.each(data, function (value, key)
		{
			dataReturn[key] = mydigitalstructure._util.data._clean(value)
		});
	}
	else
	{
		dataReturn = mydigitalstructure._util.data._clean(data)
	}

	return dataReturn;
};

mydigitalstructure._util.data._clean = function (jsonString)
{
	try
	{
		if (_.includes(jsonString, 'base64:'))
		{
			jsonString = atob(jsonString.replace('base64:', ''))
		}

		var o = JSON.parse(jsonString);

		if (o && typeof o === "object")
		{
			return o;
		}
	}
	catch (e)
	{}

	return jsonString;
}

mydigitalstructure._util.clean = function (data)
{
	var dataReturn = {}

	if (_.isObject(data))
	{
		_.each(data, function (value, key)
		{
			dataReturn[key] = mydigitalstructure._util._clean(value)
		});
	}
	else
	{
		dataReturn = mydigitalstructure._util._clean(data)
	}

	return dataReturn;
};

mydigitalstructure._util._clean = function(param)
{
	var val;
	var returnVal;
	var strip = mydigitalstructure._scope.app.options.xssStrip;
	var encode = mydigitalstructure._scope.app.options.xssEncode;

	if (typeof param == 'object')
	{
		val = param.val;
	}
	else
	{
		val = param;
	}

	if (val != undefined)
	{
		if (typeof filterXSS == 'function')
		{
			returnVal = filterXSS(val, {stripIgnoreTag: mydigitalstructure._scope.app.options.xssStrip})
		}
		else if (he != undefined)
		{
			if (encode)
			{
				returnVal = he.encode(val);
			}
			else
			{
				returnVal = he.escape(val);
			}
		}
		else
		{
			returnVal = he.encodeURIComponent(val);
		}
	}

	return returnVal;
}

mydigitalstructure._util.menu =
{
	set: function (param)
	{
		var element = mydigitalstructure._util.param.get(param, 'element').value;
		var selector = mydigitalstructure._util.param.get(param, 'selector').value;
		var href = mydigitalstructure._util.param.get(param, 'href').value;
		var scope = mydigitalstructure._util.param.get(param, 'scope').value;
		var uriContext = mydigitalstructure._util.param.get(param, 'uriContext').value;
		var active = mydigitalstructure._util.param.get(param, 'active', {default: true}).value;

		if (element == undefined)
		{
			if (selector == undefined)
			{
				if (href != undefined)
				{
					selector = '.myds-menu [href="' + href + '"]' 
				}
				else if (scope != undefined)
				{
					selector = '.myds-menu [href="' + mydigitalstructure._scope.app.options.startURI + 
													'/#' + scope + '"]' 
				}
				else if (uriContext != undefined)
				{
					selector = '.myds-menu [href="' + mydigitalstructure._scope.app.options.startURI + 
													'/' + uriContext + '"]' 
				}
			}

			if (selector != undefined)
			{
				element = $(selector);
			}
		}

		if ($('.metismenu').length != 0 && element.length != 0 )
		{
			$('.metismenu').find('li').not(element.parents('li')).removeClass('active');

			if (element.attr('href') != '#')
			{
				if ($(element).parents('ul.nav-second-level').length == 0)
				{
					element.parent().addClass('active');
					element.parent().siblings().find('ul').removeClass('in');
				}
				else
				{
					var parentElement = $(element).parents('ul.nav-second-level');
					if (!parentElement.parent().hasClass('active'))
					{
						parentElement.parent().addClass('active');
					}

					if (!parentElement.hasClass('in'))
					{
						parentElement.addClass('in');
					}
					
					element.parent().addClass('active');
					parentElement.parent().siblings().find('ul').removeClass('in');
				}
			}
		}
	}
}

mydigitalstructure._util.uuid = function (param)
{
	var pattern = mydigitalstructure._util.param.get(param, 'pattern', {"default": 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'}).value;
	var d = new Date().getTime();
	var uuid = pattern.replace(/[xy]/g, function(c)
	{
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});

	return uuid;
}

mydigitalstructure._util.validate =
{
	isEmail: function (emailAddress)
	{
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)
	},

	isDate: function (date)
	{
		var formats = mydigitalstructure._scope.app.options.dateFormats;
		if (formats == undefined) {formats = ['DD MMM YYYY', 'D MMM YYYY', 'D/MM/YYYY', 'DD/MM/YYYY', 'DD MMM YYYY HH:mm:ss']}
		return moment(date, formats).isValid()
	},

	check: function (param)
	{
		var element = mydigitalstructure._util.param.get(param, 'element').value;
		var selector = mydigitalstructure._util.param.get(param, 'selector').value;
		var scope = mydigitalstructure._util.param.get(param, 'scope').value;
		var context = mydigitalstructure._util.param.get(param, 'context').value;

		if (element != undefined)
		{
			mydigitalstructure._util.validate._check(element);
		}
		else
		{
			if (selector == undefined)
			{
				var _selector = [];

				if (scope != undefined)
				{
					_selector.push('[data-scope="' + scope + '"]')
				}

				if (context != undefined)
				{
					_selector.push('[data-context="' + context + '"]')
				}

				if (_selector.length != 0)
				{
					selector = '.myds-validate' + _.join(_selector, '');
				}
			}

			if (selector == undefined)
			{
				selector = '.myds-validate:visible';
			}

			if (selector != undefined)
			{
				var elements = $(selector);

				_.each(elements, function(element)
				{
					mydigitalstructure._util.validate._check($(element));
				});
			}
		}
	},

	_check: function (element)
	{
		var errors = [];
		//var element = $(this);
		var elementValue = element.val();
		var controller = element.data('validate-controller');
		var controllerParam = {};

		var scope = element.data('scope');
		if (_.isUndefined(scope)) {scope = controller}
		var context = element.data('context');
		
		if (scope != undefined && context != undefined)
		{
			if (_.isUndefined(app.data[scope]))
			{
				app.data[scope] = {}
			}

			if (_.isUndefined(app.data[scope]['validate']))
			{
				app.data[scope]['validate'] = {}
			}

			app.data[scope]['validate'][context] = {_id: element.attr('id')}
			app.data[scope]['validate'][context]['errors'] = {}

			if (element.attr('data-validate-mandatory') != undefined)
			{
				if (elementValue == '')
				{
					errors.push('mandatory')
					app.data[scope]['validate'][context]['errors']['mandatory'] = true
				}
			}

			if (element.attr('data-validate-numeral') != undefined)
			{
				if (_.isNull(numeral(elementValue).value()))
				{
					errors.push('numeral')
					app.data[scope]['validate'][context]['errors']['numeral'] = true
				}
			}

			var maximum = element.attr('data-validate-numeral-maximum');

			if (maximum != undefined && !_.isNull(numeral(maximum).value()))
			{
				if (!_.isNull(numeral(elementValue).value()))
				{
					if (numeral(elementValue).value() > numeral(maximum).value())
					{
						errors.push('numeral-maximum')
						app.data[scope]['validate'][context]['errors']['numeral-maximum'] = true;
					}
				}
			}

			var minimum = element.attr('data-validate-numeral-minimum');

			if (minimum != undefined && !_.isNull(numeral(minimum).value()))
			{
				if (!_.isNull(numeral(elementValue).value()))
				{
					if (numeral(elementValue).value() < numeral(minimum).value())
					{
						errors.push('numeral-minimum')
						app.data[scope]['validate'][context]['errors']['numeral-minimum'] = true;
					}
				}
			}

			var maximumLength = element.attr('data-validate-maximum-length');
			if (maximumLength != undefined)
			{
				if (numeral(elementValue.length).value() > numeral(maximumLength).value())
				{
					errors.push('maximum-length')
					app.data[scope]['validate'][context]['errors']['maximum-length'] = true
				}
			}

			var minimumLength = element.attr('data-validate-minimum-length');
			if (minimumLength != undefined)
			{
				if (numeral(elementValue.length).value() < numeral(minimumLength).value())
				{
					errors.push('minimum-length')
					app.data[scope]['validate'][context]['errors']['minimum-length'] = true
				}
			}

			if (element.attr('data-validate-email') != undefined)
			{
				if (!mydigitalstructure._util.validate.isEmail(elementValue))
				{
					errors.push('email')
					app.data[scope]['validate'][context]['errors']['email'] = true
				}
			}

			if (element.attr('data-validate-date') != undefined)
			{
				if (!mydigitalstructure._util.validate.isDate(elementValue))
				{
					errors.push('date')
					app.data[scope]['validate'][context]['errors']['date'] = true
				}
			}

			app.data[scope]['validate'][context]['_errors'] = errors;

			var scopeValidateErrors = false;

			_.each(app.data[scope]['validate'], function (value, key)
			{
				if (!scopeValidateErrors && key != 'errors')
				{
					scopeValidateErrors = (value._errors.length != 0);
				}
			});

			app.data[scope]['validate']['errors'] = scopeValidateErrors;

			app.invoke(controller,
			{
				_id: element.attr('id'),
				scope: scope,
				context: context,
				_errors: errors,
				errors: app.data[scope]['validate'][context]['errors'],
				scopeErrors: scopeValidateErrors
			});
		}

		var action = (errors.length==0?'remove':'add');

		if ($(element).hasClass('select2-hidden-accessible'))
		{
			element = $(element).siblings('.select2-container').find('.select2-selection').addClass('myds-validate-error')
		}

		$(element)[action + 'Class']('myds-validate-error');
	}
}

mydigitalstructure._util.factory = {};

mydigitalstructure._util.factory.core = function (param)
{
	var namespace = mydigitalstructure._scope.app.options.namespace;
	if (_.isUndefined(namespace)) {namespace = 'app'}
	var _namespace = window[namespace];

	if (mydigitalstructure._scope.app.options.controller == undefined)
	{
		mydigitalstructure._scope.app.options.controller = {keep: true}
	}
	else
	{
		if (mydigitalstructure._scope.app.options.controller.keep == undefined)
		{
			mydigitalstructure._scope.app.options.controller.keep = true;
		}
	}

	mydigitalstructure._util.controller.add(
	[
		{
			name: 'app-navigate-to',
			code: function (param)
			{
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var scope = mydigitalstructure._util.param.get(param, 'scope').value;
				var target = mydigitalstructure._util.param.get(param, 'target').value;
				var context = mydigitalstructure._util.param.get(param, 'context').value;

				if (controller == undefined)
				{
					controller = scope;
				}

				if (_.isUndefined(controller) && !_.isUndefined(target))
				{
					controller = target.replace('#', '')
				}

				if (!_.isUndefined(controller))
				{
					var routerElement = $('.myds-router');

					if (routerElement.length > 0)
					{
						var element = routerElement.children('.btn');
						if (element.length == 0)
						{
							element = routerElement.children('.dropdown-toggle');
						}

						if (element.length > 0)
						{
							var textElement = element.siblings().find('[data-context="' + controller + '"]')

							if (textElement.length > 0)
							{
								var text = textElement.html();

								var elementText = element.find('span.dropdown-text');

								if (elementText.length != 0)
								{
									elementText.html(text)
								}
								else
								{
									element.html(text + ' <span class="caret"></span>');
								}	
							}
						}
					}

					var param = {}

					if (mydigitalstructure._scope.app.uriContext != undefined)
					{ 
						param.context = (mydigitalstructure._scope.app.uriContext).replace('#', '')
					}

					param.dataContext = mydigitalstructure._util.data.clean($(this).data());
					app.data[controller] = mydigitalstructure._util.data.clean($(this).data());

					var locationHash = '#' + controller;

					if (context != undefined)
					{
						locationHash = locationHash + '/' + context
					}

					window.location.hash = locationHash;
				}	
			}
		},
		{
			name: 'app-router',
			code: function (data)
			{
				if (data)
				{
					var uri = data.uri;
					var uriContext = data.uriContext;

					var uriPath = window.location.pathname;
					var uriName = (uriPath).replace(/\//g,'');
					
					if (uri == undefined)
					{	
						uri = '';
					 	if (uriName !='') {uri = '/' + uriName};
					}
					
					if (uriContext == undefined)
					{	
					 	uriContext = window.location.hash;
					}

					if (!data.isLoggedOn && (app.options.authURIIsHome && uriPath == '/'))
					{
						if (mydigitalstructure._scope.app.view == undefined) {mydigitalstructure._scope.app.view = {}}
						if (uri != undefined) {mydigitalstructure._scope.app.view.uri = uri}
						if (uriContext != undefined) {mydigitalstructure._scope.app.view.uriContext = uriContext}

						var view = mydigitalstructure._util.view.get(uri);
						if (view != undefined)
						{	
							mydigitalstructure._scope.app.view.data = view;
						}			

						mydigitalstructure._scope.app.uri = uri;

						var _uriContext = _.first(_.split(uriContext, '|'));
						var _uriContexts = _uriContext.split('/');

						mydigitalstructure._scope.app.uriContext = _uriContexts[0];
					}
					else
					{
						if (mydigitalstructure._scope.route == undefined)
						{
							mydigitalstructure._scope.route = {}
						}
						
						if (!data.isLoggedOn)
						{
							if (_.includes(uriContext, '|'))
							{
								mydigitalstructure._scope.route.target =
									_.last(_.split(uriContext, '|'))
							}
							else
							{
								if (uri != app.options.authURI)
								{
									mydigitalstructure._scope.route.targetURI = uri;
									mydigitalstructure._scope.route.targetURIContext = uriContext;
									mydigitalstructure._scope.route.target = 
										mydigitalstructure._scope.route.targetURI

									if (mydigitalstructure._scope.route.targetURIContext != '')
									{ 
										mydigitalstructure._scope.route.target = mydigitalstructure._scope.route.target + 
											':' + mydigitalstructure._scope.route.targetURIContext;
									}
								}	
							}
							
							//add any context that the current URL has. ie mydigitalstructure._scope.app.dataContext
							uri = app.options.authURI;

							if (mydigitalstructure._scope.route.target != undefined)
							{
								uriContext = app.options.authURIContext + '|' + mydigitalstructure._scope.route.target;
							}
							else
							{
								uriContext = app.options.authURIContext;
							}
						}	
						else
						{
							if (_.isUndefined(mydigitalstructure._util.view.get(uri, uriContext)))
							{
								if (mydigitalstructure._scope.route.target != undefined)
								{
									var _target = _.split(mydigitalstructure._scope.route.target, ':');

									uri = _.first(_target);

									if (_.size(_target) > 1)
									{
										uriContext = _target[1]
									}
									else
									{
										uriContext = '';
									}
								}
								else
								{
									if (_.isEmpty(uri)) {uri = app.options.startURI;}
									if (_.isEmpty(uriContext)) {uriContext = app.options.startURIContext;}
								}	
							}
						}

						if (mydigitalstructure._scope.app.view == undefined) {mydigitalstructure._scope.app.view = {}}
						if (uri != undefined) {mydigitalstructure._scope.app.view.uri = uri}
						if (uriContext != undefined) {mydigitalstructure._scope.app.view.uriContext = uriContext}

						var view = mydigitalstructure._util.view.get(uri);
						if (view != undefined)
						{	
							mydigitalstructure._scope.app.view.data = view;
						}			

						mydigitalstructure._scope.app.uri = uri;

						var _uriContext = _.first(_.split(uriContext, '|'));
						var _uriContexts = _uriContext.split('/');

						mydigitalstructure._scope.app.uriContext = _uriContexts[0];

						if (window.location.pathname != uri && window.location.pathname != uri + '/')
						{
							window.location.href = uri + '/' + uriContext;
						}
						else
						{	
							if (uriContext != window.location.hash)
							{
								window.location.href = uri + '/' + uriContext;
							}
							else
							{
								if (_.isObject(mydigitalstructure._scope.user))
								{
									$('.myds-logon-first-name').html(mydigitalstructure._scope.user.firstname);
									$('.myds-logon-surname').html(mydigitalstructure._scope.user.surname)
									$('.myds-logon-name').html(mydigitalstructure._scope.user.userlogonname)
									$('.myds-logon-space').html(mydigitalstructure._scope.user.contactbusinesstext)
							
									mydigitalstructure._util.controller.invoke(
									{
										name: 'app-route-to'
									},
									{
										uri: uri,
										uriContext: uriContext,
										reload: true
									})
								}
							}	
						}	
					}	
				}
			}
		},
		{
			name: 'app-route-to',
			code: function (data)
			{
				var uri = data.uri;
				var uriContext = data.uriContext;
				var isReload = data.reload;

				mydigitalstructure._scope.app.uri = uri;

				var _uriContext = _.first(_.split(uriContext, '|'));
				var _uriContexts = _uriContext.split('/');

				mydigitalstructure._scope.app.uriContext = _uriContexts[0];
				mydigitalstructure._scope.app.dataContext = undefined;

				if (_uriContexts.length > 1)
				{
					mydigitalstructure._scope.app.dataContext = _uriContexts[1];
				}
					
				var controller = mydigitalstructure._scope.app.uriContext.replace('#', '');

				if (app.data[controller] == undefined) {app.data[controller] = {}}
				app.data[controller].uriContext = undefined

				if (mydigitalstructure._scope.app.dataContext != undefined)
				{
					app.data[controller].uriContext = 
						decodeURI(mydigitalstructure._scope.app.dataContext);

					app.data[controller].uriDataContext = 
						decodeURI(mydigitalstructure._scope.app.dataContext);

					if (_.startsWith(app.data[controller].uriContext, '{') ||
							_.startsWith(app.data[controller].uriContext, '['))
					{
						if (!_.isError(_.attempt(JSON.parse.bind(null, app.data[controller].uriContext))))
						{
							app.data[controller].dataContext = _.assign(app.data[controller].dataContext,
								_.attempt(JSON.parse.bind(null, app.data[controller].uriContext)));

							app.data[controller] = _.assign(app.data[controller],
								_.attempt(JSON.parse.bind(null, app.data[controller].uriContext)));
						}
						else
						{
							app.data[controller].dataContext = app.data[controller].uriContext;
						}
					}
					else
					{
						app.data[controller].dataContext = app.data[controller].uriContext;
					}

					if (_.isString(app.data[controller].dataContext))
					{
						app.data[controller].id = app.data[controller].dataContext
					}
				}	

				uriContext = mydigitalstructure._scope.app.uriContext;

				$('.popover:visible').popover('hide');

				//looking for routing options

				if (mydigitalstructure._scope.app.options.routing != undefined)
				{
					if (!mydigitalstructure._scope.data.loaded)
					{
						if (!isReload)
						{
							isReload = (window.performance.navigation.type == 1)

							if (!isReload)
							{
								isReload = (_.isEmpty(document.referrer));
							}

							if (!isReload)
							{
								isReload = (_.includes(document.referrer, mydigitalstructure._scope.app.options.authURI & '/'));
							}
						}
					}	

					var routingInstruction;

					if (mydigitalstructure._scope.app.options.routing.toURI != undefined)
					{
						routingInstruction = _.find(mydigitalstructure._scope.app.options.routing.toURI, function (instruction)
						{
							var instructionMatch = (instruction.uri == uri && _.includes(instruction.uriContext, uriContext))

							if (instructionMatch)
							{
								if (instruction.onlyApplyIfURIDataContextNotEmpty || instruction.onlyApplyIfURIDataContextSet)
								{
									instructionMatch = !_.isEmpty(mydigitalstructure._scope.app.dataContext)
								}

								if (instructionMatch && instruction.onlyApplyIfDataIsEmpty)
								{
									instructionMatch = _.isEmpty(app.data[controller])
								}

								if (instructionMatch && !instruction.applyEvenIfReload)
								{
									instructionMatch = isReload
								}
							}

							return instructionMatch
						});
					}

					if (_.isEmpty(routingInstruction))
					{
						if (mydigitalstructure._scope.app.options.routing.toStart != undefined)
						{
							var routingInstruction = _.find(mydigitalstructure._scope.app.options.routing.toStart, function (instruction)
							{
								var instructionMatch = 
								((instruction.uri == uri || instruction.uri == '*')
									&& (_.includes(instruction.uriContext, '*') || _.includes(instruction.uriContext, uriContext)))

								if (instructionMatch)
								{
									if (instruction.onlyApplyIfURIDataContextNotEmpty)
									{
										instructionMatch = !_.isEmpty(mydigitalstructure._scope.app.dataContext)
									}

									if (instructionMatch && !instruction.applyEvenIfDataIsEmpty)
									{
										instructionMatch = _.isEmpty(app.data[controller].controller)
									}

									if (instructionMatch && !instruction.applyEvenIfNotReload)
									{
										instructionMatch = isReload
									}
								}

								return instructionMatch
							});

							if (routingInstruction != undefined)
							{
								routingInstruction.redirect =
								{
									uri: mydigitalstructure._scope.app.options.startURI,
									uriContext: mydigitalstructure._scope.app.options.startURIContext
								}	
							}
						}
					}

					mydigitalstructure._scope.data.loaded = true;

					if (routingInstruction != undefined)
					{
						if (routingInstruction.redirect != undefined)
						{
							if (routingInstruction.redirect.uri != undefined) {uri = routingInstruction.redirect.uri}
							if (routingInstruction.redirect.uriContext != undefined) {uriContext = routingInstruction.redirect.uriContext}
						}
					}
				}

				if ((window.location.pathname != uri && window.location.pathname != uri + '/') 
						|| window.location.hash.split('/')[0] != uriContext)
				{
					window.location.href = uri + '/' + uriContext;
				}
				else
				{
					mydigitalstructure._util.view.render(uri, uriContext);
				}

				var param = 
				{
					uriContext: mydigitalstructure._scope.app.uriContext,
					dataContext: mydigitalstructure._scope.app.dataContext
				}

				if (!_.isEmpty(mydigitalstructure._scope.app.dataContext))
				{
					param.id = mydigitalstructure._scope.app.dataContext
				}

				if (_.isFunction(mydigitalstructure._scope.app.viewNavigation))
				{
					mydigitalstructure._scope.app.viewNavigation(param)
				}
				else
				{
					if (mydigitalstructure._scope.app.viewNavigation != undefined)
					{
						mydigitalstructure._util.controller.invoke('app-navigation', param);
					}
				}

				if (_.isObject(app.view))
				{
					if (app.view[uriContext.replace('#', '')] != undefined)
					{
						app.view[uriContext.replace('#', '')](param);
					}
				}

				if (_.isObject(app.controller))
				{
					if (app.controller[uriContext.replace('#', '')] != undefined)
					{
						app.controller[uriContext.replace('#', '')](param);
					}
				}

				$('a[href="' + uriContext + '-' + mydigitalstructure._scope.app.dataContext + '"]').click();

			}
		},
		{
			name: 'app-working-start',
			code: function ()
			{
				$('#app-working').removeClass('hidden d-none');
			}
		},
		{
			name: 'app-working-stop',
			code: function ()
			{
				$('#app-working').addClass('hidden d-none');
			}
		},
		{
			name: 'app-notify',
			alias: 'notify',
			code: function (param)
			{
				var message; 
				var type;
				var time;
				var showDismiss;
				var persist;
				var header;
				var selector;  
				var animation;
				var dismiss;
				var small;

				if (typeof param == 'object')
				{
					message = mydigitalstructure._util.param.get(param, 'message').value;
					time = mydigitalstructure._util.param.get(param, 'time').value;
					persist = mydigitalstructure._util.param.get(param, 'persist', {default: false}).value;
					animation = mydigitalstructure._util.param.get(param, 'animation').value;
					header = mydigitalstructure._util.param.get(param, 'header').value;
					selector = mydigitalstructure._util.param.get(param, 'selector').value;
					small = mydigitalstructure._util.param.get(param, 'small').value;
					dismiss = mydigitalstructure._util.param.get(param, 'dismiss').value;
					type = mydigitalstructure._util.param.get(param, 'class').value;

					if (type == undefined)
					{
						type = mydigitalstructure._util.param.get(param, 'type').value;
					}

					showDismiss = mydigitalstructure._util.param.get(param, 'showDismiss').value;					
				}
				else
				{
					message = param;
				}

				if (type == undefined && _.includes(_.toLower(message), 'delete'))
				{
					type = 'danger'
				}

				if (type == undefined && mydigitalstructure._scope.app.options.styles != undefined)
				{
					if (mydigitalstructure._scope.app.options.styles.toast != undefined)
					{
						type = mydigitalstructure._scope.app.options.styles.toast.class;
					}
				}

				if (type == undefined)
				{
					type = 'info'
				}

				if (showDismiss == undefined && mydigitalstructure._scope.app.options.styles != undefined)
				{
					if (mydigitalstructure._scope.app.options.styles.toast != undefined)
					{
						showDismiss = mydigitalstructure._scope.app.options.styles.toast.showDismiss;
					}
				}

				if (time == undefined && mydigitalstructure._scope.app.options.styles != undefined)
				{
					if (mydigitalstructure._scope.app.options.styles.toast != undefined)
					{
						time = mydigitalstructure._scope.app.options.styles.toast.time;
					}
				}

				if (time == undefined)
				{
					time = 2000
				}

				if (animation == undefined && mydigitalstructure._scope.app.options.styles != undefined)
				{
					if (mydigitalstructure._scope.app.options.styles.toast != undefined)
					{
						animation = mydigitalstructure._scope.app.options.styles.toast.animation;
					}
				}

				if (animation == undefined)
				{
					animation = true
				}

				if (dismiss == undefined && mydigitalstructure._scope.app.options.styles != undefined)
				{
					if (mydigitalstructure._scope.app.options.styles.toast != undefined)
					{
						dismiss = mydigitalstructure._scope.app.options.styles.toast.dismiss;
					}
				}

				if (dismiss == undefined)
				{
					dismiss = '<i class="fa fa-times-circle text-muted" style="margin-top:2px;">'
				}

				if (message == undefined && app.data['notify-message'] != undefined)
				{
					message = app.data['notify-message'];
					app.data['notify-message'] = undefined;
				}

				if (typeof $.notify == 'function')
				{	
					if (persist)
					{
						time = 0;
						showDismiss = true;
					}

					$.notify(
					{
						message: '<div class="text-center">' + message + '</div>'
					},
					{
						allow_dismiss: showDismiss,
						type: type,
						delay: time,
						z_index: 9999,
						placement:
						{
							from: "top",
							align: "center"
						},
						__template:
							'<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
							'<button type="button" class="close" data-notify="dismiss" style="position: absolute; right: 10px; top: 5px; z-index: 10001;">{1}</button>' +
							'<div data-notify="message" class="text-center">{2}</div>' +
							'</div>'
					});
				}
				else if (_.isObject(window.toastr))
				{
					if (type.toLowerCase() == 'danger') {type = 'error'}

					toastr.options =
					{
						closeButton: true,
						preventDuplicates: false,
						positionClass: 'toast-top-right',
						onclick: null,
						showDuration: 400,
						hideDuration: 1000,
						timeOut: 3000,
						extendedTimeOut: 1000,
						showEasing: 'swing',
						hideEasing: 'linear',
						showMethod: 'fadeIn',
						hideMethod: 'fadeOut'
					}

					if (_.isFunction(toastr[type]))
					{
						toastr[type](message)
					}
					else
					{
						alert(message);
					}
				}
				else if (typeof $.fn.toast == 'function')
				{		
					if ($('#myds-toast').length == 0)
					{
						$(selector).append(
							'<div id="myds-toast" class="position-absolute w-100 d-flex flex-column p-4" aria-live="assertive" aria-atomic="true"></div>');
					}

					var html	= 
						'<div class="toast ml-auto" role="alert" style="min-width:260px;">';

					if (header != undefined || showDismiss == true)
					{
	  					html = html + '<div class="toast-header">';
					}

					if (header == undefined && showDismiss == true)
					{
						if (type == 'info')
						{
							header = '<i class="fa fa-info-circle" style="font-size:1.6em; color:lightblue;"></i>'
						}
						else if (type == 'danger')
						{
							header = '<i class="fa fa-exclamation-triangle" style="font-size:1.6em; color:red;"></i>'
						}
						else
						{
	  						header = '&nbsp;'
	  					}
					}

	  				if (header != undefined)
	  				{
	  					html = html + '<strong class="mr-auto">' + header + '</strong>';
	  				}

	  				if (small != undefined)
	  				{
	  					html = html + '<small>' + small + '</small>'
	  				}

	  				if (showDismiss == true)
					{
	  					html = html + '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">' +
	      							'<span aria-hidden="true">' + dismiss + '</i></span>' +
	    							'</button>';
	    			}

	    			if (header != undefined || showDismiss == true)
					{
	  					html = html + '</div>';
	  				}

	  				if (message != undefined)
	  				{
	  					html = html +
  							'<div class="toast-body">' +
  								message + 
  							'</div>';
  					}

  					html = html +		
	  					'</div>';

	  				$('#myds-toast').html(html);
					$('.toast').toast({delay: time, autohide: !persist, animation: animation})
					$('.toast').toast('show')

				}
				else
				{
					alert(message);
				}	
			}
		},
		{
			name: 'util-on-complete',
			code: function (param)
			{
				var onCompleteController = mydigitalstructure._util.param.get(param, 'onCompleteController').value;
				var onCompleteControllerWhenCan = mydigitalstructure._util.param.get(param, 'onCompleteControllerWhenCan').value;
				var controller = mydigitalstructure._util.param.get(param, 'controller').value;
				var callback = mydigitalstructure._util.param.get(param, 'callback').value;
				
				if (onCompleteController != undefined)
				{
					mydigitalstructure._util.param.set(param, 'onComplete', onCompleteController);
				}

				if (controller != undefined)
				{
					mydigitalstructure._util.param.set(param, 'onComplete', controller);
				}

				if (callback != undefined)
				{
					mydigitalstructure._util.param.set(param, 'onComplete', callback);
				}

				if (onCompleteControllerWhenCan != undefined)
				{
					mydigitalstructure._util.param.set(param, 'onCompleteWhenCan', onCompleteControllerWhenCan);
				}

				mydigitalstructure._util.onComplete(param)
			}
		},
		{
			name: 'util-validate-check',
			code: function (param)
			{
				mydigitalstructure._util.validate.check(param)
			}
		},
		{
			name: 'util-view-menu-set-active',
			code: function (param)
			{
				mydigitalstructure._util.menu.set(param);
			}
		},
		{
			name: 'util-whoami',
			alias: 'whoami',
			code: function (param)
			{
				return mydigitalstructure._util.whoami(param);
			}
		},
		{
			name: 'util-health-check',
			alias: 'healthCheck',
			code: function (param)
			{
				return mydigitalstructure._util.healthCheck.run(param);
			}
		},
		{
			name: 'util-attachment-upload-initialise',
			code: function (param)
			{
				mydigitalstructure._util.attachment.dropzone.init(param)
			}
		},
		{
			name: 'util-attachment-upload-process',
			code: function (param)
			{
				var target = mydigitalstructure._util.param.get(param.dataContext, 'target', {default: '#util-attachment-upload-container'}).value;
				var anywhere = mydigitalstructure._util.param.get(param.dataContext, 'anywhere', {default: false}).value;
				if (anywhere) {target = 'document.body'}

				var name = mydigitalstructure._util.param.get(param, 'name').value;
				if (name == undefined)
				{
					name = _.camelCase(target)
				}

				if (_.has(mydigitalstructure, '_util.attachment.dropzone.object'))
				{
					if (mydigitalstructure._util.attachment.dropzone.object[name] != undefined)
					{
						if (_.isFunction(mydigitalstructure._util.attachment.dropzone.object[name].processQueue))
						{
							mydigitalstructure._util.attachment.dropzone.object[name].processQueue()
						}
					}
				}
			}
		},
		{
			name: 'util-attachment-upload-clear',
			code: function (param)
			{
				var target = mydigitalstructure._util.param.get(param.dataContext, 'target', {default: '#util-attachment-upload-container'}).value;
				var anywhere = mydigitalstructure._util.param.get(param.dataContext, 'anywhere', {default: false}).value;
				if (anywhere) {target = 'document.body'}

				var name = mydigitalstructure._util.param.get(param, 'name').value;
				if (name == undefined)
				{
					name = _.camelCase(target)
				}

				if (_.has(mydigitalstructure, '_util.attachment.dropzone.object'))
				{
					if (mydigitalstructure._util.attachment.dropzone.object[name] != undefined)
					{
						if (_.isFunction(mydigitalstructure._util.attachment.dropzone.object[name].removeAllFiles))
						{
							mydigitalstructure._util.attachment.dropzone.object[name].removeAllFiles()
						}
					}
				}
			}
		}	
	]);

	app.controller['util-view-reset'] = function (param)
	{
		var controller = mydigitalstructure._util.param.get(param, 'controller').value;
		var scope = mydigitalstructure._util.param.get(param, 'scope').value;
		var data = mydigitalstructure._util.param.get(param, 'data').value;
		var includeNew = mydigitalstructure._util.param.get(param, 'includeNew', {default: true}).value;

		if (controller == undefined) {controller = scope}

		if (data)
		{
			app._util.data.reset(param);

			if (includeNew)
			{
				app._util.data.reset({scope: scope + '-'});
			}
		}
		
		$('#' + controller + ' .myds-text').val('');
		$('#' + controller + ' .myds-check').attr('checked', false);
		$('#' + controller + ' .myds-data').html('...');
		$('#' + controller + ' .myds-data-view').html(app.options.working);
		$('#' + controller + ' .myds-text-select').val('');
		$('#' + controller + ' .myds-text-select').removeAttr('data-id');
		$('#' + controller + ' input').removeClass('myds-validate-error');
	}

	app.controller['util-attachment-check'] = function (param)
	{
		var fileSize;
		var fileSizeMax = 10e6;
		
		var id = param.dataContext.id;
		
		if (app.data['util-attachment-check']._file.length > 0)
		{
			if (app.data['util-attachment-check']._file[0].files != undefined)
			{
				fileSize = _namespace.data['util-attachment-check']._file[0].files[0].size
			}
		}
		
		var status = s.replaceAll(id, '-file0', '-status');
		
		if (app.controller[status] != undefined)
		{
			param.fileOverSize = (fileSize > fileSizeMax);
			param.fileSize = fileSize;
			param.fileSizeMax = fileSizeMax;
			app.controller[status](param);	
		}
		else
		{
			app.vq.show('#' + s.replaceAll(id, '-file0', '-status'), '');

			if (fileSize > fileSizeMax)
			{
				app.vq.clear({queue: 'util-attachment-check'});
				app.vq.add('<div class="alert alert-danger m-b" role="alert">The file you are about to upload is large, so it may take some time to upload.  Please do not close the web-browser until the upload is completed.  Thank you.</div>', {queue: 'util-attachment-check'})
				app.vq.render('#' + s.replaceAll(id, '-file0', '-status'), {queue: 'util-attachment-check'});
			}
		}
	}

	app.controller['util-clear'] = function (param)
	{
		var target = mydigitalstructure._util.param.get(param.dataContext, 'target').value;
		var controller = mydigitalstructure._util.param.get(param.dataContext, 'controllerAfter').value;

		if (target != undefined)
		{	
	 		$('#' + target + ' input').prop('checked', false)
	 	}

	 	if (controller != undefined)
		{	
	 		if (app.controller[controller] != undefined)
	 		{
	 			app.data[controller] = {}
	 			app.controller[controller]({dataContext: {}})
	 		}
	 	}
	}

	app.controller['util-user-switches'] = function (param, response)
	{
		var switchSpaces = app._util.data.get(
		{
			controller: 'util-user-switches',
			context: 'switchSpaces'
		});
		
		if (response == undefined)
		{
			if (param.dataContext != undefined)
			{
				app._util.data.set(
				{
					controller: 'util-user-switches',
					context: 'view',
					value: param.dataContext.view
				});
			}	

			if (mydigitalstructure._scope._user == undefined)
			{
				mydigitalstructure._scope._user = _.clone(mydigitalstructure._scope.user)
				mydigitalstructure._scope._user.context = _.clone(mydigitalstructure._scope.user.context)
			}
			
			mydigitalstructure.retrieve(
			{
				object: 'core_space',
				data:
				{
					criteria:
					{
						fields:
						[
							{name: 'space'},
							{name: 'spacetext'},
							{name: 'targetuser'},
							{name: 'targetusercontactbusiness'},
							{name: 'targetusercontactbusinesstext'},
							{name: 'targetusertext'}
						]
					}
				},
				set:
				{
					controller: 'util-user-switches',
					data: 'switchSpaces'
				},
				callback: app.controller['util-user-switches']
			})
		}
		else
		{
			switchSpaces = response.data.rows;

			app._util.data.set(
			{
				controller: 'util-user-switches',
				context: 'switchSpaces',
				value: switchSpaces
			});

			var view = app._util.data.get(
			{
				controller: 'util-user-switches',
				context: 'view'
			});

			if (view == undefined) {view = '#nav-user-switch-view'}

			app.vq.clear({queue: 'util-user-switches'});
			
			app.vq.add('<li><a href="#" class="myds" style="padding-top:3px;padding-bottom:3px;" data-controller="util-user-switch-to" data-context="{{context}}" data-id="{{id}}"' +
					   ' data-contactbusiness="{{targetusercontactbusiness}}"' +
					   ' data-contactbusinesstext="{{targetusercontactbusinesstext}}"' +
					   '>{{country}}</li>',
					   {queue: 'util-user-switches', type: 'template'});

			if (_.size(switchSpaces) != 0)
			{
				//app.vq.add('<div class="text-muted text-center m-t m-b-0">Switch to</div>', {queue: 'util-user-switches'});
			
				app.vq.add('<div class="nav nav-stacked">', {queue: 'util-user-switches'});
				
				_.each(switchSpaces, function (switchSpace)
				{
					var member = _.find(app.data.members, function (m) {return m.tradename == switchSpace.targetusercontactbusinesstext});

					if (member != undefined)
					{
						switchSpace.context = 'switch';
						switchSpace.country = member.streetcountry;
						//switchspace.targetusercontactbusinesstext = _.unescapeHTML(switchspace.targetusercontactbusinesstext);
						app.vq.add({queue: 'util-user-switches', useTemplate: true}, switchSpace);
					}	
				});

				var countryName = mydigitalstructure._scope._user.context.countryName;
				if (countryName == '') {countryName = 'Switch back'}

				app.vq.add({queue: 'util-user-switches', useTemplate: true},
				{
					id: '',
					targetusercontactbusiness: mydigitalstructure._scope._user.contactbusiness,
					targetusercontactbusinesstext: mydigitalstructure._scope._user.contactbusinesstext,
					country: countryName,
					context: 'switch-back'
				});
			}
			
			app.vq.add('</div>', {queue: 'util-user-switches', type: 'template'});

			app.vq.render(view, {queue: 'util-user-switches'});
		}
	}

	app.controller['util-user-switch-to'] = function (param, response)
	{
		if (response == undefined)
		{
			if (mydigitalstructure._scope._user == undefined)
			{
				mydigitalstructure._scope._user = _.clone(mydigitalstructure._scope.user)
			}
			
			var data =
			{
				id: param.dataContext.id,
			}
			
			if (param.dataContext.context == 'switch')
			{
				data.switch = 1
			}
			else
			{
				data.switchback = 1
			}

			mydigitalstructure.update(
			{
				object: 'core_space',
				data: data,
				callback: app.controller['util-user-switch-to']
			});
		}
		else
		{
			if (response.status == 'OK')
			{
				var switchData = app._util.data.get(
				{
					controller: 'util-user-switch-to'
				});
				
				mydigitalstructure._scope.user.contactbusiness = switchData.contactbusiness;
				mydigitalstructure._scope.user.contactbusinesstext = switchData.contactbusinesstext;
				
				mydigitalstructure._util.controller.invoke('app-navigation');
			}
		}
	}

	app.controller['util-security-share-link-add'] = function (param)
	{
		mydigitalstructure.cloud.security.share.link.add(param);
	}

	app.controller['util-security-share-link-find'] = function (param)
	{
		mydigitalstructure.cloud.security.share.link.find(param);
	}

	app.controller['util-security-share-link-remove'] = function (param)
	{
		mydigitalstructure.cloud.security.share.link.remove(param);
	}

	app.controller['util-security-share-setup'] = function (param)
	{
		mydigitalstructure.cloud.security.share.setup.init(param);
	}

	app.controller['util-uuid'] = function (param)
	{
		return mydigitalstructure._util.uuid(param);
	}

	app.controller['util-view-select'] = function (param, response)
	{
		var scope = mydigitalstructure._util.param.get(param, 'sourceScope').value;
		var context = mydigitalstructure._util.param.get(param, 'sourceContext').value;
		var name = mydigitalstructure._util.param.get(param, 'sourceName').value;
		var useCache = mydigitalstructure._util.param.get(param, 'useCache', {default: false}).value;
		var container = mydigitalstructure._util.param.get(param, 'container').value;
		var object = mydigitalstructure._util.param.get(param, 'object').value;
		var controller = mydigitalstructure._util.param.get(param, 'sourceController').value;
		var field = mydigitalstructure._util.param.get(param, 'field').value;
		var data = mydigitalstructure._util.param.get(param, 'data').value;
		var optionsExist = mydigitalstructure._util.param.get(param, 'optionsExist').value;
		var defaultValue =  mydigitalstructure._util.param.get(param, 'defaultValue').value;
		var value =  mydigitalstructure._util.param.get(param, 'value').value;
		var hideSearch = mydigitalstructure._util.param.get(param, 'hideSearch', {default: false}).value;
		var objectFilters = mydigitalstructure._util.param.get(param, 'filter').value;
		var responseController = mydigitalstructure._util.param.get(param, 'responseController').value;
		var queryController = mydigitalstructure._util.param.get(param, 'queryController').value;
		var fields = mydigitalstructure._util.param.get(param, 'fields').value;

		if (defaultValue == undefined)
		{
			defaultValue = value;
		}

		if (objectFilters == undefined)
		{
			objectFilters = mydigitalstructure._util.param.get(param, 'filters').value;
		}

		var filters = [];

		if (objectFilters != undefined)
		{
			if (_.isArray(objectFilters))
			{
				filters = _.concat(filters, objectFilters)
			}
			else if (_.isObject(objectFilters))
			{
				filters.push(objectFilters)
			}
			else
			{
				var _objectFilters = _.attempt(JSON.parse.bind(null, objectFilters));

				if (!_.isError(_objectFilters))
				{
					if (_.isObject(_objectFilters))
					{
						filters.push(_objectFilters)
					}
					else if (_.isArray(_objectFilters))
					{
						filters = _.concat(filters, _objectFilters)
					}
				}
			}

			_.each(filters, function (filter) {filter.value1 = filter.value})
		}

		var element;

		if (container != undefined)
		{
			element = $('#' + container);

			if (element != undefined)
			{
				if (scope == undefined)
				{
					scope = element.attr('data-source-scope');
				}

				if (context == undefined)
				{
					context = element.attr('data-source-context');
				}

				if (controller == undefined)
				{
					controller = element.attr('data-source-controller');
				}
			}
		}
		else if (scope != undefined && context != undefined)
		{
			element = $('[data-scope="' + scope + '"][data-context="' + context + '"]');
		}
		else if (scope != undefined)
		{
			element = $('[data-scope="' + scope + '"]');
		}

		if (object == undefined)
		{
			object = element.attr('data-object');
		}

		if (element != undefined)
		{
			$(element).data('_objectfilters', filters);

			if (optionsExist == undefined)
			{
				optionsExist = (element.find('option').length != 0)
			}

			if (defaultValue == undefined)
			{
				defaultValue = 
				{ 
					id: element.attr('data-id'),
					text: element.attr('data-text')
				}
			}
			else
			{
				if (!_.isArray(defaultValue))
				{
					if (defaultValue.id == undefined) 
					{ 
						defaultValue.id = element.attr('data-id')
					}

					if (defaultValue.text == undefined) 
					{ 
						defaultValue.text = element.attr('data-text')
					}
				}
			}

			if (field == undefined)
			{
				field = element.attr('data-field');
			}

			if (field == undefined)
			{
				field = 'title'
			}

			if (fields == undefined && field != undefined)
			{
				fields = [{name: field, sortBy: true}]
			}

			if (typeof $.fn.select2 == 'function')
			{
				var selectParam = 
				{
					theme: 'bootstrap4',
					allowClear: false,
					language:
					{
					  searching: function ()
					  {
					    return 'Searching ...';
					  }
					},
				}

				selectParam = _.assign(selectParam, param.options);

				if (data != undefined)
				{
					selectParam.data = data;
				}
				else if (controller != undefined)
				{
					selectParam.data = mydigitalstructure._util.controller.invoke(controller, param);
				}
				else if (scope != undefined)
				{
					selectParam.data = mydigitalstructure._util.data.get(
					{
						scope: scope,
						context: context,
						name: name
					});
				}
				else if (object != undefined && !optionsExist)
				{
					var endpoint = object.split('_')[0];	

					var ajax = 
					{
						url: '/rpc/' + endpoint + '/?method=' + object + '_search',
						type: 'POST',
						delay: 500,
						data: function (query)
						{
							var dataQuery = {};

							if (queryController != undefined)
				    		{
				    			var _dataQuery = mydigitalstructure._util.controller.invoke(queryController,
				    			{
				    				search: query.term,
				    				fields: fields,
				    				filters: filters,
				    				dataContext: $(element).data()
				    			})

				    			if (_.isObject(_dataQuery))
				    			{
				    				var _criteria;

				    				if (_.has(_dataQuery, 'criteria'))
				    				{
				    					_criteria = _dataQuery.criteria;
				    				}
				    				else
				    				{
				    					_criteria = _dataQuery;
				    				}

				    				if (_.isObject(_criteria))
			    					{
			    						dataQuery.criteria = JSON.stringify(_criteria);
			    					}
			    					else
			    					{
			    						dataQuery.criteria = _criteria;
			    					}
				    			}
				    		}
				    		else
				    		{
						    	var dataQueryFields = [];
						    	var dataQuerySorts = [];

						    	_.each(fields, function (field)
						    	{
						    		dataQueryFields.push({name: field.name});

						    		if (field.sortBy)
						    		{
						    			dataQuerySorts.push({name: field.name, direction: 'asc'});
						    		}
						    	});

						    	if (dataQuerySorts.length == 0)
						    	{
						    		dataQuerySorts.push({name: _.first(dataQueryFields).name, direction: 'asc'});
						    	}

						    	var dataQueryFilters = [];

						    	var _dataQueryFilters = $(element).data('_objectfilters');

						    	if (_dataQueryFilters != undefined)
						    	{
						    		_.each(_dataQueryFilters, function (dataQueryFilter)
						    		{
						    			var dataParam = {};

						    			if (dataQueryFilter.valueScope != undefined)
						    			{
						    				dataParam.scope = dataQueryFilter.valueScope;
						    			}

						    			if (dataQueryFilter.valueContext != undefined)
						    			{
						    				dataParam.context = dataQueryFilter.valueContext;
						    			}

						    			if (dataQueryFilter.valueName != undefined)
						    			{
						    				dataParam.name = dataQueryFilter.valueName;
						    			}

						    			if (!_.isEmpty(dataParam))
						    			{
						    				dataQueryFilter.value1 = mydigitalstructure._util.data.get(dataParam)
						    			}

						    		});

						    		dataQueryFilters = _.concat(dataQueryFilters, _dataQueryFilters)
						    	}

						    	if (query.term != undefined)
						    	{
						    		_.each(fields, function (field, f)
						    		{
						    			if (f != 0)
						    			{
						    				dataQueryFilters.push({name: 'or'});
						    			}
						    			dataQueryFilters.push({name: field.name, comparison: 'TEXT_IS_LIKE', value1: query.term});
						    		});
						    	}

						      dataQuery =
						      {
									criteria: JSON.stringify(
									{
										fields: dataQueryFields,
										filters: dataQueryFilters,
										sorts: dataQuerySorts
									})
						      }
						    }
					  
				      	return dataQuery;
				    	},

				    	processResults: function (response)
				    	{
				    		var results;

				    		if (_.has(response.data, 'rows'))
							{
								_.each(response.data.rows, function (row)
								{
									_.each(row, function (value, field)
									{
										row[field] = _.unescape(value);
									});
								});
							}

				    		if (responseController != undefined)
				    		{
				    			results = mydigitalstructure._util.controller.invoke(responseController, param, response)
				    		}
				    		else
				    		{
					    		_.each(response.data.rows, function (row)
			               {
			               	var text = [];
			               	_.each(fields, function (field)
			               	{
			               		text.push(row[field.name]);
			               	})

									row.text = _.join(text, ' ');
			               });

			               results = response.data.rows;
			            }

					     return { results: results };
					   }
				  	}

				  	selectParam.ajax = ajax;
				}
				else if (!optionsExist)
				{
					selectParam.data = mydigitalstructure._util.data.get(param);
				}

				if (selectParam.minimumResultsForSearch == undefined && (optionsExist || hideSearch))
				{
					selectParam.minimumResultsForSearch = Infinity;
				}

				$(element).select2(selectParam);

				if (defaultValue != undefined)
				{
					if (!_.isArray(defaultValue))
					{
						if ($(element).find("option[value='" + defaultValue.id + "']").length != 0)
						{
						    $(element).val(defaultValue.id).trigger('change');
						}
						else
						{ 
						    var newOption = new Option(defaultValue.text, defaultValue.id, true, true);
						    $(element).append(newOption).trigger('change');
						} 
					}
					else
					{
						_.each(defaultValue, function (value)
						{
							 var newOption = new Option(value.text, value.id, true, true);
						    $(element).append(newOption)
						});

						$(element).trigger('change');
					}
				}
			}

			else if (typeof $.fn.chosen == 'function')
			{
				console.log('Chosen not supported yet.')
			}

			else if (typeof $.fn.typeahead == 'function')
			{
				console.log('Chosen not supported yet.')
			}
		}
	}

	app.controller['util-view-table'] = function (param, response)
	{
		var context = mydigitalstructure._util.param.get(param, 'context').value;
		var useCache = mydigitalstructure._util.param.get(param, 'useCache', {default: false}).value;
		var goToPageWhenCan = mydigitalstructure._util.param.get(param, 'goToPageWhenCan', {default: false}).value;
		var goToPageNumber = mydigitalstructure._util.param.get(param, 'goToPageNumber').value;
		var container = mydigitalstructure._util.param.get(param, 'container').value;

		var dataCache = app._util.data.get(
		{
			scope: 'util-view-table-cache',
			context: context
		});

		if (useCache && !_.isUndefined(dataCache))
		{
			$('#' + container).html(dataCache)
		}
		else
		{
			$('#' + container).addClass('hidden d-none');

			if (response != undefined || param.sort != undefined)
			{
				if (response != undefined)
				{
					if (response.error != undefined)
					{
						if (response.error.errorcode == 3)
						{
							response.data = {rows: []}
						}
					}

					if (context == undefined)
					{
						context = mydigitalstructure._util.param.get(param.data, 'context').value;
					}
				}

				var sort = param.sort;

				param = app._util.data.get(
				{
					scope: context,
					context: '_param'
				});

				if (sort != undefined)
				{
					param.sort = sort;
				}
			}

			var callback = mydigitalstructure._util.param.get(param, 'callback', {default: 'util-view-table'}).value;
			var format = mydigitalstructure._util.param.get(param, 'format').value;
			var filters = mydigitalstructure._util.param.get(param, 'filters').value;
			var customOptions = mydigitalstructure._util.param.get(param, 'customOptions').value;
			if (customOptions == undefined)
			{
				customOptions = mydigitalstructure._util.param.get(param, 'customoptions').value;
			}
			var sorts = mydigitalstructure._util.param.get(param, 'sorts').value;
			var options = mydigitalstructure._util.param.get(param, 'options').value;
			var object = mydigitalstructure._util.param.get(param, 'object').value;
			var controller = mydigitalstructure._util.param.get(param, 'controller').value;
			var scope = mydigitalstructure._util.param.get(param, 'scope').value;
			var container = mydigitalstructure._util.param.get(param, 'container').value;
			var deleteConfirm = mydigitalstructure._util.param.get(param, 'deleteConfirm').value;

			if (controller == undefined) {controller = container}

			if (container == undefined)
			{
				container = controller + '-view'
			}

			if (context == undefined && controller != undefined)
			{
				context = '_table-' +  controller;
				param = mydigitalstructure._util.param.set(param, 'context', context)
			}

			if (context == undefined && controller == undefined && scope != undefined)
			{
				context = scope;
				param = mydigitalstructure._util.param.set(param, 'context', context)
			}

			if (param != undefined)
			{
				$.each(format.columns, function (c, column)
				{
					if (column.param == undefined) {column.param = column.property}
					if (column.param == undefined) {column.param = column.field}
					if (column.paramList == undefined) {column.paramList = column.properties}
					if (column.paramList == undefined) {column.paramList = column.fieldList}
					if (column.paramList == undefined) {column.paramList = column.fields}
				})
				
				var dataSort = app._util.data.get(
				{
					controller: 'util-view-table',
					context: context,
					valueDefault: {}
				});

				if (dataSort.direction != undefined)
				{
					var columnSort = $.grep(format.columns, function (column) {return column.param == dataSort.name})[0];

					if (columnSort != undefined)
					{
						columnSort.sortDirection = dataSort.direction;
						sorts = [dataSort]
					}
				}

				if (response == undefined)
				{
					app._util.data.set(
					{
						scope: context,
						context: '_param',
						value: param
					});

					if (fields == undefined)
					{
						var fields = $.map(format.columns, function (column)
						{
							return (column.param!=undefined?{name: column.param}:undefined)
						});

						_.each(format.columns, function (column)
						{
							if (_.isArray(column.paramList))
							{
								_.each(column.paramList, function (param)
								{
									fields.push({name: param})
								});
							}
						});
					}	

					if (sorts == undefined)
					{
						sorts = $.grep(format.columns, function (column)
						{
							return (column.defaultSort)
						});

						sorts = $.map(sorts, function (column)
						{
							var direction = 'asc';
							if (column.defaultSortDirection != undefined)
							{
								direction = column.defaultSortDirection;
							}

							return (column.param!=undefined?{name: column.param, direction: direction}:undefined)
						});
					}

					var rows = (options.rows!=undefined ? options.rows : app.options.rows);

					var search = 
					{
						criteria:
						{
							fields: fields,
							filters: filters,
							customoptions: customOptions,
							options:
							{
								rows: options.rows
							},
							sorts: sorts
						}
					}

					var startRow = mydigitalstructure._util.param.get(param, 'startRow').value;

					if (startRow != undefined)
					{
						search.criteria.options.startrow = startRow;
					}

					if (options.count == undefined)
					{
						search.criteria.summaryFields =
						[
							{
								name: 'count(id) count'
							}
						]
					}		

					mydigitalstructure.retrieve(
					{
						object: object,
						data: search,
						callback: callback,
						callbackParam: param
					});
				}
				else // render
				{
					if (response.status == 'ER' && _.isFunction(options.onError))
					{
						options.onError(response.error)
					}
					else
					{
						var data = app._util.data.get(
						{
							scope: context,
							valueDefault: {}
						});

						if (options.count != undefined)
						{
							response.summary = {count: options.count}
						}

						var init = (_.eq(response.startrow, '0'));

						if (init)
						{
							if (format.row != undefined)
							{
								$.each(format.columns, function (c, column)
								{
									if (column.class == undefined) {column.class = format.row.class}
									if (column.data == undefined) {column.data = format.row.data}
								});
							}

							app._util.data.set(
							{
								scope: context,
								context: 'count',
								value: _.toNumber(response.summary.count)
							});
						}
						
						if (_.eq(app.data[context].count, 0)) //nothing to show
						{
							var noDataText = options.noDataText;
							if (noDataText == undefined) {noDataText = 'No data'}
							app.vq.show('#' + container, '<div class="text-muted mx-auto text-center">' + noDataText + '</div>', {queue: context});
						} 
						else
						{	
							if (format.row != undefined)
							{
								if (_.isFunction(format.row.method))
								{             
									_.each(response.data.rows, function (row, r)
									{
										row._index = r;

										row._previous = app._util.data.get(
										{
											controller: context,
											context: 'lastProcessedRow',
											clone: false
										});

										format.row.method(row);

										app._util.data.set(
										{
											scope: context,
											context: 'lastProcessedRow',
											value: row
										});
									});
								}

								if (!_.isUndefined(format.row.controller))
								{             
									_.each(response.data.rows, function (row, r)
									{
										row._index = r;

										row._previous = app._util.data.get(
										{
											scope: context,
											context: 'lastProcessedRow',
											clone: false
										});

										mydigitalstructure._util.controller.invoke(format.row.controller, row)

										app._util.data.set(
										{
											scope: context,
											context: 'lastProcessedRow',
											value: row
										});
									});
								}
							}    

							if (init)
							{
								app._util.data.set(
								{
									scope: context,
									context: 'all',
									value: response.data.rows
								});
							}
							else
							{
								app.data[context].all = _.concat(app.data[context].all, response.data.rows);
							}

							var captions = $.map(format.columns, function (column)
							{
								return (column.caption != undefined ? {name: column.caption, class: column.class, sortBy: column.sortBy, param: column.param, sortDirection: column.sortDirection} : undefined)
							});

							if (init || options.orientation == 'horizontal')
							{
								app.vq.clear({queue: context});
							}

							if (init)
							{	
								//Row template construction
								
								if (options.noHeader)
								{
									var columns = $.grep(format.columns, function (column)
									{
										return (column.hidden != true)
									});
								}
								else
								{
									var columns = $.grep(format.columns, function (column)
									{
										return (column.caption != undefined)
									});
								}

								var html = [];

								html.push('<tr' + (format.row.class==undefined?'':' class="' + format.row.class + '"') + 
										(format.row.data==undefined?'':' ' + format.row.data) + '>');

								$.each(columns, function (c, column)
								{
									if (column.html != undefined)
									{
										if (column.html.indexOf('<td') == -1)
										{
											html.push('<td class="' + column.class + '">' + column.html + '</td>');
										}
										else
										{
											html.push(column.html);
										}
									}
									else if (column.name != undefined || column.param != undefined)
									{
										var name = (column.name != undefined ? column.name : column.param);
										html.push('<td class="' + column.class + '"')

										if (column.data != undefined)
										{
											html.push(' ' + column.data);
										}

										html.push('>{{' + name + '}}</td>');
									}	
								});

								html.push('</tr>');

								if (options.containerController != undefined && options.containerController != '')
								{
									html.push('<tr id="' + options.containerController + '-{{id}}-container" class="collapse myds-collapse" data-id="{{id}}"' +
									' data-controller="' + options.containerController + '">' +
									'<td colspan="' + captions.length + '" id="' + options.containerController + '-{{id}}-container-view"></td></tr>')
								}

								app.vq.add(html.join(''), {type: 'template', queue: context});
							}

							if (init || options.orientation == 'horizontal')
							{
								//Header construction

								var rowsTotal = data.count;
								var rowsCurrent = data.all.length;
								var pageRows = options.rows;
								var pagesTotal = parseInt(_.toNumber(rowsCurrent) / _.toNumber(pageRows));
								var startRow = response.startrow;
								var currentPage = parseInt((_.toNumber(startRow) + _.toNumber(pageRows)) / _.toNumber(pageRows));
								var tableClass = (options.class!=undefined?options.class:'table-hover');

								app._util.data.set(
								{
									controller: context,
									context: 'pages',
									name: currentPage,
									value: {rows: response.data.rows.length}
								});

								if (response.error != undefined)
								{
									if (response.error.errorcode == 3)
									{
										if (app.data['util-view-table'] != undefined)
										{
											var dataContext = app.data['util-view-table'].dataContext;
											startRow = dataContext.start;
											pageRows = dataContext.rows;
											rowsCurrent = parseInt(_.toNumber(startRow) + _.toNumber(pageRows));
											rowsTotal = rowsCurrent;
											currentPage = parseInt(dataContext.page);
											pagesTotal = currentPage;

											var data = mydigitalstructure._util.data.set(
											{
												controller: context,
												context: 'count',
												value: rowsTotal
											});

											response.startrow = startRow;
											response.moreid = dataContext.id;
											response.morerows = 'false';
											response.rows = pageRows;
										}
									}
								}
								
								app.vq.add('<div class="myds-page-view" data-page="' + currentPage + '"', {queue: context});
								
								if (context != undefined)
								{
									app.vq.add(' data-context="' + context + '"', {queue: context})
								}

								app.vq.add('>', {queue: context});

								app.vq.add('<table class="table ' + tableClass + ' m-b-0">', {queue: context});

								if (response.data.rows.length != 0)
								{
									if (_.size(captions) != 0)
									{
										app.vq.add('<thead>', {queue: context});
										app.vq.add('<tr', {queue: context})

										if (controller != undefined)
										{
											app.vq.add(' data-controller="util-view-table"', {queue: context})
										}

										if (context != undefined)
										{
											app.vq.add(' data-context="' + context + '"', {queue: context})
										}

										if (format.header != undefined)
										{
											if (format.header.class != undefined)
											{
												app.vq.add(' class="' + format.header.class + '"', {queue: context})
											}
										}

										app.vq.add('>', {queue: context});

										var captionClass;
										var captionData;

										$.each(captions, function (c, caption)
										{
											captionClass = '';
											captionData = ''

											if (caption.class != undefined)
											{
												captionClass = caption.class
											}

											if (caption.sortBy)
											{
												captionClass = captionClass + ' myds-sort';
												captionData = 'data-sort-direction="' +
																	(caption.sortDirection!=undefined?caption.sortDirection:'asc') + '" data-sort="' + caption.param + '"';
											}

											if (captionClass != '')
											{
												captionClass = 'class="' + captionClass + '"';
											}

											app.vq.add('<th ' + captionClass + ' ' + captionData + '>' + caption.name + '</th>', {queue: context});
										});

										app.vq.add('</tr></thead>', {queue: context});	
									}	
								}
							}

							var methodColumns = $.grep(format.columns, function (column)
							{
								return (column.method != undefined || column.controller != undefined)
							});

							var columnData;

							if (methodColumns.length != 0)
							{
								_.each(response.data.rows, function (row)
								{
									_.each(methodColumns, function (column)
									{
										if (column.name == undefined) {column.name = column.param}

										if (column.name != undefined)
										{
											if (typeof(column.method) == 'function')
											{
												row[column.name] = column.method(row)
											}

											if (typeof app.controller[column.controller] == 'function')
											{

												columnData = mydigitalstructure._util.controller.invoke({name: column.controller}, column, row);
												if (columnData != undefined) {row[column.name] = columnData}
											}
										}
									});
								});
							}

							if (response.data.rows.length == 0)
							{
								app.vq.add('<tr><td class="text-center text-muted p-t-md p-b-md" colspan="' + captions.length + '">No more data</td></tr>', {queue: context});
							}
							else
							{
								_.each(response.data.rows, function (row)
								{
									app.vq.add({useTemplate: true, queue: context}, row);
								});
							}
							
							if (init || options.orientation == 'horizontal')
							{
								app.vq.add('</table></div>', {queue: context})
							}

							if (init)
							{
								app.vq.add('<div id="' + controller + '-navigation" class="mx-auto w-50"></div>', {queue: context})
							}

							if (options.orientation == 'horizontal')
							{
								$('#' + container + ' div.myds-page-view').hide()
							}

							var append = !init;
							var appendSelector = (options.orientation=='horizontal'?'div.myds-page-view:last':'table tr:last');

							app.vq.render('#' + container, {append: append, queue: context, appendSelector: appendSelector}, data);

							mydigitalstructure._util.view.more(_.omit(response, 'data'),
							{
								queue: context,
								controller: 'util-view-table',
								context: context,
								orientation: options.orientation,
								rows: options.rows,
								progressive: options.progressive,
								containerID: controller + '-navigation',
								showAlways: options.showAlways,
								showFooter: options.showFooter
							});
						}

						if (_.has(options, 'deleteConfirm') && context != undefined)
						{
							if (typeof $.fn.popover == 'function')
							{
								$('#' + container + ' .myds-delete').each(function (b, button)
								{
									var content = '<div class="text-center">' + options.deleteConfirm.text + '</div>' +
										  	'<div class="text-center mt-3 mb-2 m-t m-b">' +
										  	'<button type="button" class="btn btn-link text-muted myds-close" data-context="popover">Cancel</button>' +
										  	'<button type="button" class="btn btn-danger btn-outline myds-click myds-close"' +
										  		' data-context="popover"' +
										  		' data-controller="' + (_.isUndefined(options.deleteConfirm.controller)?context + '-delete-ok':options.deleteConfirm.controller) + '"' +
										  		' data-id="' + $(button).attr('data-id') + '"' +
										  	'>' + (_.isUndefined(options.deleteConfirm.buttonText)?'Delete':options.deleteConfirm.buttonText) + '</button>' +
										  	'</div>';

									$(button).popover(
									{
										title: (_.isUndefined(options.deleteConfirm.headerText)?'Delete':options.deleteConfirm.headerText),
										content: content,
										html: true,
										placement: (_.isUndefined(options.deleteConfirm.position)?'left':options.deleteConfirm.position),
										sanitize: false
									});
								});
							}
							else if (typeof $.fn.popConfirm == 'function')
							{
								$('#' + container + ' .myds-delete').popConfirm(
								{
									title: (_.isUndefined(options.deleteConfirm.headerText)?'Delete':options.deleteConfirm.headerText),
									content: options.deleteConfirm.text,
									placement: (_.isUndefined(options.deleteConfirm.position)?'left':options.deleteConfirm.position),
									controller: (_.isUndefined(options.deleteConfirm.controller)?context + '-delete-ok':options.deleteConfirm.controller),
									id: -1,
									sanitize: false
								});
							}
						}

						app._util.data.set(
						{
							scope: 'util-view-table-cache',
							context: context,
							value: $('#' + container).html()
						});

						app._util.data.set(
						{
							scope: 'util-view-table',
							context: context,
							name: 'paging',
							value:
							{
								pagesTotal: pagesTotal,
								pageRows: pageRows,
								rowsTotal: rowsTotal,
								rowsCurrent: rowsCurrent,
								startRow: startRow,
								id: response.moreid
							}
						});

						if (options.orientation == 'horizontal' && !options.progressive && goToPageWhenCan && goToPageNumber == undefined)
						{
							var dataStatus = app._util.data.get(
							{
								scope: 'util-view-table',
								context: context
							});

							if (_.has(dataStatus, 'currentPage'))
							{
								if (currentPage != dataStatus.currentPage)
								{
									goToPageNumber = dataStatus.currentPage
								}
							}
						}

						if (goToPageNumber != undefined && goToPageNumber != 1)
						{
							mydigitalstructure._util.view.showPage(
							{
								id: response.moreid,
								context: context,
								controller: "util-view-table",
								number: goToPageNumber,
								pages: pagesTotal,
								rows: pageRows,
								showPages: pagesTotal,
								showPagesMaximum: pagesTotal,
								startrow: (numeral(goToPageNumber).value() - 1) * numeral(pageRows).value()
							})
						}
						else
						{
							$('#' + container).removeClass('hidden d-none');

							app._util.data.set(
							{
								scope: 'util-view-table',
								context: context,
								name: 'currentPage',
								value: currentPage
							});

							app._util.data.set(
							{
								scope: 'util-view-table',
								context: context,
								name: 'currentPage',
								value: currentPage
							});

							if (param.onComplete == undefined)
							{
								param.onComplete = data._param.onComplete
							}

							mydigitalstructure._util.onComplete({onComplete: param.onComplete});
						}
					}
				}
			}
		}	
	}

	app._util = mydigitalstructure._util;
	app.invoke = mydigitalstructure._util.controller.invoke;
	app.add = mydigitalstructure._util.controller.add;
	app.find = mydigitalstructure._util.data.find;
	app.set = mydigitalstructure._util.data.set;
	app.get = mydigitalstructure._util.data.get;
	app.refresh = mydigitalstructure._util.view.refresh;
	app.vq = mydigitalstructure._util.view.queue;
	app.show = app.vq.show;

	_.mixin(
	{
		VERSION: mydigitalstructure._scope.app.options.version,
		appInvoke: mydigitalstructure._util.controller.invoke,
		appAdd: mydigitalstructure._util.controller.add,
		appParamSet: mydigitalstructure._util.param.set,
		appParamGet: mydigitalstructure._util.param.get
	});

	if (_.isObject(s))
	{
		if (_.isFunction(s.unescapeHTML))
		{
			_.unescapeHTML = s.unescapeHTML;
		}
	}

	if (_.isFunction(mydigitalstructure._util.factory.export))
	{
		mydigitalstructure._util.factory.export(param)
	}

	if (_.isFunction(mydigitalstructure._util.factory.import))
	{
		mydigitalstructure._util.factory.import(param)
	}	

	if (_.isFunction(mydigitalstructure._util.factory.local))
	{
		mydigitalstructure._util.factory.local(param)
	}

	if (_.isFunction(mydigitalstructure._util.factory.queryLanguage))
	{
		mydigitalstructure._util.factory.queryLanguage(param)
	}

	if (_.isFunction(mydigitalstructure._util.factory.dashboard))
	{
		mydigitalstructure._util.factory.dashboard(param)
	}	
}
