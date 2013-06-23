

<!-- Start src/adc.js -->

## ADC(opts)

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

### Params: 

* **Array** *opts* - an array of objects describing of the pins to use (e.g. {pin: 9, direction: 'out'})

## _init(callback)

Init the pins that are used by the ADC.

### Params: 

* **function()** *callback* - to be called when init is ok

## _read(channel, callback)

Read the value of the given ADC channel.

### Params: 

* **Number** *channel* - the channel number

* **function()** *callback* - first arg of the callback is the read value

## _close(callback)

Close the pins used by the ADC.

### Params: 

* **function()** *callback* - to be called when close is ok

<!-- End src/adc.js -->

