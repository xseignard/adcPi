var gpio = require('pi-gpio'),
	async = require('async'),
	util   = require('util'),
	EventEmitter = require('events').EventEmitter,
	adcrpiChangeEventName = 'change'; // name of event triggered on new value

var Adcrpi = function() {
	EventEmitter.call(this);
}
util.inherits(Adcrpi, EventEmitter);

Adcrpi.prototype.unexport = function (pins) {
	async.each(
		pins,
		function(pin, done) {
			gpio.close(pin.number, function() {
				done();
			});
		},
		function(err) {
			console.log('Adcrpi terminated');
			process.exit();
		}
	);
};

Adcrpi.prototype.init = function(config, callback) {
	var	_self = this,
	currentValue = -1 - config.tolerance;

	process.on('SIGTERM', function(){ _self.unexport(config.pins) });
	process.on('SIGINT', function(){ _self.unexport(config.pins) });

	var _initGpio = function(pinConf, done) {
		gpio.open(pinConf.pin, pinConf.direction, function(err) {
			done();
		});
	};
	var _initChannel = function(channel, done) {
		setInterval(function() {
			_self.readAdc(config.pins, channel, function(value) {
				if (Math.abs(currentValue - value) < config.tolerance) {
					var data = {
						channel: channel,
						value: value
					}
					_self.emit(adcrpiChangeEventName, data);
					currentValue = value;
				}
			});
		}, config.interval);
	}

	// start reading spi data when all pins are ready
	async.each(config.pins, _initGpio, function(err) {
		if (err) throw err;
		async.each(config.channels, _initChannel, function(err){
			if (err) throw err;
		})
	});
};

Adcrpi.prototype.readAdc = function(pins, channel, callback) {
	gpio.write(pins['SPICS'].number, 1, function() {
		gpio.write(pins['SPICLK'].number, 0, function() {
			gpio.write(pins['SPICS'].number, 0, function() {
				var cmdOut = channel;
				cmdOut |= 0x18;
				cmdOut <<= 3;
				async.timesSeries(
					// do this 5 times
					5,
					// each time apply this function
					function(n, next) {
						gpio.write(pins['SPIMOSI'].number, cmdOut & 0x80, function() {
							cmdOut <<= 1;
							gpio.write(pins['SPICLK'].number, 1, function() {
								gpio.write(pins['SPICLK'].number, 0, function() {
									next();
								});
							});
						});
					},
					// when done
					function(err, stuff) {
						var adcOut = 0;
						async.timesSeries(
							// do this 12 times
							12,
							// each time apply this function
							function(n, next) {
								gpio.write(pins['SPICLK'].number, 1, function() {
									gpio.write(pins['SPICLK'].number, 0, function() {
										adcOut <<= 1;
										gpio.read(pins['SPIMISO'].number, function(err, value) {
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
								gpio.write(pins['SPICS'].number, 1, function() {
									adcOut >>= 1;
									callback(adcOut);
								});
							}
						);
					}
				);
			});
		});
	});
};

module.exports = new Adcrpi;