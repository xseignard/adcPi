

<!-- Start adc-pi-gpio.js -->

## gpio

# adcPi

[Bit banging](http://en.wikipedia.org/wiki/Bit_banging) communication between ADC and the Raspberry Pi.

Largely inspired by ladyada's script: [https://gist.github.com/ladyada/3151375](https://gist.github.com/ladyada/3151375).

Install `gpio-admin` :
```shell
git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
cd quick2wire-gpio-admin
make
sudo make install
sudo adduser $USER gpio
```

## Usage
See [https://github.com/xseignard/adcPi/blob/master/demo/app.js](https://github.com/xseignard/adcPi/blob/master/demo/app.js)

## ADC(opts)

ADC class, that represents an instance of an ADC.

### Params: 

* **Object** *opts* - a configuration object, see the below example

## init(callback)

Init the pins that are used by the ADC.

### Params: 

* **function()** *callback* - to be called when init is ok

## read(channel, callback)

Read the value of the given ADC channel.

### Params: 

* **Number** *channel* - the channel number

* **function()** *callback* - first arg of the callback is the read value

## close(callback)

Close the pins used by the ADC.

### Params: 

* **function()** *callback* - to be called when close is ok

<!-- End adc-pi-gpio.js -->

