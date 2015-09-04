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
	assistMeWithBehavior: true,
}

myApp.init = function ()
{
	mydigitalstructure.init(myApp.start, myApp.view.update, myApp.options);
}

myApp.start = function (data)
{
	if (data)
	{
		if (data.islogged)
		{
			//show app ie /#/app
		}
		else
		{
			myApp.view.render('/auth');
			//show auth ie /#/auth
		}
	}
}

myApp.view = {};

myApp.view.templates =
[
	{
		uri: '/auth'
	},
	{
		uri: '/app',
		html: ''
	}
]

myApp.view.update = function (data)
{
	if (data)
	{
		//data.status
		//data.message
	}
}

myApp.view.render = function (data)
{
	//use templates ie bootstrap and hogon to render.
	//or render on scroll ie scrollspy

	var aView = $.grep(myApp.view.templates, function (view) {return view.uri==data});
	if (aView.length==1)
	{	
		var oView = aView[0];

		if oView.html != undefined)
		{
			window.location.hash = data;
			$(myApp.options.container).html(oView.html);
		}
		else
		{
			window.location.pathName = data;
		}
	}
}

