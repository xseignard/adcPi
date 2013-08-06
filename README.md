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

  - [ADC()](#adc)
  - [ADC.init()](#adcinit)
  - [ADC.close()](#adcclose)
  - [ADC.read())](#adcreadchannelnumbercallbackfunction)

## ADC()

  ADC class, that represents an instance of an ADC. 
  
  Below is a code snippet that shows the configuration possibilities. 
  
  The opts object is optional. And each key inside it too.
  
  The values shown there are the defaults fallback.
  
```js
var ADC = require('adc-pi-gpio'),
  opts = {
    tolerance : 2,
    interval : 300,
    channels : [0],
    SPICLK: 12,
    SPIMISO: 16,
    SPIMOSI: 18,
    SPICS: 22
  };
var adc = new ADC(opts);
```

## ADC.init()

  Init the pins that are used by the ADC and start reading on the defined ADC channels.

## ADC.close()

  Close the pins used by the ADC.

## ADC.read(channel:Number, callback:function())

  Read the value of the given ADC channel.
