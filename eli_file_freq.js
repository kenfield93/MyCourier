var fs = require('fs');
var readStream = fs.createReadStream('test.txt');
var StringDecoder = require('string_decoder').StringDecoder;

var letterFrequency = {};
var decoder = new StringDecoder('utf8');
var map = Array.prototype.map
readStream.on('data', function(chunk){
   var text = decoder.write(chunk);
   console.log(typeof text);
   map.call(text, function(letter){ 
	if( letterFrequency[letter] == undefined)
		letterFrequency[letter] = 0;
	letterFrequency[letter]++;
   });
});

readStream.on('end', function(x){
    console.log('letter freqency is ');
    console.log(letterFrequency);
});

