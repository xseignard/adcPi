var Adcrpi = require('../adc-pi-gpio'),
	config = {
		tolerance : 2,
		interval : 300,
		channels : [ 0 ],
		pins : {
			SPICLK: { number: 12, direction: 'out' },
			SPIMISO: { number: 16, direction: 'out' },
			SPIMOSI: { number: 18, direction: 'out' },
			SPICS: { number: 22, direction: 'out' },
		}
	}

Adcrpi.init(config);

Adcrpi.on('change', function(data) {
    console.log('Channel ' + data.channel + ' value is now ' + data.value);
});