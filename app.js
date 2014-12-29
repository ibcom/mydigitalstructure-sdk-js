/*!
 * Template for your own app code
 */

$(function()
{
	myApp.init();
});

var myApp = {};

myApp.init = function ()
{
	mydigitalstructure.init(myApp.start, myApp.view.update);
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
			//show auth ie /#/auth
		}
	}
}

myApp.view = {};

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
}

myApp.view.templates =
[
	{
		uri: '/logon',
		html: ''
	},
	{
		uri: '/app',
		html: ''
	}
]