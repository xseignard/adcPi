'use strict';
/**
 * # adcPi
 *
 * [Bit banging](http://en.wikipedia.org/wiki/Bit_banging) communication between ADC and the Raspberry Pi.
 * 
 * Largely inspired by ladyada's script: [https://gist.github.com/ladyada/3151375](https://gist.github.com/ladyada/3151375).
 * 
 * Install `gpio-admin` :
 * ```shell
 * git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
 * cd quick2wire-gpio-admin
 * make
 * sudo make install
 * sudo adduser $USER gpio
 * ```
 *
 * ## Usage
 * ```js
 * var ADC = require('../src/adc'),
 *     adc = new ADC();
 *	
 * var end = function() {
 *   adc.close();
 *   process.exit();
 * };
 *
 * process.on('SIGTERM', end);
 * process.on('SIGINT', end);
 *
 * adc.init(function() {
 *   setInterval(function() {
 *     adc.read(0, function(value) {
 *       console.log('v: ' + value);
 *     });
 *   }, 300);
 * });
 * ```
 */
var gpio = require('pi-gpio'),
	async = require('async'),
	_ = require('underscore');
/**
 * ADC class, that represents an instance of an ADC.
 * @constructor
 * @param {Array} opts - an array of objects describing of the pins to use (e.g. {pin: 9, direction: 'out'})
 */
var ADC = function(opts) {
		opts = opts || {};
		// conf
		this.pins = opts.pins || {
			SPICLK : {number: 12, direction: 'out'},
			SPIMISO : {number: 16, direction: 'in'},
			SPIMOSI : {number: 18, direction: 'out'},
			SPICS : {number: 22, direction: 'out'}
		};
		this.channels = opts.channels || [0];
		this.tolerance = opts.tolerance || 2;
		this.interval = opts.interval || 300;
};
/**
 * Init the pins that are used by the ADC.
 * @param {function()} callback - to be called when init is ok
 * @throws {Error} err - an Error if the initialization went wrong
 */
ADC.prototype.init = function(callback) {
	// to be called for each pin
	var _initGpio = function(pin, done) {
		gpio.open(pin.number, pin.direction, function(err) {
			done();
		});
	};
	// async init of each pins
	async.each(_.toArray(this.pins), _initGpio, function(err) {
		if (err) throw err;
		if (typeof callback === 'function') callback();
	});
};

/**
 * Read the value of the given ADC channel.
 * @param {Number} channel - the channel number
 * @param {function()} callback - first arg of the callback is the read value
 * @throws {Error} err - an Error if the read went wrong
 */
ADC.prototype.read = function(channel, callback) {
	var _self = this;
	gpio.write(_self.pins.SPICS.number, 1, function() {
		gpio.write(_self.pins.SPICLK.number, 0, function() {
			gpio.write(_self.pins.SPICS.number, 0, function() {
				var cmdOut = channel;
				cmdOut |= 0x18;
				cmdOut <<= 3;
				async.timesSeries(
					// do this 5 times
					5,
					// each time apply this function
					function(n, next) {
						gpio.write(_self.pins.SPIMOSI.number, cmdOut & 0x80, function() {
							cmdOut <<= 1;
							gpio.write(_self.pins.SPICLK.number, 1, function() {
								gpio.write(_self.pins.SPICLK.number, 0, function() {
									next();
								});
							});
						});
					},
					// when done
					function(err, stuff) {
						if (err) throw err;
						var adcOut = 0;
						async.timesSeries(
							// do this 12 times
							12,
							// each time apply this function
							function(n, next) {
								gpio.write(_self.pins.SPICLK.number, 1, function() {
									gpio.write(_self.pins.SPICLK.number, 0, function() {
										adcOut <<= 1;
										gpio.read(_self.pins.SPIMISO.number, function(err, value) {
											if (value > 0) {
												adcOut |= 0x1;
											}
											next();
										});
									});
								});
							},
							// when done
							function(err) {
								if (err) throw err;
								gpio.write(_self.pins.SPICS.number, 1, function() {
									adcOut >>= 1;
									if (typeof callback === 'function') callback(adcOut);
								});
							}
						);
					}
				);
			});
		});
	});
};

/**
 * Close the pins used by the ADC.
 * @param {function()} callback - to be called when close is ok
 */
ADC.prototype.close = function (callback) {
	// to be called for each pin
	var _closeGpio = function(pin, done) {
		gpio.close(pin.number, function() {
			done();
		});
	};
	// async close of each pins
	async.each(_.toArray(this.pins), _closeGpio, function(err) {
		if (err) throw err;
		if (typeof callback === 'function') callback();
	});
};

module.exports = ADC;