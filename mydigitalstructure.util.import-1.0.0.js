
if (mydigitalstructure._util.import == undefined)
{
	mydigitalstructure._util.import = {}
}

//https://github.com/sheetjs/sheetjs
if (_.isObject(XLSX))
{
	mydigitalstructure._util.import.excel =
	{
		data: {},

		init: function (e)
 		{
  			var files = e.target.files
  			var file = files[0];
  			var reader = new FileReader();

  			mydigitalstructure._util.import.excel.data.controller = $(e.target).attr('data-controller');
  			mydigitalstructure._util.import.excel.data.scope = $(e.target).attr('data-scope');
  			mydigitalstructure._util.import.excel.data.validate = $(e.target).attr('data-validate');
  			if (mydigitalstructure._util.import.excel.data.validate == undefined)
  			{
  				mydigitalstructure._util.import.excel.data.validate = false;
  			}

  			if (mydigitalstructure._util.import.excel.data.scope == undefined)
  			{
  				mydigitalstructure._util.import.excel.data.scope = mydigitalstructure._util.import.excel.data.controller
  			}

  			mydigitalstructure._util.import.excel.data.context = $(e.target).attr('data-context');

  			mydigitalstructure._util.import.excel.data.format = mydigitalstructure._util.data.get(
  			{
  				scope: mydigitalstructure._util.import.excel.data.scope,
  				context: mydigitalstructure._util.import.excel.data.context,
  				name: 'import-format'
  			})

  			reader.onload = function(e)
  			{
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, {type: 'array'});

   			mydigitalstructure._util.import.excel.data.workbook = workbook;

   			if (mydigitalstructure._util.import.excel.data.controller != undefined)
   			{
   				mydigitalstructure._util.import.excel.data.names = workbook.Workbook.Names;
   				mydigitalstructure._util.import.excel.data.lastmodifieddate = moment(workbook.Props.ModifiedDate).format('LT');

   				_.each(mydigitalstructure._util.import.excel.data.names, function (name)
   				{
   					name.sheet = _.first(_.split(name.Ref, '!'));
   					name.cell = _.replaceAll(_.last(_.split(name.Ref, '!')), '\\$', '');

   					_.each(mydigitalstructure._util.import.excel.data.format, function (format)
   					{
   						if (format.name == name.Name)
   						{
   							if (format.sheet == undefined && format.cell == undefined)
   							{
   								format.sheet = name.sheet;
   								format.cell = name.cell;
   							}
   							else if (format.sheet != undefined && format.cell == undefined)
   							{
   								if (format.sheet == name.sheet)
   								{
   									format.cell = name.cell;
   								}
   							}
   						}
   					})
   				});

   				var param = 
   				{
   					context: mydigitalstructure._util.import.excel.data.context,
   					format: 'excel'
   				}

   				var importFormat = mydigitalstructure._util.import.excel.data.format;

   				if (importFormat != undefined)
   				{
   					mydigitalstructure._util.import.excel.data.processed = {};

						var worksheet;
						var value;
						var comments;


						_.each(importFormat, function (format)
						{
							worksheet = workbook.Sheets[format.sheet];
							value = undefined;
							comments = [];

							if (worksheet != undefined)
							{
								cell = worksheet[format.cell];

								if (cell != undefined)
								{
									value = cell.v
									comments = cell.c;
								}
							}

							format._value = value;

							format._comments = _.map(comments, function (comment)
							{
								var comment = _.last(_.split(comment.t, 'Comment:'))

								if (comment != undefined)
								{
									comment = _.trim(comment.replace(/[^a-zA-Z ]/g,""))
								}

								return comment;
							});

							mydigitalstructure._util.import.excel.data.processed[format.name] = value;
						});
   				}

   				mydigitalstructure._util.controller.invoke(mydigitalstructure._util.import.excel.data.controller, param, mydigitalstructure._util.import.excel.data)
   			}

				/*
					Example controller code @
					https://webapp-quickstart-next.mydigitalstructure.cloud/site/1987/1901.util.import-1.0.0.js
				*/
 			};

  			reader.readAsArrayBuffer(file);
  		}
  	}

	$(document).off('change', '#myds-util-import-excel-file')
	.on('change', '#myds-util-import-excel-file', function(event)
	{
		mydigitalstructure._util.import.excel.init(event);
	});
}

mydigitalstructure._util.factory.import = function (param)
{
	mydigitalstructure._util.controller.add(
	{
		name: 'util-import-upload-attach',
		code: function (param)
		{	
			var context = mydigitalstructure._util.param.get(param.dataContext, 'context').value;
			var validate = mydigitalstructure._util.param.get(param.dataContext, 'validate', {default: false}).value;

			mydigitalstructure._util.data.set(
			{
				scope: 'util-import',
				context: 'context',
				value: context
			});

			mydigitalstructure._util.data.set(
			{
				scope: 'util-import',
				context: 'validate',
				value: validate
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
					var validateController = utilImport.validateController;

					if (processController == undefined)
					{
						processController = 'util-import-process' + context
					}

					if (validateController == undefined)
					{
						validateController = 'util-import-process-validate' + context
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
							if (response != undefined)
							{
								if (response.status == 'OK')
								{
									if (_.last(app.data['util-import'].processing) != undefined)
									{
										_.last(app.data['util-import'].processing)._status = 'imported-' + 
												_.lowerCase(response.notes)
										
										_.last(app.data['util-import'].processing).response = response;
									}
								}
								else
								{
									_.last(app.data['util-import'].processing)._status = 'error-' + 
											_.lowerCase(response.error.errornotes)
								}
							}
							else
							{
								_.last(app.data['util-import'].processing)._status = 'matched-not-updated'							
							}

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

							if (app.data["util-import"].validate)
							{
								app.invoke(validateController, param, rawData);
							}
							else
							{
								app.invoke(processController, param, rawData);
							}	
						}
						else
						{
							app.vq.show('#util-import-status', 'Complete');

							app.data["util-import"].status = _.groupBy(app.data['util-import'].processing, '_status');

							mydigitalstructure._util.controller.invoke(utilImport.completedController, param, app.data["util-import"])
						}	
					}
				}
			}
		}
	});
}