/*
 
 headers: [{text:}]
 captions: [{text:, source:}]
 fileData: [{name: value}]
  
*/

mydigitalstructure._util.factory.export = function (param)
{
	app.controller['util-export'] = function (param)
	{
		$('#util-export-download').removeClass('disabled');
		$('#util-export-download').text('Download');

		var context = mydigitalstructure._util.param.get(param.dataContext, 'context').value;
		var dataContext = mydigitalstructure._util.param.get(param.dataContext, 'context').value;
		var message = mydigitalstructure._util.param.get(param.dataContext, 'message').value;

		if (context != undefined)
		{
			if (app.controller['util-export-' + context] != undefined)
			{
				app.controller['util-export-' + context]();
			}
		}

		if (message != undefined)
		{
			app.vq.show('#util-export-message', message);
		}

		var dataSource = mydigitalstructure._util.param.get(param.dataContext, 'source').value;

		var data = app._util.data.get(
		{
			controller: dataSource
		});

		$('#util-export-reduced-container').addClass('hidden');
		$('#util-export-all-container').addClass('hidden');
		$('#util-export-select').addClass('hidden');

		if (data != undefined)
		{
			if (data.all != undefined)
			{
				app.vq.show('#util-export-all-count', _.size(data.all));
			
				if (data.reduced != undefined)
				{
					if (_.size(data.reduced) != _.size(data.all))
					{
						$('#util-export-select').removeClass('hidden');
						$('#util-export-all-container').removeClass('hidden');
						$('#util-export-reduced-container').removeClass('hidden');
						app.vq.show('#util-export-reduced-count', _.size(data.reduced));
					}	
				}
			}
		}

		app._util.data.set(
		{
			controller: 'util-export-0',
			context: 'type',
			value: 'all'
		});

		if (param.dataContext != undefined)
		{
			app._util.data.set(
			{
				controller: 'util-export-0',
				context: 'controller',
				value: param.dataContext.controller
			});
		
			app._util.data.set(
			{
				controller: 'util-export-0',
				context: 'source',
				value: param.dataContext.source
			});
		
			app._util.data.set(
			{
				controller: 'util-export-0',
				context: 'filename',
				value: param.dataContext.filename
			});
		}	
	}

	app.controller['util-export-table'] = function (param, response)
	{
		var context = mydigitalstructure._util.param.get(param, 'context').value;

		if (context != undefined)
		{
			var tableParam = app._util.data.get(
			{
				scope: '_table-' + context,
				context: '_param'
			});

			if (tableParam.format != undefined)
			{
				var captions = $.grep(tableParam.format.columns, function (column)
				{
					return ((column.param != undefined || column.name != undefined) && (column.caption != undefined))
				});

				$.each(captions, function(caption)
				{
					caption.source = caption.param;
					if (caption.source = undefined) {caption.source = caption.name}
				});

				app._util.data.set(
				{
					scope: '_table-' + context,
					context: 'export',
					name: 'captions',
					value: captions
				});

				if (tableParam.format.row != undefined)
				{
					if (_.isFunction(tableParam.format.row.method))
					{
						app._util.data.set(
						{
							scope: '_table-' + context,
							context: 'export',
							name: 'exportController',
							value: tableParam.format.row.method
						});
					}
				}

				app._util.data.set(
				{
					scope: '_table-' + context,
					context: 'export',
					name: 'filename',
					value: 'export-' + context + '.csv'
				});

				app.controller['util-export-download'](
				{
					context: 'context',
					source: '_table-' + context,
					filename: 'export-' + context + '.csv'
				})
			}	
		}
	}

	app.controller['util-export-download'] = function (param, response)
	{
		var source = mydigitalstructure._util.param.get(param, 'source').value;
		var filename = mydigitalstructure._util.param.get(param, 'filename').value;

		$('.myds-export[data-context="' + source + '"]').addClass('disabled');
		$('.myds-export[data-context="' + source + '"]').text('Downloading...');

	/*	var exportData = app._util.data.get(
		{
			controller: 'util-export'
		});

		if (exportData != undefined)
		{
			if (source == undefined)
			{
				source = exportData.source
			}

			if (filename == undefined)
			{
				filename = exportData.filename
			}
		}*/

		if (param == undefined) {param = {}}
		//param.fileName = data.filename;
		//param.source = data.source;

		var exportParam = app._util.data.get(
		{
			controller: source,
			context: 'export'
		});

	/*	var controller = data.controller;

		if (_.isUndefined(controller))
		{
			controller = exportParam.controller
		}

		app._util.data.set(
		{
			controller: 'util-export-0',
			context: 'filedata',
			value: app.data[data.source][data.type]
		});*/

		var dataSource = app._util.data.get(
		{
			controller: source
		});

		if (_.isObject(response))
		{	
			var exportController = exportParam.exportController;
			var rows = response.data.rows;

			if (exportController != undefined)
			{
				if (!_.isFunction(exportController))
				{
					if (_.isFunction(app.controller[exportController]))
					{
						exportController = app.controller[exportController];
					}
				}	
				
				if (_.isFunction(exportController))
				{
					_.each(rows, function (row)
					{
						exportController(row)
					});
				}	
			}

			app.data[source].all = _.concat(app.data[source].all, rows);
		}	

		var getMore = false;

		if (!_.isUndefined(dataSource.count))
		{
			if (_.gt(dataSource.count, _.size(dataSource['all'])))
			{
				getMore = true;
			}
		}

		if (getMore)
		{
			var _retrieve = mydigitalstructure._scope.data[source]._retrieve;

			mydigitalstructure._util.view.moreSearch(
			{
				id: _retrieve.moreid,
				startrow: _.size(dataSource['all']),
				rows: (_.toNumber(dataSource.count) - _.toNumber(_.size(dataSource['all']))),
				controller: 'util-export-download'
			})
		}
		else
		{
			if (controller != undefined)
			{
				if (_.isFunction(controller))
				{
					controller(param);
				}
				else if (_.isFunction(app.controller[controller]))
				{
					app.controller[controller](param);
				}
			}
			else
			{
				param.fileData = app.data[source]['all'];	
				//app.controller['util-export-data-to-csv'](param);
			}	
		}	
	}

	app.controller['util-export-data-to-csv'] = function (param, data)
	{
		var source = app._util.data.get(
		{
			controller: 'util-export',
			context: 'dataContext',
			name: 'source'
		});

		var exportParam = app._util.data.get(
		{
			controller: source,
			context: 'export'
		});

		var fileData = mydigitalstructure._util.param.get(param, 'fileData').value;

		if (_.isUndefined(fileData))
		{
			fileData = app._util.data.get(
			{
				controller: 'util-export-0',
				context: 'filedata'
			});
		}	

		var csv = [];

		if (exportParam.headers != undefined)
		{	
			$.each(exportParam.headers, function (h, header)
			{
				csv.push('"' + header.text + '"');
				csv.push('\r\n');
			});

			csv.push('\r\n');
		}

		if (exportParam.captions != undefined)
		{
			csv.push($.map(exportParam.captions, function (caption) {return '"' + caption.text + '"'}).join(','));
			csv.push('\r\n');
		}
		
		if (fileData == undefined)
		{
			fileData = exportParam.fileData;	
		}

		if (param.fileName == undefined)
		{
			param.fileName = exportParam.fileName;	
		}
		
		var sources;

		if (_.size(_.filter(exportParam.captions, function (c) {return c.source != undefined})) != 0)
		{
			sources = _.pluck(exportParam.captions, 'source');
		}

		if (fileData != undefined)
		{
			var rowData;
			var findParam;
			var findValue;

			$.each(fileData, function (r, row)
			{
				rowData = [];

				//if there is one column with source, then all have to have source!
				if (sources != undefined)
				{
					_.each(sources, function (source)
					{
						if (_.isObject(source))
						{
							findParam = source.find;
							if(_.isObject(findParam))
							{
								findParam.id = row[findParam.context];
								if (_.isUndefined(findParam.name)) {findParam.name = 'title'};
								findValue = app._util.data.find(findParam);
								findValue = _.toString(findValue);
								findValue = $('<p>' + he.decode(findValue) + '</p>').text();
								rowData.push('"' + (findValue==undefined?'':_.replaceAll(findValue,'"','\'')) + '"');
							}
							else
							{
								rowData.push('');
							}
						}
						else
						{
							findValue = $('<p>' + he.decode(_.toString(row[source])) + '</p>').text();

							var contents = $('<p>' + he.decode(_.toString(row[source])) + '</p>').contents();

							contents = _.filter(contents, function (content)
							{
								return (!_.isUndefined(content.data) && content.data != '\n')
							});

							findValue = _.join(_.map(contents, function (content)
														{
															var r;
															if (_.trim(content.data) != '') {r = content.data}		
															return r
														}), '; ')

							rowData.push('"' + (row[source]==undefined?'':_.replaceAll(findValue,'"','\'')) + '"');
						}	
					})
				}
				else
				{	
					for (var key in row)
			  		{
			     		if (row.hasOwnProperty(key))
			     		{
			     			rowData.push('"' + he.decode(row[key]) + '"');
			     		}  
			     	}
			    } 	

		     	csv.push(rowData.join(','));
		     	csv.push('\r\n');
			});
		}	

		if (param == undefined) {param = {}}
		param.data = csv.join('');
		app.controller['util-export-to-file'](param)
	}	

	app.controller['util-export-to-file'] = function (param)
	{
		var fileData = mydigitalstructure._util.param.get(param, 'data').value;
		var fileName = mydigitalstructure._util.param.get(param, 'fileName').value;
		var filenamePrefix = mydigitalstructure._util.param.get(param, 'filenamePrefix').value;
		var controller = mydigitalstructure._util.param.get(param, 'controller').value;
		var source = mydigitalstructure._util.param.get(param, 'source').value;

		if (_.isUndefined(filenamePrefix))
		{	
			filenamePrefix = app._util.data.get(
			{
				controller: 'util-export',
				context: 'dataContext',
				name: 'filenamePrefix'
			});
		}	

		if (_.isUndefined(fileName))
		{
			if (_.isUndefined(filenamePrefix))
			{
				filenamePrefix = (controller?controller:source);
				if (_.isUndefined(filenamePrefix)) {filenamePrefix = 'export'}
			}
			fileName = filenamePrefix + '-' + _.toUpper(moment().format("DDMMMYYYY")) + '.csv';
		}

		var useLocal = mydigitalstructure.saveAs;

		if (_.contains(window.navigator.vendor, 'Apple'))
		{
			useLocal = false;
		}
		
		if (useLocal)
		{
			var file = new File([fileData], fileName, {type: "text/plain;charset=utf-8"});
			saveAs(file);
			$('#util-export').modal('hide');
		}
		else
		{
			var data =
			{
				filedata: fileData,
				filename: fileName
			}

			$.ajax(
			{
				type: 'POST',
				url: '/rpc/core/?method=CORE_FILE_MANAGE',
				data: data,
				dataType: 'json',
				success: function(response)
				{
					window.open(response.link, '_self');
					$('#util-export').modal('hide');
					//mydigitalstructure._util.doCallBack(param, response);
				}
			});
		}	
	}

	app.controller['util-export-image'] = function (param)
	{
		if (param.viewStatus == 'shown')
		{
			var dataContext = app._util.data.get(
			{
				controller: 'util-export-image',
				context: 'dataContext'
			});

			var param =
			{
				elementSVGContainerID: dataContext.source,
				elementImageContainerID: 'util-export-image-view',
				elementImageDownloadID: 'util-export-image-download',
				viewScale: 4,
				format: 'png',
				styles: '<style type="text/css"><![CDATA[' +
							'svg{font:10px arial; -webkit-tap-highlight-color:transparent; shape-rendering: crispEdges;} line, path{fill:none;stroke:#000} text{-webkit-user-select:none;-moz-user-select:none;user-select:none}.c3-bars path,.c3-event-rect,.c3-legend-item-tile,.c3-xgrid-focus,-ygrid{shape-rendering:crispEdges}-chart-arc path{stroke:#fff}-chart-arc text{fill:#fff;font-size:13px}-grid line{stroke:#aaa;}-grid text{fill:#aaa} .c3-xgrid, .c3-ygrid{stroke-dasharray:3 3}-text-empty{fill:gray;font-size:2em}-line{stroke-width:1px}-circle._expanded_{stroke-width:1px;stroke:#fff}-selected-circle{fill:#fff;stroke-width:2px}-bar{stroke-width:0}-bar._expanded_{fill-opacity:.75}-target-focused{opacity:1}-target-focused path-line,-target-focused path-step{stroke-width:2px}-target-defocused{opacity:.3!important}-region{fill:#4682b4;fill-opacity:.1}-brush .extent{fill-opacity:.1}-legend-item{font-size:12px}-legend-item-hidden{opacity:.15}-legend-background{opacity:.75;fill:#fff;stroke:#d3d3d3;stroke-width:1}-title{font:14px sans-serif}-tooltip-container{z-index:10}-tooltip{border-collapse:collapse;border-spacing:0;background-color:#fff;empty-cells:show;-webkit-box-shadow:7px 7px 12px -9px #777;-moz-box-shadow:7px 7px 12px -9px #777;box-shadow:7px 7px 12px -9px #777;opacity:.9}-tooltip tr{border:1px solid #CCC}-tooltip th{background-color:#aaa;font-size:14px;padding:2px 5px;text-align:left;color:#FFF}-tooltip td{font-size:13px;padding:3px 6px;background-color:#fff;border-left:1px dotted #999}-tooltip td>span{display:inline-block;width:10px;height:10px;margin-right:6px}-tooltip td.value{text-align:right}-area{stroke-width:0;opacity:.2}-chart-arcs-title{dominant-baseline:middle;font-size:1.3em}-chart-arcs -chart-arcs-background{fill:#e0e0e0;stroke:none}-chart-arcs -chart-arcs-gauge-unit{fill:#000;font-size:16px}-chart-arcs -chart-arcs-gauge-max,-chart-arcs -chart-arcs-gauge-min{fill:#777}-chart-arc -gauge-value{fill:#000}' +
							']]></style>',
				onComplete: mydigitalstructure._util.downloadImage	
			}
			
			mydigitalstructure._util.svgToImage(param);
		}	
	}
}