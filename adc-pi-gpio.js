'use strict';
var gpio = require('pi-gpio'),
	async = require('async'),
	_ = require('underscore'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	adcEventNames = {
		change: 'change',
		ready: 'ready',
		close: 'close'
	};

/**
 * ADC class, that represents an instance of an ADC. 
 *
 * Below is a code snippet that shows the configuration possibilities. 
 * 
 * The opts object is optional. And each key inside it too.
 * 
 * The values shown there are the defaults fallback.
 *
 *   var ADC = require('adc-pi-gpio'),
 *     opts = {
 *       tolerance : 2,
 *       interval : 300,
 *       channels : [0],
 *       SPICLK: 12,
 *       SPIMISO: 16,
 *       SPIMOSI: 18,
 *       SPICS: 22
 *     };
 *   var adc = new ADC(opts);
 * 
 * @constructor
 * @param {Object} opts - the configuration object
 * @property {Number} tolerance - if the delta between 2 reads > tolerance, a change event is fired
 * @property {Number} interval - interval in millis between 2 reads
 * @property {Array} channels - which ADC channels to read
 * @property {Number} SPICLK - SPI clock pin
 * @property {Number} SPIMISO - SPI MISO pin
 * @property {Number} SPIMOSI - SPI MOSI pin
 * @property {Number} SPICS - SPI CS pin
 */
var ADC = function(opts) {
		EventEmitter.call(this);
		opts = opts || {};
		// conf
		this.pins = {
			SPICLK : {number: opts.SPICLK || 12, direction: 'out'},
			SPIMISO : {number: opts.SPIMISO || 16, direction: 'in'},
			SPIMOSI : {number: opts.SPIMOSI || 18, direction: 'out'},
			SPICS : {number: opts.SPICS || 22, direction: 'out'}
		};
		this.channels = opts.channels || [0];
		this.tolerance = opts.tolerance || 2;
		this.interval = opts.interval || 300;
};
util.inherits(ADC, EventEmitter);

/**
 * Init the pins that are used by the ADC and start reading on the defined ADC channels.
 * @fires 'ready' event when init is ok
 * @throws {Error} err - an Error if the initialization went wrong
 */
ADC.prototype.init = function() {
	var _self = this,
	currentValue = -1 - _self.tolerance;
	// to be called for each pin
	var _initGpio = function(pin, done) {
		gpio.open(pin.number, pin.direction, function(err) {
			done();
		});
	};
	// when pins are ready, start reading on each defined channels
	var _initChannel = function(channel, done) {
		setInterval(function() {
			_self.read(channel, function(value) {
				if (Math.abs(currentValue - value) > _self.tolerance) {
					var data = {
						channel: channel,
						value: value,
						percent: value / 1023
					};
					_self.emit(adcEventNames.change, data);
					currentValue = value;
				}
			});
		}, _self.interval);
		done();
	};
	// async init of each pins
	async.each(_.toArray(_self.pins), _initGpio, function(err) {
		if (err) throw err;
		async.each(_self.channels, _initChannel, function(err){
			if (err) throw err;
			_self.emit(adcEventNames.ready);
		});
	});
};

/**
 * Close the pins used by the ADC.
 * @fires 'close' event when close is ok
 * @throws {Error} err - an Error if the close went wrong
 */
ADC.prototype.close = function () {
	var _self = this;
	// to be called for each pin
	var _closeGpio = function(pin, done) {
		gpio.close(pin.number, function() {
			done();
		});
	};
	// async close of each pins
	async.each(_.toArray(this.pins), _closeGpio, function(err) {
		if (err) throw err;
		_self.emit(adcEventNames.close);
	});
};

/**
 * Read the value of the given ADC channel.
 * @param {Number} channel - the channel number
 * @param {function()} callback - first arg of the callback is the read value
 * @throws {Error} err - an Error if the read went wrong
 */
ADC.prototype.read = function(channel, callback) {
	var _self = this,
		cmdOut,
		adcOut;
	var _mosiWrite = function(n, next) {
		gpio.write(_self.pins.SPIMOSI.number, cmdOut & 0x80, function() {
			cmdOut <<= 1;
			gpio.write(_self.pins.SPICLK.number, 1, function() {
				gpio.write(_self.pins.SPICLK.number, 0, function() {
					next();
				});
			});
		});
	};
	var _misoRead = function(n, next) {
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
	};
	gpio.write(_self.pins.SPICS.number, 1, function() {
		gpio.write(_self.pins.SPICLK.number, 0, function() {
			gpio.write(_self.pins.SPICS.number, 0, function() {
				cmdOut = channel | 0x18;
				cmdOut <<= 3;
				async.timesSeries(5, _mosiWrite,
					function(err) {
						if (err) throw err;
						adcOut = 0;
						async.timesSeries(12, _misoRead,
							function(err) {
								if (err) throw err;
								gpio.write(_self.pins.SPICS.number, 1, function() {
									adcOut >>= 1;
									if (typeof callback === 'function') callback(adcOut);
								});
						});
				});
			});
		});
	});
};

module.exports = ADC;