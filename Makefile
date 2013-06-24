MOCHA="node_modules/.bin/mocha"
_MOCHA="node_modules/.bin/_mocha"
JSHINT="node_modules/.bin/jshint"
ISTANBUL="node_modules/.bin/istanbul"
MARKDOX="node_modules/markdox/bin/markdox"

TESTS=$(shell find test/ -name "*.test.js")

clean:
	rm -rf reports

test:
	$(MOCHA) -R spec $(TESTS)
	
jshint:
	$(JSHINT) adc-pi-gpio.js test

coverage:
	@# check if reports folder exists, if not create it
	@test -d reports || mkdir reports
	$(ISTANBUL) cover --dir ./reports $(_MOCHA) -- -R spec $(TESTS)

docs:
	$(MARKDOX) adc-pi-gpio.js
	mv output.md README.md

.PHONY: clean test jshint coverage docs
