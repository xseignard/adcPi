var gpio = require('gpio'),
	async = require('async');


/**
 * Reads digital values from a MCP3004 ADC.
 * @param {Number} channel - the ADC channel to read
 * @param {Object} opts - an object containing the pin numbers
 *   for clock, mosi, miso and cspin
 * @return {Number} the read value between 0 and 1023
 */
var readAdc = function(channel, opts) {
	if (!channel) throw new Error('adc channel number must be defined');
	// pin numbers from opts or default ones
	var clockPin = opts.clockPin || 18,
		mosiPin = opts.mosiPin || 23,
		misoPin = opts.misoPin || 24,
		csPin = opts.csPin || 25;

	var pinNumbers = [clockPin, mosiPin, misoPin, csPin];
	var pins = {};

	var _initGpio = function(pinNumber, done) {
		pins[pinNumber] = gpio.export(pinNumber, {
			direction: out,
			ready: function() {
				done();
			}
		});
	};

	async.each(pinNumbers, _initGpio, function(err) {
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
			if (pins[mosiPin].value) {
				adcOut |= 0x1;
			}
		}
		pins[csPin].set(1);
		adcOut >>= 1;
		return adcOut;
	});
};

setTimeout(function() {
   var adc = readAdc(0);
   console.log(adc);
}, 1000);