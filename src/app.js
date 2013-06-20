var gpio = require('pi-gpio'),
	async = require('async'),
	SPICLK  = 12,
	SPIMISO = 16,
	SPIMOSI = 18,
	SPICS   = 22,
	pinsConf = [
		{pin: SPICLK, direction: 'out'},
		{pin: SPIMISO, direction: 'in'},
		{pin: SPIMOSI, direction: 'out'},
		{pin: SPICS, direction: 'out'}
	],
	pins;


var setup = function(callback) {
	var _initGpio = function(pinConf, done) {
		gpio.open(pinConf.pin, pinConf.direction, function(err) {
			done();
		});
	};
	// start reading spi data when all pins are ready
	async.each(pinsConf, _initGpio, function(err) {
		if (err) throw err;
		if(typeof callback === 'function') callback();
	});
};

var readAdc = function(channel, callback) {
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
								gpio.write(SPICS, 1, function() {
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

var unexport = function () {
	async.each(
		pinsConf,
		function(pinConf, done) {
			gpio.close(pinConf.pin, function() {
				done();
			});
		},
		function(err) {
			console.log('terminated');
			process.exit();
		}
	);
};

process.on('SIGTERM', unexport);
process.on('SIGINT', unexport);

setup(function() {
	setInterval(function() {
		readAdc(0, function(value) {
			console.log('v: ' + value);
		});
	}, 300);
});