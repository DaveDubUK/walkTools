//
//  walkFilters.js
//  version 1.1
//
//  Created by David Wooldridge, June 2015
//  Copyright © 2014 - 2015 High Fidelity, Inc.
//
//  Provides a variety of filters for use by the walk.js script v1.4+
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// simple averaging (LP) filter for damping / smoothing
AveragingFilter = function(length) {
    // initialise the array of past values
    this.pastValues = [];
    for (var i = 0 ; i < length ; i++) {
        this.pastValues.push(0);
    }
    // single arg is the nextInputValue
    this.process = function() {
        if (this.pastValues.length === 0 && arguments[0]) {
            return arguments[0];
        } else if (arguments[0] !== null) {
            this.pastValues.push(arguments[0]);
            this.pastValues.shift();
            var nextOutputValue = 0;
            for (var value in this.pastValues) nextOutputValue += this.pastValues[value];
            return nextOutputValue / this.pastValues.length;
        } else {
            return 0;
        }
    };
};

// 4th order 24Hz butterworth filter
// coefficients calculated at: http://www-users.cs.york.ac.uk/~fisher/mkfilter/trad.html
// Digital filter designed by mkfilter/mkshape/gencode   A.J. Fisher
/*Butterworth24Hz = function() {
    
    this.gain = 2.310287053;

    // initialise the arrays
    this.xv = [];
    this.yv = [];
    for (var i = 0; i < 5; i++) {
        this.xv.push(0);
        this.yv.push(0);
    }

    // process values
    this.process = function(nextInputValue) {
        this.xv[0] = this.xv[1]; this.xv[1] = this.xv[2]; this.xv[2] = this.xv[3]; this.xv[3] = this.xv[4];
        this.xv[4] = nextInputValue / this.gain;
        this.yv[0] = this.yv[1]; this.yv[1] = this.yv[2]; this.yv[2] = this.yv[3]; this.yv[3] = this.yv[4];
        this.yv[4] =   (this.xv[0] + this.xv[4]) + 4 * (this.xv[1] + this.xv[3]) + 6 * this.xv[2]
                     + ( -0.1873794924 * this.yv[0]) + ( -1.0546654059 * this.yv[1])
                     + ( -2.3139884144 * this.yv[2]) + ( -2.3695130072 * this.yv[3]);
        return this.yv[4];
    }
}; // end Butterworth 24Hz filter constructor  
*/
  
// 2nd order 2Hz Butterworth LP filter
// coefficients calculated at: http://www-users.cs.york.ac.uk/~fisher/mkfilter/trad.html
// Digital filter designed by mkfilter/mkshape/gencode   A.J. Fisher
ButterworthFilter = function() {
    this.gain = 104.9784742;
    this.coeffOne = -0.7436551950;
    this.coeffTwo = 1.7055521455;

    // initialise the arrays
    this.xv = [];
    this.yv = [];
    for (var i = 0; i < 3; i++) {
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
}; // end Butterworth filter constructor

// Create a motion wave by summing pre-calculated harmonics (Fourier synthesis)
HarmonicsFilter = function(numHarmonics, magnitudes, phaseAngles) {
    this.magnitudes = magnitudes;
    this.phaseAngles = phaseAngles;
    this.numHarmonics = numHarmonics;

    this.calculate = function(twoPiFT) {
        var harmonics = 0;
        
        /*if (this.numHarmonics === 2 ) {
            harmonics = Math.cos(2 * twoPiFT - this.phaseAngles[0]);
        } else {*/
            for (var n = 1; n < this.numHarmonics; n++) {
                if (n < 3 && this.numHarmonics < 3) {
                    harmonics += Math.cos(n * twoPiFT - this.phaseAngles[n]);
                } else {
                    harmonics += this.magnitudes[n] * Math.cos(n * twoPiFT - this.phaseAngles[n]);
                }
            }
//}
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
            var convertedValue = degrees * Math.PI / HALF_CYCLE;
            return convertedValue;
        },

        radToDeg: function(radians) {
            var convertedValue = radians * HALF_CYCLE / Math.PI;
            return convertedValue;
        },

        // these filters need instantiating, as they hold arrays of previous values

        // simple averaging (LP) filter for damping / smoothing
        createAveragingFilter: function(length) {
            var newAveragingFilter = new AveragingFilter(length);
            return newAveragingFilter;
        },

        // provides LP filtering with improved frequency / phase response
        createButterworthFilter: function() {
            var newButterworthFilter = new ButterworthFilter();
            return newButterworthFilter;
        },
        //createButterworth24HzFilter: function() {
        //    var newButterworthFilter = new Butterworth24Hz();
        //    return newButterworthFilter;
        //},        


        // generates arbitrary waveforms using pre-calculated harmonics
        createHarmonicsFilter: function(numHarmonics, magnitudes, phaseAngles) {
            var newHarmonicsFilter = new HarmonicsFilter(numHarmonics, magnitudes, phaseAngles);
            return newHarmonicsFilter;
        },

        // Bezier response curve shaping for more natural transitions
        bezier: function(input, C2, C3) {
            // based on script by Dan Pupius (www.pupius.net) http://13thparallel.com/archive/bezier-curves/
            input = 1 - input;
            return _C1.y * _B1(input) + C2.y * _B2(input) + C3.y * _B3(input) + _C4.y * _B4(input);
        }
    }
})();