# adc-pi-gpio [![Build Status](https://travis-ci.org/xseignard/adcPi.png?branch=master)](https://travis-ci.org/xseignard/adcPi) [![Dependency Status](https://gemnasium.com/xseignard/adcPi.png)](https://gemnasium.com/xseignard/adcPi)

Node.js [Bit banging](http://en.wikipedia.org/wiki/Bit_banging) communication between ADC and the Raspberry Pi.

Largely inspired by ladyada's script: [https://gist.github.com/ladyada/3151375](https://gist.github.com/ladyada/3151375).

## Usage
- install with `npm install adc-pi-gpio --save` 
- check the demo sample:

```js
var ADC = require('../adc-pi-gpio'),
	config = {
		tolerance : 2,
		interval : 300,
		channels : [ 0 ],
		SPICLK: 12,
		SPIMISO: 16,
		SPIMOSI: 18,
		SPICS: 22
	};

var adc = new ADC(config);

process.on('SIGTERM', function(){
	adc.close();
});
process.on('SIGINT', function(){
	adc.close();
});

adc.init();

adc.on('ready', function() {
    console.log('Pins ready, listening to channel');
});
adc.on('close', function() {
	console.log('ADC terminated');
	process.exit();
});
adc.on('change', function(data) {
    console.log('Channel ' + data.channel + ' value is now ' + data.value + ' which in proportion is: ' + data.percent);
});
```
## API

