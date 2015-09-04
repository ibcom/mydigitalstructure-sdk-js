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
	assistMeWithBehavior: false
}

myApp.init = function ()
{
	mydigitalstructure.init(myApp.start, myApp.view.update, myApp.options);
	
	var oView = myApp._util.view.get(window.location.pathname);

	if (oView != undefined)
	{	
		if (oView.controller != undefined)
		{
			myApp.controller[oView.controller]();
		}	
	}	
}

myApp.start = function (data)
{
	if (data)
	{
		uriPath = (data.islogged?'/app':'/auth');
		
		if (uriPath != window.location.pathname)
		{	
			myApp._util.view.render(uriPath);
		}	
	}
}

myApp.controller = {}

myApp.controller.auth = function (param)
{
	$('#myds-logon').on('click', function(event)
	{
		mydigitalstructure.auth(
		{
			logon: $('#myds-logonname').val(),
			password: $('#myds-logonpassword').val()
		});
	});
}

myApp.view = {};

myApp.view.destinations =
[
	{
		uri: '/auth',
		controller: 'auth'
	},
	{
		uri: '/app'
	}
]

myApp.view.update = function (data)
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
	}
}

myApp._util = {view: {}}

myApp._util.view.get = function (data)
{
	var aView = $.grep(myApp.view.destinations, function (view) {return view.uri==data});
	if (aView.length==1) {return aView[0]}	
}

myApp._util.view.render = function (data)
{
	var oView = myApp._util.view.get(data);

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
}

