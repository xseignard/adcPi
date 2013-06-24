var gpio = require('pi-gpio'),
	sinon = require('sinon');

var GpioStub = function() {
	return {
		pins : {},
		open : function() {
			var self = this;
			var stub = sinon.stub(gpio, 'open', function(pinNumber, direction, callback) {
				self.pins[pinNumber] = {direction: direction, value:0, state:'open'};
				callback();
			});
			return stub;
		},
		write : function() {
			var self = this;
			var stub = sinon.stub(gpio, 'write', function(pinNumber, value, callback) {
				if (self.pins[pinNumber] && self.pins[pinNumber].state === 'open') {
					self.pins[pinNumber].value = value;
					callback();
				}
				else {
					throw new Error('Pin ' + pinNumber + ' is not opened!');
				}
			});
			return stub;
		},
		read : function() {
			var self = this;
			var stub = sinon.stub(gpio, 'read', function(pinNumber, callback) {
				if (self.pins[pinNumber] && self.pins[pinNumber].state === 'open') {
					callback({}, self.pins[pinNumber].value);
				}
				else {
					throw new Error('Pin ' + pinNumber + ' is not opened!');
				}
			});
			return stub;		
		},
		close : function() {
			var self = this;
			var stub = sinon.stub(gpio, 'close', function(pinNumber, callback) {
				if (self.pins[pinNumber] && self.pins[pinNumber].state === 'open') {
					self.pins[pinNumber].state = 'closed';
					callback();
				}
				else {
					throw new Error('Pin ' + pinNumber + ' is not opened!');
				}
			});
			return stub;		
		}
	};
};

module.exports = GpioStub;
	