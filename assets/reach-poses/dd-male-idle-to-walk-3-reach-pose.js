//
//  dd-male-idle-to-walk-3-reach-pose.js
//
//  Created by David Wooldridge, Autumn 2014
//
//  Procedural animation datafile - use with walk.js version 1.2
//
//  Saved animation file containing all the settings, properties and joint details to animate a High Fidelity character
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

MaleIdleToWalk3RP = function() {

    this.name = "MaleIdleToWalk3RP";

    this.calibration = {

        "frequency":6,
        "strideLengthForwards":1.22152,
        "forwardStrideMaxAt":74,
        "startAngleForwards":0,//17.3,
        "stopAngleForwards":0,
        "strideLengthBackwards":1.0094,
        "backwardsStrideMaxAt":263.5,
        "startAngleBackwards":0,
        "stopAngleBackwards":0,
        "footDownLeft":0,
        "footDownRight":180
    };


    this.harmonics = {

        // harmonics for Fourier synthesis of selected curves
        upperLegHarmonicMagnitudes: [1, 1.316173, 0.169423],
        upperLegHarmonicPhaseAngles: [0, -1.978736510128823, 0.4421915515224404],

        lowerLegHarmonicMagnitudes:
        [1, 0.3972993777,  0.1951358531,  0.0778577972,  0.0384768757,  0.0098245913,  0.0063735001,  0.0082641063],

        lowerLegHarmonicPhaseAngles: [
        3.141592653589793, -0.8445953085228647, 1.98985581486737, -1.1917752932493388,
        2.061766274940117, -0.9115015515304669, -2.4863137678767178, 1.0514082126383006],

        footHarmonicMagnitudes:
        [1, 0.0720838415, 0.1007502706, 0.0449677824, 0.0532875566, 0.0154532073, 0.0119265101, 0.010972356],

        footHarmonicPhaseAngles: [
        0, -0.17972447389053214, 1.151574676528302, 2.9857657685902033,
        -1.9030046100151774, 0.9304443984191301, 1.5912550432461765, -2.117264129895913]
    };

    this.filters = {

        "Hips": {

            "bobLPFilter": filter.createButterworthFilter2(5),
            "yawFilter": filter.createWaveSynth(2, 3, 2)
        },
        "LeftUpLeg": {

            "pitchFilter": filter.createHarmonicsFilter(
                               this.harmonics.upperLegHarmonicMagnitudes,
                               this.harmonics.upperLegHarmonicPhaseAngles)
        },
        "RightUpLeg": {

            "pitchFilter": filter.createHarmonicsFilter(
                               this.harmonics.upperLegHarmonicMagnitudes,
                               this.harmonics.upperLegHarmonicPhaseAngles)
        },
        "LeftLeg": {

            "pitchFilter": filter.createHarmonicsFilter(
                               this.harmonics.lowerLegHarmonicMagnitudes,
                               this.harmonics.lowerLegHarmonicPhaseAngles)
        },
        "RightLeg": {

            "pitchFilter": filter.createHarmonicsFilter(
                               this.harmonics.lowerLegHarmonicMagnitudes,
                               this.harmonics.lowerLegHarmonicPhaseAngles)
        },
        "LeftFoot": {

            "pitchFilter": filter.createHarmonicsFilter(
                               this.harmonics.footHarmonicMagnitudes,
                               this.harmonics.footHarmonicPhaseAngles)
        },
        "RightFoot": {

            "pitchFilter": filter.createHarmonicsFilter(
                               this.harmonics.footHarmonicMagnitudes,
                               this.harmonics.footHarmonicPhaseAngles)
        }
    };

    this.joints = {

        "Hips":{
            "pitch":3.39623,
            "yaw":4.68679,
            "roll":2.44528,
            "pitchPhase":-146.64537,
            "yawPhase":16.67732,
            "rollPhase":-125.28494,
            "pitchOffset":-3.73585,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2,
            "thrust":0.0283,
            "bob":0.01604,
            "sway":0.02038,
            "thrustPhase":-72.30381,
            "bobPhase":125.05274,
            "swayPhase":-9.43782,
            "thrustOffset":0,
            "bobOffset":0,
            "swayOffset":0,
            "thrustFrequencyMultiplier":2,
            "bobFrequencyMultiplier":2
        },
        "LeftUpLeg":{
            "pitch":19.245,
            "yaw":0.79245,
            "roll":0.66038,
            "pitchPhase":1.67732,
            "yawPhase":107.01694,
            "rollPhase":111.09241,
            "pitchOffset":-15.77358,
            "yawOffset":0.07547,
            "rollOffset":0.22642
        },
        "RightUpLeg":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftLeg":{
            "pitch":63.509,
            "yaw":0,
            "roll":0,
            "pitchPhase":-2.34155,
            "yawPhase":21.43204,
            "rollPhase":109.73392,
            "pitchOffset":44.15094,
            "yawOffset":-6.11321,
            "rollOffset":0.07547
        },
        "RightLeg":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftFoot":{
            "pitch":120.5528,
            "yaw":1.43396,
            "roll":3.62264,
            "pitchPhase":2.41317,
            "yawPhase":29.57732,
            "rollPhase":16.67732,
            "pitchOffset":-129.73585,
            "yawOffset":6.22642,
            "rollOffset":-0.9434
        },
        "RightFoot":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftToeBase":{
            "pitch":15.62264,
            "yaw":0,
            "roll":0,
            "pitchPhase":-40.07547,
            "yawPhase":145.27732,
            "rollPhase":-60.42268,
            "pitchOffset":15.96226,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightToeBase":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "Spine":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "Spine1":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "Spine2":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftShoulder":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightShoulder":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftArm":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "RightArm":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "LeftForeArm":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightForeArm":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftHand":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightHand":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "Neck":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        },
        "Head":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0
        }
    }
}