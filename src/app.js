var gpio = require('gpio'),
	async = require('async'),
	SPICLK  = 18,
	SPIMISO = 23,
	SPIMOSI = 24,
	SPICS   = 25,
	pins, clockPin, misoPin, mosiPin, csPin;


var setup = function(callback, opts) {
	// direction of each pin
	var pinsConf = [
		{pin: SPICLK, direction: 'out'},
		{pin: SPIMISO, direction: 'in'},
		{pin: SPIMOSI, direction: 'out'},
		{pin: SPICS, direction: 'out'}
	];
	// handle refs to the gpio instances
	pins = {};

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
		if(typeof callback === 'function') callback();
	});
};

var readAdc = function(channel, callback) {
	pins[SPICS].set(1, function() {
		pins[SPICLK].set(0, function() {
			console.log('test');
			pins[SPICS].set(0, function() {
				var cmdOut = channel | 0x18;
				cmdOut <<= 3;
				async.times(
					// do this 5 times
					5,
					// each time apply this function
					function(n, next) {
						console.log('test');
						pins[SPIMOSI].set(cmdOut & 0x80, function() {
							cmdOut <<= 1;
							pins[SPICLK].set(1, function() {
								pins[SPICLK].set(0, function() {
									next();
								});
							});
						});
					},
					// when done
					function(err, stuff) {
						var adcOut = 0;
						async.times(
							// do this 12 times
							12,
							// each time apply this function
							function(n, next) {
								pins[SPICLK].set(1, function() {
									pins[SPICLK].set(0, function() {
										adcOut <<= 1;
										pins[SPIMISO]._get(function(value) {
											if (value) {
												adcOut |= 0x1;
											}
											next();
										});
									});
								});
							},
							// when done
							function(err) {
								pins[SPICS].set(1, function() {
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

setup(function() {
	setInterval(function() {
		readAdc(0, function(value) {
			console.log(value);
		});
	}, 50);
});