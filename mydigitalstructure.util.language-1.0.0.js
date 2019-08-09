mydigitalstructure._util.factory.language = function (param)
{
	if (app == undefined) {app = {controller: {}}};
	if (app.controller == undefined) {app.controller = {}};

	app.controller['util-language-get'] = function (param)
	{
		var site = mydigitalstructure._util.param.get(param, 'site').value;

		if (site != undefined)
		{
			$.ajax(
			{
				type: 'GET',
				url: '/site/' + site + '/mydigitalstructure.language-3.0.0.json',
				dataType: 'json',
				success: function(data)
				{
					mydigitalstructure._util.data.set(
					{
						scope: 'util-language',
						value: data
					});

					mydigitalstructure._util.onComplete(param);
				},

				error: function(data) {}			
			});
		}		
	}
}

