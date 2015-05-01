//
//  walkFilters.js
//
//  version 1.002
//
//  Created by David Wooldridge, Autumn 2014
//
//  Provides a variety of filters for use by the walk.js script v1.2
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

AveragingFilter = function(length) {

    //this.name = name;
    this.pastValues = [];

    for(var i = 0; i < length; i++) {

        this.pastValues.push(0);
    }

    // single arg is the nextInputValue
    this.process = function() {

        if (this.pastValues.length === 0 && arguments[0]) {

            return arguments[0];

        } else if (arguments[0] !== null) {

            // apply quick and simple LP filtering
            this.pastValues.push(arguments[0]);
            this.pastValues.shift();
            var nextOutputValue = 0;
            for (var ea in this.pastValues) nextOutputValue += this.pastValues[ea];
            return nextOutputValue / this.pastValues.length;

        } else {

            return 0;
        }
    };
};

// 1st order Butterworth filter - calculate coeffs here: http://www-users.cs.york.ac.uk/~fisher/mkfilter/trad.html
// provides LP filtering with a more stable frequency / phase response (-3 dB @ 3 Hz)
ButterworthFilter1 = function() {

    this.gain = 7.313751515;
    this.coeff = 0.7265425280;

    // initialise the arrays
    this.xv = [];
    this.yv = [];
    for(var i = 0; i < 2; i++) {
        this.xv.push(0);
        this.yv.push(0);
    }

    // process values
    this.process = function(nextInputValue) {

        this.xv[0] = this.xv[1];
        this.xv[1] = nextInputValue / this.gain;

        this.yv[0] = this.yv[1];
        this.yv[1] = this.xv[0] + this.xv[1] + this.coeff * this.yv[0];

        return this.yv[1];
    };
}; // end Butterworth filter contructor

// 2nd order Butterworth LP filter - calculate coeffs here: http://www-users.cs.york.ac.uk/~fisher/mkfilter/trad.html
// provides LP filtering with a more stable frequency / phase response
ButterworthFilter2 = function(cutOff) {

    switch(cutOff) {
/**/
        case 2:

            this.gain = 104.9784742;
            this.coeffOne = -0.7436551950;
            this.coeffTwo = 1.7055521455;
            break;

        case 3:

            this.gain = 49.79245121;
            this.coeffOne = -0.6413515381;
            this.coeffTwo = 1.5610180758;
            break;

        case 5:

            this.gain = 20.20612010;
            this.coeffOne = -0.4775922501;
            this.coeffTwo = 1.2796324250;
            break;

        case 10:

            this.gain = 6.449489743;
            this.coeffOne = -0.2404082058;
            this.coeffTwo = 0.6202041029;
            break;
/**/
        case 20:

            this.gain = 2.149829914;
            this.coeffOne = -0.2404082058;
            this.coeffTwo = 0.6202041029;
            break;

        case 30:

            this.gain = 1.000000074;
            this.coeffOne = -0.9999998519;
            this.coeffTwo = -1.9999998519;
            break;

    }

    // initialise the arrays
    this.xv = [];
    this.yv = [];
    for(var i = 0; i < 3; i++) {
        this.xv.push(0);
        this.yv.push(0);
    }

    // process values
    this.process = function(nextInputValue) {

        this.xv[0] = this.xv[1];
        this.xv[1] = this.xv[2];
        this.xv[2] = nextInputValue / this.gain;

        this.yv[0] = this.yv[1];
        this.yv[1] = this.yv[2];
        this.yv[2] = (this.xv[0] + this.xv[2]) +
                      2 * this.xv[1] +
                     (this.coeffOne * this.yv[0]) +
                     (this.coeffTwo * this.yv[1]);

        return this.yv[2];
    };
}; // end Butterworth filter contructor

// 2nd order Butterworth LP filter - calculate coeffs here: http://www-users.cs.york.ac.uk/~fisher/mkfilter/trad.html
// provides LP filtering with a more stable frequency / phase response
ButterworthFilter8 = function(cutOff) {

    switch(cutOff) {

        case 3:

            this.gain = 5673585.908;
            this.coeffOne = -0.6413515381;
            this.coeffTwo = 1.5610180758;
            this.coeffs = [-0.1981000116, 1.9036688911, -8.0409959330, 19.5056317680,
                           -29.7313754380, 29.1710993750, -18.0003383360, 6.3903645631];
            break;
    }

    // initialise the arrays
    this.xv = [];
    this.yv = [];
    for(var i = 0; i < 9; i++) {

        this.xv.push(0);
        this.yv.push(0);
    }

    // process values
    this.process = function(nextInputValue) {

        this.xv[0] = this.xv[1]; this.xv[1] = this.xv[2]; this.xv[2] = this.xv[3]; this.xv[3] = this.xv[4];
        this.xv[4] = this.xv[5]; this.xv[5] = this.xv[6]; this.xv[6] = this.xv[7]; this.xv[7] = this.xv[8];
        this.xv[8] = nextInputValue / this.gain;
        this.yv[0] = this.yv[1]; this.yv[1] = this.yv[2]; this.yv[2] = this.yv[3]; this.yv[3] = this.yv[4];
        this.yv[4] = this.yv[5]; this.yv[5] = this.yv[6]; this.yv[6] = this.yv[7]; this.yv[7] = this.yv[8];
        this.yv[8] = (this.xv[0] + this.xv[8]) + 8 * (this.xv[1] + this.xv[7]) + 28 * (this.xv[2] + this.xv[6])
                     + 56 * (this.xv[3] + this.xv[5]) + 70 * this.xv[4]
                     + ( this.coeffs[0] * this.yv[0]) + (  this.coeffs[1] * this.yv[1])
                     + ( this.coeffs[2] * this.yv[2]) + ( this.coeffs[3]* this.yv[3])
                     + ( this.coeffs[4] * this.yv[4]) + ( this.coeffs[5] * this.yv[5])
                     + ( this.coeffs[6] * this.yv[6]) + ( this.coeffs[7] * this.yv[7]);

        return this.yv[8];
    };
}; // end Butterworth filter contructor

// Add harmonics to a given sine wave to form square, sawtooth or triangle waves
// Geometric wave synthesis fundamentals taken from: http://hyperphysics.phy-astr.gsu.edu/hbase/audio/geowv.html
WaveSynth = function(waveShape, numHarmonics, smoothing) {

    this.numHarmonics = numHarmonics;
    this.waveShape = waveShape;
    this.smoothingFilter = new AveragingFilter(smoothing);

    // NB: frequency in radians
    this.calculate = function(frequency) {

        // make some shapes
        var harmonics = 0;
        var multiplier = 0;
        var iterations = this.numHarmonics * 2 + 2;
        if (this.waveShape === TRIANGLE) {
            iterations++;
        }

        for(var n = 1; n < iterations; n++) {

            switch(this.waveShape) {

                case SAWTOOTH: {

                    multiplier = 1 / n;
                    harmonics += multiplier * Math.sin(n * frequency);
                    break;
                }

                case TRIANGLE: {

                    if (n % 2 === 1) {
                        var mulitplier = 1 / (n * n);
                        // multiply (4n-1)th harmonics by -1
                        if (n === 3 || n === 7 || n === 11 || n === 15) {
                            mulitplier *= -1;
                        }
                        harmonics += mulitplier * Math.sin(n * frequency);
                    }
                    break;
                }

                case SQUARE: {

                    if (n % 2 === 1) {
                        multiplier = 1 / n;
                        harmonics += multiplier * Math.sin(n * frequency);
                    }
                    break;
                }
            }
        }

        // smooth the result and return
        return this.smoothingFilter.process(harmonics);
    };
};

// Create a motion wave by summing pre-calcualted sinusoidal harmonics
HarmonicsFilter = function(magnitudes, phaseAngles) {

    this.magnitudes = magnitudes;
    this.phaseAngles = phaseAngles;

    this.calculate = function(twoPiFT) {

        var harmonics = 0;
        var numHarmonics = magnitudes.length;

        for(var n = 0; n < numHarmonics; n++) {
            harmonics += this.magnitudes[n] * Math.cos(n * twoPiFT - this.phaseAngles[n]);
        }
        return harmonics;
    };
};

// the main filter object literal
filter = (function() {

    // Bezier private variables
    var _C1 = {x:0, y:0};
    var _C4 = {x:1, y:1};

    // Bezier private functions
    function _B1(t) { return t * t * t };
    function _B2(t) { return 3 * t * t * (1 - t) };
    function _B3(t) { return 3 * t * (1 - t) * (1 - t) };
    function _B4(t) { return (1 - t) * (1 - t) * (1 - t) };

    return {

        // helper methods
        degToRad: function(degrees) {

            var convertedValue = degrees * Math.PI / 180;
            return convertedValue;
        },

        radToDeg: function(radians) {

            var convertedValue = radians * 180 / Math.PI;
            return convertedValue;
        },

        // these filters need instantiating, as they hold arrays of previous values
        createAveragingFilter: function(length) {

            var newAveragingFilter = new AveragingFilter(length);
            return newAveragingFilter;
        },

        createButterworthFilter1: function() {

            var newButterworthFilter = new ButterworthFilter1();
            return newButterworthFilter;
        },

        createButterworthFilter2: function(cutoff) {

            var newButterworthFilter = new ButterworthFilter2(cutoff);
            return newButterworthFilter;
        },

        createButterworthFilter8: function(cutoff) {

            var newButterworthFilter = new ButterworthFilter8(cutoff);
            return newButterworthFilter;
        },

        createWaveSynth: function(waveShape, numHarmonics, smoothing) {

            var newWaveSynth = new WaveSynth(waveShape, numHarmonics, smoothing);
            return newWaveSynth;
        },

        createHarmonicsFilter: function(magnitudes, phaseAngles) {

            var newHarmonicsFilter = new HarmonicsFilter(magnitudes, phaseAngles);
            return newHarmonicsFilter;
        },


        // the following filters do not need separate instances, as they hold no previous values
        bezier: function(input, C2, C3) {

            // Bezier functions for more natural transitions
            // based on script by Dan Pupius (www.pupius.net) http://13thparallel.com/archive/bezier-curves/
            input = 1 - input;
            return _C1.y * _B1(input) + C2.y * _B2(input) + C3.y * _B3(input) + _C4.y * _B4(input);
        },

        // simple clipping filter (clips bottom of wave only, special case for hips y-axis skeleton offset)
        clipTrough: function(inputValue, peak, strength) {

            var outputValue = inputValue * strength;
            if (outputValue < -peak) {
                outputValue = -peak;
            }
            return outputValue;
        }
    }

})();