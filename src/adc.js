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
 */

/**
 * ADC class, that represents an instance of an ADC.
 * @constructor
 * @param {Array} opts - an array of objects describing of the pins to use (e.g. {pin: 9, direction: 'out'})
 */
var ADC = function(opts) {
	
	var gpio = require('pi-gpio'),
		async = require('async'),
		// default conf
		SPICLK  = 12,
		SPIMISO = 16,
		SPIMOSI = 18,
		SPICS   = 22,
		pinsConf = opts || [
			{pin: SPICLK, direction: 'out'},
			{pin: SPIMISO, direction: 'in'},
			{pin: SPIMOSI, direction: 'out'},
			{pin: SPICS, direction: 'out'}
		];

	/**
	 * Init the pins that are used by the ADC.
	 * @param {function()} callback - to be called when init is ok
	 * @throws {Error} err - an Error if the initialization went wrong
	 */
	var _init = function(callback) {
		// to be called for each pin
		var _initGpio = function(pinConf, done) {
			gpio.open(pinConf.pin, pinConf.direction, function(err) {
				done();
			});
		};
		// async init of each pins
		async.each(pinsConf, _initGpio, function(err) {
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
	var _read = function(channel, callback) {
		gpio.write(SPICS, 1, function() {
			gpio.write(SPICLK, 0, function() {
				gpio.write(SPICS, 0, function() {
					var cmdOut = channel;
					cmdOut |= 0x18;
					cmdOut <<= 3;
					async.timesSeries(
						// do this 5 times
						5,
						// each time apply this function
						function(n, next) {
							gpio.write(SPIMOSI, cmdOut & 0x80, function() {
								cmdOut <<= 1;
								gpio.write(SPICLK, 1, function() {
									gpio.write(SPICLK, 0, function() {
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
									gpio.write(SPICLK, 1, function() {
										gpio.write(SPICLK, 0, function() {
											adcOut <<= 1;
											gpio.read(SPIMISO, function(err, value) {
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
									gpio.write(SPICS, 1, function() {
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
	var _close = function (callback) {
		// to be called for each pin
		var _closeGpio = function(pinConf, done) {
			gpio.close(pinConf.pin, function() {
				done();
			});
		};
		// async close of each pins
		async.each(pinsConf, _closeGpio, function(err) {
			if (err) throw err;
			if (typeof callback === 'function') callback();
		});
	};

	return {
		init: _init,
		read : _read,
		close: _close
	};
};

module.exports = ADC;