var ADC = require('../adc-pi-gpio'),
	config = {
		tolerance : 2,
		interval : 300,
		channels : [ 0 ],
		pins : {
			SPICLK: { number: 12, direction: 'out' },
			SPIMISO: { number: 16, direction: 'in' },
			SPIMOSI: { number: 18, direction: 'out' },
			SPICS: { number: 22, direction: 'out' },
		}
	}

var adc = new ADC()
adc.init();