/*!
 * Template for your own app code
 */

$(function()
{
	if (myApp.options.httpsOnly && window.location.protocol == 'http:')
	{
		window.location.href = window.location.href.replace('http', 'https')
	}
	else
	{
		myApp.init();
	}	
});

var myApp = {};

myApp.options = 
{
	httpsOnly: true,
	container: '#main',
	assistWithBehavior: false,
	registerDocument: 6144
}

myApp.views =
[
	{
		uri: '/register',
		controller: 'register'
	},
	{
		uri: '/auth',
		controller: 'auth'
	},
	{
		uri: '/app',
		controller: 'app'
	},
	{
		uri: '#/people'
	}
]

myApp.init = function ()
{
	mydigitalstructure.init(myApp.start, myApp.update, myApp.options, myApp.views);
}

myApp.start = function (data)
{
	if (data)
	{
		uriPath = (data.isLoggedOn?'/app':'/auth');
		
		if (uriPath != window.location.pathname)
		{	
			mydigitalstructure._util.view.render(uriPath);
		}	
	}
}

myApp.update = function (data)
{
	if (data)
	{
		if (data.from == 'myds-logon-send')
		{
			if (data.status == 'error')
			{	
				$('#myds-logon-status').html(data.message)
			}
			else
			{
				$('#myds-logon-status').html('');
			}	
		}

		if (data.from == 'myds-init')
		{
			if (data.status == 'uri-changed')
			{	
				mydigitalstructure._util.view.render(uriPath);
			}	
		}
	}
}

myApp.controller = {}

myApp.controller.register = function (param)
{
	$('#myds-register').off('click');

	$('#myds-register').on('click', function(event)
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
}

myApp.controller.auth = function (param)
{
	$('#myds-logon').off('click');

	$('#myds-logon').on('click', function(event)
	{
		mydigitalstructure.auth(
		{
			logon: $('#myds-logonname').val(),
			password: $('#myds-logonpassword').val(),
			callback: myApp.start
		});
	});
}

myApp.controller.app = function (param)
{
	$('#myds-logoff').on('click', function(event)
	{
		mydigitalstructure.deauth();
	});
}

