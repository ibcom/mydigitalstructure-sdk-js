
mydigitalstructure._util.factory.import = function (param)
{
	mydigitalstructure._util.controller.add(
	{
		name: 'util-import-upload-attach',
		code: function (param)
		{	
			var context = mydigitalstructure._util.param.get(param.dataContext, 'context').value;

			mydigitalstructure._util.data.set(
			{
				scope: 'util-import',
				context: 'context',
				value: context
			});

			if ($('#myds-util-attachment-upload-import-file0').val() == '')
			{	
				$('#util-import-upload-no-file').removeClass('hidden d-none');

				mydigitalstructure._util.view.refresh(
				{
						selector: '#util-import-status',
						template: 'No file to upload!'
					}
				);
			
				mydigitalstructure._util.sendToView(
				{
					from: 'myds-util-attachments-upload',
					status: 'error',
					message: 'No file to upload'
				});
			}
			else
			{
				$.ajax(
				{
					type: 'POST',
					url: '/rpc/setup/?method=SETUP_IMPORT_MANAGE',
					success: function(response)
					{
						mydigitalstructure._util.data.set(
						{
							scope: 'util-import',
							context: 'id',
							value: response.id
						});

						$('#myds-util-attachment-upload-import-objectcontext').val(response.id);

						mydigitalstructure._util.attachment.upload(
						{
							context: 'myds-util-attachment-upload-import',
							id: response.id,
							callback: 'util-import-upload-attach-process'
						})
					}
				});
			}
		}
	});

	app.controller['util-import-upload-attach-process'] = function (param, response)
	{
		if (param.attachments == undefined && response == undefined)
		{	
			mydigitalstructure.retrieve(
			{
				object: 'core_attachment',
				data:
				{
					criteria:
					{
						fields:
						[
							{name: 'type'},
							{name: 'filename'},
							{name: 'description'},
							{name: 'download'},
							{name: 'modifieddate'},
							{name: 'attachment'}
						],
						filters:
						[
							{
								name: 'object',
								comparison: 'EQUAL_TO',
								value1: 29
							}
						],
						sorts:
						[
							{
								name: 'id',
								direction: 'desc'
							}
						],
						options:
						{
							rows: 1
						}
					}
				},
				callback: 'util-import-upload-attach-process'
			});	
		}
		else
		{
			var attachment;

			if (param.attachments != undefined)
			{
				attachment = param.attachments[0];
				attachment.id = attachment.attachmentlink
			}
			else
			{
				if (response.data.rows.length > 0)
				{
					attachment = response.data.rows[0];
				}
			}

			if (attachment != undefined)
			{	
				var imports = mydigitalstructure._util.data.get(
				{
					scope: 'util-import',
					context: 'imports'
				});

				var context = mydigitalstructure._util.data.get(
				{
					scope: 'util-import',
					context: 'context'
				});

				var utilImport = _.filter(imports, function (i) {return i.name == context})[0];

				if (utilImport.columns == undefined)
				{
					utilImport.columns = utilImport.fields;

					_.each(utilImport.columns, function (column)
					{
						column.title = column.name
					});
				}
				
				if (utilImport.columns != undefined)
				{
					var data = 
					{
						columns: utilImport.columns,
						delimeter: ',',
						firstlineiscaptions: 'Y',
						id: attachment.id,
						allcolumnstext: 'Y'
					}

					$.ajax(
					{
						type: 'POST',
						url: '/rpc/core/?method=CORE_ATTACHMENT_READ&rows=500',
						data: JSON.stringify(data),
						dataType: 'json',
						success: function(response)
						{
							mydigitalstructure._util.data.clear(
							{
								scope: 'util-import',
								context: 'dataIndex'
							});

							mydigitalstructure._util.data.set(
							{
								scope: 'util-import',
								context: 'raw',
								value: response.data.rows
							});

							if (utilImport.initialiseController != undefined)
							{
								//It must invoke util-import-process controller when complete.
								mydigitalstructure._util.controller.invoke(utilImport.initialiseController, param)
							}
							else
							{
								mydigitalstructure._util.controller.invoke('util-import-process', param);
							}
						}
					});
				}
			}	
		}
	}

	app.controller['util-import-find'] = function (param)
	{
		var controller = mydigitalstructure._util.param.get(param, 'controller', {'default': 'setup'}).value;
		var context = mydigitalstructure._util.param.get(param, 'context').value;
		var value = mydigitalstructure._util.param.get(param, 'value').value;
		var defaultValue = mydigitalstructure._util.param.get(param, 'defaultValue').value;

		var returnValue = _.find(app.data.setup[context], function (data) {return _.lowerCase(data.title) == _.lowerCase(value)});

		if (_.isObject(returnValue))
		{
			returnValue = returnValue.id
		}
		else
		{
			returnValue = defaultValue
		}

		return returnValue
	}

	app.add(
	{
		name: 'util-import-process',
		code: function (param, response)
		{	
			var context = app.data["util-import"].context;

			if (context != undefined)
			{
				var utilImport = _.find(app.data['util-import'].imports, function (i) {return i.name == context});

				if (utilImport != undefined)
				{
					param = mydigitalstructure._util.param.set(param, 'import', utilImport);

					var processController = utilImport.processController;

					if (processController == undefined)
					{
						processController = 'util-import-process' + context
					}

					if (_.isFunction(app.controller[processController]))
					{

						if (app.data["util-import"].dataIndex == undefined)
						{
							app.data["util-import"].dataIndex = 0;
							app.data['util-import'].processing = [];
						}
						else
						{
							app.data["util-import"].dataIndex++;
						}	

						if (app.data["util-import"].dataIndex < app.data["util-import"].raw.length)
						{	
							rawData = app.data["util-import"].raw[app.data["util-import"].dataIndex]

							mydigitalstructure._util.view.refresh(
							{
									selector: '#util-import-status',
									template: utilImport.statusTemplate,
									data: rawData
								}
							);

							app.data['util-import'].processing.push(
							{
								index: app.data["util-import"].dataIndex,
								rawData: rawData
							});

							param = mydigitalstructure._util.param.set(param, 'processing', _.last(app.data['util-import'].processing))

							app.invoke(processController, param, rawData);
						}
						else
						{
							app.vq.show('#util-import-status', 'Complete');

							mydigitalstructure._util.controller.invoke(utilImport.completedController, param, app.data["util-import"].raw)
						}	
					}
				}
			}
		}
	});

}