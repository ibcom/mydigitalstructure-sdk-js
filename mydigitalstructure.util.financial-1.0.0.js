/*
    {
        title: "Util; Financial",
    }
*/

/*!
 * ibCom Pty Ltd ATF ibCom Unit Trust & contributors
 * Licensed as Attribution-ShareAlike 4.0 International
 * http://creativecommons.org/licenses/by-sa/4.0/
 *
 * http://www.larryullman.com/2012/12/05/writing-the-javascript-code-for-handling-stripe-payments/
 * https://bootsnipp.com/snippets/featured/responsive-stripe-payment-form
 *
 * Example /paynow;

    <script src="/jscripts/jquery-1.8.3.min.js"></script>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="/site/312/1blankspace.util.site.collect-1.0.0.js"></script>
    <p>Pay Now</p>
    <div id="ns1blankspaceUtilFinancialStripeContainer"></div>

    !!!!! TO BE CONVERTED TO MYDIGITALSRUCTURE NAMESPACE & FACTORY GENERATED CONTROLLERS
 */

"use strict";

if (mydigitalstructure._util.financial == undefined) {mydigitalstructure._util.financial = {}}
if (mydigitalstructure._util.financial.collect === undefined) {mydigitalstructure._util.financial.collect = {}}

/*$(document).ready(function()
{  
   mydigitalstructure._util.financial.collect.getContext()
});*/


mydigitalstructure._util.financial.collect =
{
    data: {_publicKey: undefined},
    option: {autoReceipt: true},
    provider: {},

    getContext: function (param)
    {  
        var hashContexts = [];
        var context = {};

       if (window.location.hash != '')
        {
            hashContexts = window.location.hash.replace('#', '').split('|');
        }

        _.each(hashContexts, function (hashContext)
        {
            context[hashContext.split('=')[0]] = hashContext.split('=')[1]
        })

        mydigitalstructure._util.financial.collect.data.context = context;
        mydigitalstructure._util.financial.collect.init(context)
    },

    init: function (param)
    {    
        if (window.location.protocol == 'http:')
        {
            window.location.href = window.location.href.replace('http', 'https')
        }
        else
        {
        	//Get stripe public key from _scope.

			var collect = mydigitalstructure._util.financial.collect;

			collect.data.xhtmlContainer = $('#myds-util-financial-collect-container-stripe');

			collect.data.xhtmlContainerSuccess = $('#myds-util-financial-collect-container-stripe-Success');

			collect.option.stripe = (collect.data.xhtmlContainer != undefined)

			if (collect.option.stripe && window.Stripe == undefined)
			{
				collect.option.stripe = false
			}

			if (collect.option.stripe)
			{
				if (window.stripePublicKey != undefined)
				{
					collect.data._publicKey = window.stripePublicKey;
				}

				if (window.siteAccount != undefined)
				{
					collect.data._siteAccount = window.siteAccount;
				}

				collect.option.elements = (collect.data.xhtmlContainer.attr('data-ui') == 'elements')

				mydigitalstructure._util.financial.collect.stripe.init(param);
			}    
        }    
    },

    error: function (error)
    {
        mydigitalstructure._util.financial.collect.data.xhtmlContainer.html(error)
    },

    stripe:
    {
        data: {},

        init: function (param, response)
        {
        	var collect = mydigitalstructure._util.financial.collect;

            if (response == undefined)
            {
                if (collect.data._publicKey != undefined)
                {
                    mydigitalstructure._util.financial.collect.stripe.init(param,
                    {
                        data: {rows: [{apikey: collect.data._publicKey}]},
                        status: 'OK'
                    }); 
                }
                else
                {
                    mydigitalstructure.cloud.search(
                    {
                        object: 'site_funds_transfer_account',
                        fields: ['apikey'],
                        filters:
                        [
                            field: 'id',
                            value: collect.data._siteAccount
                        ],
                        callback: ns1blankspace.util.site.collect.stripe.init,
                        callbackParam: param
                    });
                }    
            }
            else
            {
                if (response.status == 'OK')
                {
                    if (response.data.rows.length > 0)
                    {
                        collect.data._publicKey = _.first(response.data.rows).apikey;
                        collect.data.stripe = Stripe(collect.data._publicKey);
                        ns1blankspace.util.site.collect.stripe.render(param);
                    }
                    else
                    {
                        mydigitalstructure._util.financial.collect.error('Error: No public key set up.')
                    }
                   
                }
                else
                {
                    mydigitalstructure._util.financial.collect.error('Error in getting key public key.')
                }
            }    
        },

		render: function (param)
		{ 
			var collect = mydigitalstructure._util.financial.collect;

			if (mydigitalstructure._util.financial.collect.data.xhtmlContainer.html() == '')
			{
				console.log('STRIPE ERROR NO HTML');

				/*$.ajax(
				{
				type: 'GET',
				url: window.location.protocol + '//' + window.location.host + '/site/' + mydigitalstructureSiteId + '/1blankspace.util.site.collect-1.0.0.html',
				dataType: 'text',
				global: false,
				success: function(data)
				{
				if (data != '')
				{
				ns1blankspace.util.site.collect.data.xhtmlContainer.html(data);
				ns1blankspace.util.site.collect.stripe.render(param);
				} 
				},
				error: function(data)
				{
				ns1blankspace.util.site.collect.error('No payment collection template');
				}
				});*/
			}
			else
			{                
				collect.data.xhtmlContainerSuccess.hide();
				collect.data.xhtml = collect.data.xhtmlContainer.html();
				collect.data.xhtml = collect.data.xhtml.replace(/\[\[Amount\]\]/g, param.amount);

				collect.data.xhtmlContainer.html(collect.data.xhtml);

				if (collect.option.elements)
				{
					mydigitalstructure._util.financial.collect.stripe.elements.init(param);
				}
				else
				{
					mydigitalstructure._util.financial.collect.stripe.bind(param);
				}
			}
		},

        bind: function (param)
        {
             //CHECK HTML IDS

            $("#myds-util-financial-collect-payment-form").submit(function(event)
            {
                event.preventDefault();

                //CHECK ID
                if ($('#myds-financial-collect-collect-process').length == 0)
                {
                    mydigitalstructure._util.financial.collect.stripe.getToken()
                }   
            });

            $("#myds-util-financial-collect-collect-container").submit(function(event)
            {
                event.preventDefault();

                if ($('#myds-financial-collect-collect-process').length == 0)
                {
                    mydigitalstructure._util.financial.collect.stripe.getToken();
                }
            });

            $('#myds-util-financial-collect-collect-process').click(function(event)
            {
                if (mydigitalstructure._util.financial.collect.option.elements)
                {
                    mydigitalstructure._util.financial.collect.stripe.getToken();
                }
                else
                {
                    mydigitalstructure._util.financial.collect.stripe.process();
                }    
            });

            if (mydigitalstructure._util.financial.collect.option.elements)
            {
                mydigitalstructure._util.financial.collect.data.card.addEventListener('change', function(event)
                {
                    if (event.error)
                    {
                        mydigitalstructure._util.financial.collect.data.error = true;
                        $('#myds-util-financial-collect-card-errors').addClass('alert alert-danger');
                        $('#myds-util-financial-collect-card-errors').html(event.error.message);
                    }
                    else
                    {
                        mydigitalstructure._util.financial.collect.data.error = false;
                        $('#myds-util-financial-collect-card-errors').removeClass('alert alert-danger');
                        $('#myds-util-financial-collect-card-errors').html('');
                    }
                });
            }    
        },

        process: function (param)
        {
			//If not using Stripe Elements

			if (param == undefined) {param = {}}
			param.error = false;
			param.errorMessages = [];

			param.number = $('.card-number').val();
			if (param.number == undefined) {param.number = $('.number').val()}

			param.cvc = $('.card-cvc').val();
			if (param.cvc == undefined) {param.cvc = $('.cvc').val()}

			param.exp_month = $('.card-expiry-month').val();
			if (param.exp_month == undefined) {param.exp_month = $('.expiry-month').val()}

			param.exp_year = $('.card-expiry-year').val();
			if (param.exp_year == undefined) {param.exp_year = $('.expiry-year').val()}

			if ((param.exp_year == undefined || param.exp_year == '')
			&& (param.exp_month == undefined || param.exp_month == ''))
			{
				param.expiry = $('.expiry').val();
				if (param.expiry != undefined)
				{
					var aExpiry = param.expiry.split('/');
					if (aExpiry.length > 0)
					{
						param.exp_month = aExpiry[0];
						param.exp_year = aExpiry[1];
					}    
				}
			}

			if (!Stripe.card.validateCardNumber(param.number))
			{
				param.error = true;
				param.errorMessages.push('<div>The credit card number appears to be invalid.</div>');
			}

			if (!Stripe.card.validateCVC(param.cvc))
			{
				param.error = true;
				param.errorMessages.push('<div>The CVC number appears to be invalid.</div>');
			}

			if (!Stripe.card.validateExpiry(param.exp_month, param.exp_year))
			{
				param.error = true;
				param.errorMessages.push('<div>The expiration date appears to be invalid.</div>');
			}

			if (!param.error)
			{
				ns1blankspace.util.site.collect.stripe.getToken()
			}
			else
			{
				ns1blankspace.util.site.collect.stripe.error(param.errorMessages.join(''));
			}
        },  

        getToken: function (param)
        {
            //CHECK ID
            $('#myds-util-financial-collect-process').prop('disabled', true);

            mydigitalstructure._util.financial.collect.data.stripe.createToken(mydigitalstructure._util.financial.collect.data.card)
            .then(function(result)
            {
                if (result.error)
                {
                    mydigitalstructure._util.financial.collect.stripe.error(result.error.message);
                }
                else
                {
                    mydigitalstructure._util.financial.collect.stripe.processToken(result.token);
                }
            });
        },

        processToken: function (token)
        {
            if (token != undefined)
            {
                var currency = mydigitalstructure._util.financial.collect.data.context.currency;
                if (currency == undefined) {currency = 'AUD'}

                var data =
                {
                    token: token.id,
                    currency: currency,
                    amount: mydigitalstructure._util.financial.collect.data.context.amount,
                    invoiceGUID: mydigitalstructure._util.financial.collect.data.context.invoiceGUID,
                    description: mydigitalstructure._util.financial.collect.data.context.description,
                    account: mydigitalstructure._util.financial.collect.data._siteAccount,
                    site: window.mydigitalstructureSiteId
                }

                mydigitalstructure.cloud.invoke(
                {
                    method: 'site_collect_payment_stripe'
                    data: data,
                    callback: mydigitalstructure._util.financial.collect.stripe.processTokenResponse,
                    callbackParam: param
                });

               /* $.ajax(
                {
                    type: 'POST',
                    url: '/rpc/site/?method=SITE_COLLECT_PAYMENT_STRIPE',
                    data: oData,
                    dataType: 'json',
                    success: function (data)
                    {
                        ns1blankspace.util.site.collect.stripe.processComplete(data);
                    },
                    error: function (data)
                    {
                        ns1blankspace.util.site.collect.stripe.error(data.responseJSON.error.errornotes)
                    }
                });*/
            }
            else
            {
                ns1blankspace.util.site.collect.stripe.error('Bad token')
            }    
        },

        processTokenResponse: function (response)
        {
            var error = false;

            if (error)
            {
                console.log('STRIPE ERROR');
                console.log(response);
                ns1blankspace.util.site.collect.stripe.error(data.responseJSON.error.errornotes);
            }
            else
            {
                ns1blankspace.util.site.collect.stripe.processComplete(response);
            }
        },

        processComplete: function (oResponse)
        {
            if (oResponse.status == 'OK')
            {
                if (oResponse.stripe_status == 'succeeded')
                {
                    if (ns1blankspace.util.site.collect.data.option.autoReceipt)
                    {   
                        ns1blankspace.util.site.collect.stripe.autoReceipt({chargeToken: oResponse.stripe_id})
                    }
                    else
                    {
                        ns1blankspace.util.site.collect.data.xhtmlContainer.hide();
                        ns1blankspace.util.site.collect.data.xhtmlContainerSuccess.show();
                    }
                }
                else
                {
                    ns1blankspace.util.site.collect.stripe.error(oResponse.stripe_outcome_sellermessage)
                }
            }
            else
            {
                ns1blankspace.util.site.collect.data.xhtmlContainer.html('<h3>There is something wrong with the set up of this page!')
            }
        },

        autoReceipt: function (param, oResponse)
        {
            if (oResponse == undefined)
            {
                var oData =
                {
                    amount: ns1blankspace.util.site.collect.data.context.amount,
                    guid: ns1blankspace.util.site.collect.data.context.invoiceGUID,
                    description: param.chargeToken,
                    site: window.mydigitalstructureSiteId
                }

                $.ajax(
                {
                    type: 'POST',
                    url: '/rpc/site/?method=SITE_AUTO_RECEIPT',
                    data: oData,
                    dataType: 'json',
                    success: function (data)
                    {
                        ns1blankspace.util.site.collect.stripe.autoReceipt(param, data);
                    }
                });
            }
            else
            {
                if (oResponse.status == 'ER')
                {
                    ns1blankspace.util.site.collect.stripe.error(oResponse.error.errornotes)
                }
                else
                {
                    ns1blankspace.util.site.collect.data.xhtmlContainer.hide();
                    ns1blankspace.util.site.collect.data.xhtmlContainerSuccess.show();
                }
            }    
        },

        error: function (sMessage)
        {
            $('#card-errors').html(sMessage).addClass('alert alert-danger');
            $('#site-collect-process').prop('disabled', false);
            return false;
        },

        elements:
        {
            init: function (param)
            {        
                mydigitalstructure._util.financial.collect.data.elements = mydigitalstructure._util.financial.collect.data.stripe.elements();

                mydigitalstructure._util.financial.collect.data.style =
                {
                    base:
                    {
                        color: '#32325d',
                        lineHeight: '18px',
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder':
                        {
                          color: '#aab7c4'
                        }
                    },
                    invalid:
                    {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                }

                mydigitalstructure._util.financial.collect.data.card = mydigitalstructure._util.financial.collect.data.elements
                    .create('card', {style: mydigitalstructure._util.financial.collect.data.style});

                mydigitalstructure._util.financial.collect.data.card.mount('#card-element');

                ns1blankspace.util.site.collect.stripe.bind(param);
            }
        }  
    }
}

mydigitalstructure._util.factory.financial = function (param)
{
    app.add(
    [
        {
            name: 'util-financial-collect-initialise',
            code: function (param)
            {
                mydigitalstructure._util.financial.collect(param);
            }
        }
    ]
}


