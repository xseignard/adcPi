var gpio = require('gpio'),
	async = require('async');


/**
 * Reads digital values from a MCP3004 ADC.
 * @param {Number} channel - the ADC channel to read
 * @param {Object} opts - an object containing the pin numbers
 *   for clock, mosi, miso and cspin
 * @return {Number} the read value between 0 and 1023
 */
var readAdc = function(channel, callback, opts) {
	if (channel < 0 || channel > 3) throw new Error('adc channel number must be in the range of 0--3');
	// pin numbers from opts or default ones
	var clockPin = opts && opts.clockPin ? opts.clockPin : 18,
		misoPin = opts && opts.misoPin ? opts.misoPin : 23,
		mosiPin = opts && opts.mosiPin ? opts.mosiPin : 24,
		csPin = opts && opts.csPin ? opts.csPin : 25;
	// direction of each pin
	var pinsConf = [
		{pin: clockPin, direction: 'out'},
		{pin: misoPin, direction: 'in'},
		{pin: mosiPin, direction: 'out'},
		{pin: csPin, direction: 'out'}
	];
	// handle refs to the gpio instances
	var pins = {};

	var _initGpio = function(pinConf, done) {
		pins[pinConf.pin] = gpio.export(pinConf.pin, {
			direction: pinConf.direction,
			ready: function() {
				done();
			}
		});
	};
	// start reading spi data when all pins are ready
	async.each(pinsConf, _initGpio, function(err) {
		if (err) throw err;
		pins[csPin].set(1);
		pins[clockPin].set(0);
		pins[csPin].set(0);

		var cmdOut = channel;
		cmdOut |= 0x18;
		cmdOut <<= 3;
		for (var i = 0; i < 5; i++) {
			if (cmdOut & 0x80) {
				pins[mosiPin].set(1);
			}
			else {
				pins[mosiPin].set(0);
			}
			cmdOut <<= 1;
			pins[clockPin].set(1);
			pins[clockPin].set(0);
		}
		var adcOut = 0;
		for (i = 0; i < 12; i++) {
			pins[clockPin].set(1);
			pins[clockPin].set(0);
			adcOut <<= 1;
			if (pins[misoPin].value) {
				adcOut |= 0x1;
			}
		}
		pins[csPin].set(1);
		adcOut >>= 1;
		callback(adcOut);
	});
};

setInterval(function() {
	readAdc(0, function(value) {
		console.log(value);
	});
}, 1000);