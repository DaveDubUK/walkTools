//
//  dd-male-walk-animation.js
//
//  Created by David Wooldridge, Autumn 2014
//
//  Procedural animation datafile - use with walk.js version 1.2+
//
//  Saved animation file containing all the settings, properties and joint details to animate a High Fidelity character
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

MaleWalk = function() {

    this.name = "MaleWalk";

    this.calibration = {

        "frequency":6,
        "strideLength":0.8525,
        "strideMaxAt":75
    };

    this.harmonics = {

        // harmonics for Fourier synthesis of selected curves
        upperLegHarmonicMagnitudes: [0.7597785122, 1, 0.128723946],
        upperLegHarmonicPhaseAngles: [0, -1.978736510128823, 0.4421915515224404],

        lowerLegHarmonicMagnitudes: [
        1, 0.3972993777, 0.1951358531, 0.0778577972, 
        0.0384768757, 0.0098245913, 0.0063735001, 0.0082641063],

        lowerLegHarmonicPhaseAngles: [
        3.141592653589793, -0.8445953085228647, 1.98985581486737, -1.1917752932493388,
        2.061766274940117, -0.9115015515304669, -2.4863137678767178, 1.0514082126383006],

        footHarmonicMagnitudes: [
        1, 0.0720838415, 0.1007502706, 0.0449677824, 0.0532875566, 0.0154532073, 0.0119265101, 0.010972356],

        footHarmonicPhaseAngles: [
        0, -0.17972447389053214, 1.151574676528302, 2.9857657685902033,
        -1.9030046100151774, 0.9304443984191301, 1.5912550432461765, -2.117264129895913]
    };

    this.filters = {

        "Hips": {
            "bobLPFilter": filter.createButterworthFilter(),
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
            "pitchPhase":-180,
            "yawPhase":0,
            "rollPhase":-141.96226,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "thrust":0.0283,
            "bob":0.01604,
            "sway":0.02038,
            "thrustPhase":-88.98113,
            "bobPhase":91.69811,
            "swayPhase":-42.79245,
            "thrustOffset":0,
            "bobOffset":0,
            "swayOffset":0,
            "pitchFrequencyMultiplier":2,
            "thrustFrequencyMultiplier":2,
            "bobFrequencyMultiplier":2
        },
        "LeftUpLeg":{
            "pitch":23.51985,
            "yaw":0.79245,
            "roll":0.66038,
            "pitchPhase":345.0566,
            "yawPhase":90.33962,
            "rollPhase":94.41509,
            "pitchOffset":-10.37736,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightUpLeg":{
            "pitch":23.51985,
            "yaw":0.79245,
            "roll":0.66038,
            "pitchPhase":165.0566,
            "yawPhase":90.33962,
            "rollPhase":94.41509,
            "pitchOffset":-10.37736,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftLeg":{
            "pitch":64.51435,
            "yaw":0,
            "roll":0,
            "pitchPhase":340.98113,
            "yawPhase":4.75472,
            "rollPhase":93.0566,
            "pitchOffset":44.15094,
            "yawOffset":-6.11321,
            "rollOffset":0
        },
        "RightLeg":{
            "pitch":64.51435,
            "yaw":0,
            "roll":0,
            "pitchPhase":160.98113,
            "yawPhase":4.75472,
            "rollPhase":93.0566,
            "pitchOffset":44.15094,
            "yawOffset":6.11321,
            "rollOffset":0
        },
        "LeftFoot":{
            "pitch":120.55284,
            "yaw":1.43396,
            "roll":3.62264,
            "pitchPhase":345.73585,
            "yawPhase":12.9,
            "rollPhase":0,
            "pitchOffset":-125.66038,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightFoot":{
            "pitch":120.55284,
            "yaw":1.43396,
            "roll":3.62264,
            "pitchPhase":165.73585,
            "yawPhase":12.9,
            "rollPhase":0,
            "pitchOffset":-125.66038,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftToeBase":{
            "pitch":15.62264,
            "yaw":2,
            "roll":0,
            "pitchPhase":285.28302,
            "yawPhase":-51.4,
            "rollPhase":-77.1,
            "pitchOffset":14,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightToeBase":{
            "pitch":15.62264,
            "yaw":2,
            "roll":0,
            "pitchPhase":105.28302,
            "yawPhase":-51.4,
            "rollPhase":-77.1,
            "pitchOffset":14,
            "yawOffset":0,
            "rollOffset":0
        },
        "Spine":{
            "pitch":3.92453,
            "yaw":0,
            "roll":3.01887,
            "pitchPhase":-14.26415,
            "yawPhase":-178.64151,
            "rollPhase":0,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "Spine1":{
            "pitch":0,
            "yaw":7.84906,
            "roll":2.11321,
            "pitchPhase":-26.49057,
            "yawPhase":180,
            "rollPhase":0.67925,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "Spine2":{
            "pitch":1.0566,
            "yaw":1.96226,
            "roll":0.07547,
            "pitchPhase":-22.41509,
            "yawPhase":-180,
            "rollPhase":-31.92453,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "LeftShoulder":{
            "pitch":1.2,
            "yaw":1.96226,
            "roll":2.455,
            "pitchPhase":-135,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":6.11321,
            "yawOffset":26.49057,
            "rollOffset":-12
        },
        "RightShoulder":{
            "pitch":1.2,
            "yaw":1.96226,
            "roll":2.455,
            "pitchPhase":-135,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":6.11321,
            "yawOffset":-26.49057,
            "rollOffset":12
        },
        "LeftArm":{
            "pitch":1.35849,
            "yaw":18,
            "roll":0,
            "pitchPhase":-90,
            "yawPhase":180,
            "rollPhase":48.22642,
            "pitchOffset":64.5283,
            "yawOffset":-14.26415,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "RightArm":{
            "pitch":1.35849,
            "yaw":18,
            "roll":0,
            "pitchPhase":-90,
            "yawPhase":180,
            "rollPhase":48.22642,
            "pitchOffset":64.5283,
            "yawOffset":14.26415,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "LeftForeArm":{
            "pitch":2.37736,
            "yaw":0,
            "roll":15.84906,
            "pitchPhase":-20,
            "yawPhase":-19.69811,
            "rollPhase":-29.20755,
            "pitchOffset":4.75472,
            "yawOffset":0,
            "rollOffset":22.41509
        },
        "RightForeArm":{
            "pitch":2.37736,
            "yaw":0,
            "roll":15.84906,
            "pitchPhase":-20,
            "yawPhase":-19.69811,
            "rollPhase":-29.20755,
            "pitchOffset":4.75472,
            "yawOffset":0,
            "rollOffset":-22.41509
        },
        "LeftHand":{
            "pitch":0,
            "yaw":0,
            "roll":10.18868,
            "pitchPhase":38.6,
            "yawPhase":0.67925,
            "rollPhase":-132.45283,
            "pitchOffset":-4.75472,
            "yawOffset":-10.18868,
            "rollOffset":2.03774
        },
        "RightHand":{
            "pitch":0,
            "yaw":0,
            "roll":10.18868,
            "pitchPhase":38.6,
            "yawPhase":0.67925,
            "rollPhase":-132.45283,
            "pitchOffset":-4.75472,
            "yawOffset":10.18868,
            "rollOffset":-2.03774
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