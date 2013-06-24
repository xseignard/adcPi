'use strict';
var chai = require('chai'),
	expect = chai.expect,
	gpioStub = require('./gpio.stub'),
	ADC = require('../adc-pi-gpio'),
	openStub, writeStub, readStub, closeStub,
	adc;

describe('ADC', function() {

	beforeEach(function(){
		// get the stubbed gpio
		openStub = gpioStub.open();
		writeStub = gpioStub.write();
		readStub = gpioStub.read();
		closeStub = gpioStub.close();
	});

	afterEach(function(){
		// clear pins
		gpioStub.pins = {};
		// un-stub gpios
		openStub.restore();
		writeStub.restore();
		readStub.restore();
		closeStub.restore();
	});

	describe('#init()', function() {
		it('pins should be opened', function() {
			adc = new ADC();
			adc.init(function() {
				expect(gpioStub.pins[12].state).to.equal('open');
				expect(gpioStub.pins[16].state).to.equal('open');
				expect(gpioStub.pins[18].state).to.equal('open');
				expect(gpioStub.pins[22].state).to.equal('open');
			});
		});
		it('pins should be configured with the right direction', function() {
			adc = new ADC();
			adc.init(function() {
				expect(gpioStub.pins[12].direction).to.equal('out');
				expect(gpioStub.pins[16].direction).to.equal('in');
				expect(gpioStub.pins[18].direction).to.equal('out');
				expect(gpioStub.pins[22].direction).to.equal('out');
			});
		});
		it('pins should be configured according to the given opts', function() {
			var opts = {
				pins: {
					SPICLK : {number: 5, direction: 'out'},
					SPIMISO : {number: 6, direction: 'in'},
					SPIMOSI : {number: 7, direction: 'out'},
					SPICS : {number: 8, direction: 'out'}
				}
			};
			adc = new ADC(opts);
			adc.init(function() {
				expect(gpioStub.pins[5].state).to.equal('open');
				expect(gpioStub.pins[6].state).to.equal('open');
				expect(gpioStub.pins[7].state).to.equal('open');
				expect(gpioStub.pins[8].state).to.equal('open');
				expect(gpioStub.pins[5].direction).to.equal('out');
				expect(gpioStub.pins[6].direction).to.equal('in');
				expect(gpioStub.pins[7].direction).to.equal('out');
				expect(gpioStub.pins[8].direction).to.equal('out');
			});
		});

	});

	describe('#read()', function() {
		it('value should be 0 when miso pin is 0 all way long', function() {
			adc = new ADC();
			adc.init(function() {
				gpioStub.pins[16].value = 0;
				adc.read(0, function(value) {
					expect(value).to.equal(0);
				});
			});
		});
		it('value should be 2047 when miso pin is 1 all way long', function() {
			adc = new ADC();
			adc.init(function() {
				gpioStub.pins[16].value = 1;
				adc.read(0, function(value) {
					expect(value).to.equal(2047);
				});
			});
		});
	});

	describe('#close()', function() {
		it('pins should be closed', function() {
			adc = new ADC();
			adc.init(function() {
				expect(gpioStub.pins[12].state).to.equal('open');
				expect(gpioStub.pins[16].state).to.equal('open');
				expect(gpioStub.pins[18].state).to.equal('open');
				expect(gpioStub.pins[22].state).to.equal('open');
				adc.close(function() {
					expect(gpioStub.pins[12].state).to.equal('closed');
					expect(gpioStub.pins[16].state).to.equal('closed');
					expect(gpioStub.pins[18].state).to.equal('closed');
					expect(gpioStub.pins[22].state).to.equal('closed');
				});
			});
		});
	});

});