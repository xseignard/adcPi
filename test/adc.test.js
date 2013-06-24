'use strict';
var chai = require('chai'),
	expect = chai.expect,
	GpioStub = require('./gpio.stub'),
	ADC = require('../adc-pi-gpio'),
	gpioStub, openStub, writeStub, readStub, closeStub,
	adc;

describe('ADC', function() {

	beforeEach(function(){
		gpioStub = new GpioStub();
		// get the stubbed gpio
		openStub = gpioStub.open();
		writeStub = gpioStub.write();
		readStub = gpioStub.read();
		closeStub = gpioStub.close();
	});

	afterEach(function(){
		// un-stub gpios
		openStub.restore();
		writeStub.restore();
		readStub.restore();
		closeStub.restore();
	});

	describe('#init()', function() {
		it('pins should be opened', function(done) {
			adc = new ADC();
			adc.on('ready', function() {
				expect(gpioStub.pins[12].state).to.equal('open');
				expect(gpioStub.pins[16].state).to.equal('open');
				expect(gpioStub.pins[18].state).to.equal('open');
				expect(gpioStub.pins[22].state).to.equal('open');
				done();
			});
			adc.init();
		});
		it('pins should be configured with the right direction', function(done) {
			adc = new ADC();
			adc.on('ready', function() {
				expect(gpioStub.pins[12].direction).to.equal('out');
				expect(gpioStub.pins[16].direction).to.equal('in');
				expect(gpioStub.pins[18].direction).to.equal('out');
				expect(gpioStub.pins[22].direction).to.equal('out');
				done();
			});
			adc.init();
		});
		it('pins should be configured according to the given opts', function(done) {
			var opts = {
				SPICLK : 5,
				SPIMISO : 6,
				SPIMOSI : 7,
				SPICS : 8
			};
			adc = new ADC(opts);
			adc.on('ready', function() {
				expect(gpioStub.pins[5].state).to.equal('open');
				expect(gpioStub.pins[6].state).to.equal('open');
				expect(gpioStub.pins[7].state).to.equal('open');
				expect(gpioStub.pins[8].state).to.equal('open');
				expect(gpioStub.pins[5].direction).to.equal('out');
				expect(gpioStub.pins[6].direction).to.equal('in');
				expect(gpioStub.pins[7].direction).to.equal('out');
				expect(gpioStub.pins[8].direction).to.equal('out');
				done();
			});
			adc.init();
		});

	});

	describe('#read()', function() {
		it('value should be 0 when miso pin is 0 all way long', function(done) {
			adc = new ADC();
			adc.on('ready', function() {
				gpioStub.pins[16].value = 0;
				adc.read(0, function(value) {
					expect(value).to.equal(0);
					done();
				});
			});
			adc.init();
		});
		it('value should be 2047 when miso pin is 1 all way long', function(done) {
			adc = new ADC();
			adc.on('ready', function() {
				gpioStub.pins[16].value = 1;
				adc.read(0, function(value) {
					expect(value).to.equal(2047);
					done();
				});
			});
			adc.init();
		});
	});

	describe('#close()', function() {
		it('pins should be closed', function(done) {
			adc = new ADC();
			adc.on('close', function() {
				expect(gpioStub.pins[12].state).to.equal('closed');
				expect(gpioStub.pins[16].state).to.equal('closed');
				expect(gpioStub.pins[18].state).to.equal('closed');
				expect(gpioStub.pins[22].state).to.equal('closed');
				done();
			});
			adc.on('ready', function() {
				adc.close();
			});
			adc.init();

		});
	});

});