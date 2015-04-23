//
//  dd-male-sidestep-right-animation.js
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

MaleSideStepRight = function() {

    this.name = "MaleSideStepRight";

    this.calibration = {

        "frequency":350,
        "strideLength":0.81107,
        "strideMaxAt":356.5,
        "startAngle":255,
        "stopAngle":179.4, // must be less than 180 degrees
        "footDownLeft":231.8,
        "footDownRight":51.8
    };

    this.filters = {};

    this.joints = {

        "Hips":{
            "pitch":0,
            "yaw":0,
            "roll":5.29811,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0.67925,
            "pitchOffset":2.16981,
            "yawOffset":0,
            "rollOffset":0.28302,
            "thrust":0,
            "bob":0.01151,
            "sway":0.35,
            "thrustPhase":180,
            "bobPhase":-80.83019,
            "swayPhase":180,
            "thrustOffset":0,
            "bobOffset":0,
            "swayOffset":0
        },
        "LeftUpLeg":{
            "pitch":12.56604,
            "yaw":0,
            "roll":-9.50943,
            "pitchPhase":0.67925,
            "yawPhase":0,
            "rollPhase":-86.26415,
            "pitchOffset":14.26415,
            "yawOffset":0,
            "rollOffset":7.01887
        },
        "RightUpLeg":{
            "pitch":-12.56604,
            "yaw":0,
            "roll":9.50943,
            "pitchPhase":0.67925,
            "yawPhase":0,
            "rollPhase":-86.26415,
            "pitchOffset":14.26415,
            "yawOffset":0,
            "rollOffset":-7.01887
        },
        "LeftLeg":{
            "pitch":28.86792,
            "yaw":0,
            "roll":0,
            "pitchPhase":-180,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":-30.22642,
            "yawOffset":0,
            "rollOffset":0.07547
        },
        "RightLeg":{
            "pitch":-28.86792,
            "yaw":0,
            "roll":0,
            "pitchPhase":-180,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":-30.22642,
            "yawOffset":0,
            "rollOffset":-0.07547
        },
        "LeftFoot":{
            "pitch":4.07547,
            "yaw":0,
            "roll":0,
            "pitchPhase":270.33962,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":1.58491,
            "yawOffset":-0.56604,
            "rollOffset":-0.9434
        },
        "RightFoot":{
            "pitch":4.07547,
            "yaw":0,
            "roll":0,
            "pitchPhase":90.33962,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":1.58491,
            "yawOffset":0.56604,
            "rollOffset":0.9434
        },
        "LeftToeBase":{
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
            "roll":2.86792,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":-82.18868,
            "pitchOffset":-4.41509,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "Spine1":{
            "pitch":0,
            "yaw":0,
            "roll":3.39623,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":-90.33962,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "Spine2":{
            "pitch":0,
            "yaw":0,
            "roll":1.50943,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":-87.62264,
            "pitchOffset":0,
            "yawOffset":0,
            "rollOffset":0,
            "pitchFrequencyMultiplier":2
        },
        "LeftShoulder":{
            "pitch":3.69811,
            "yaw":0,
            "roll":0,
            "pitchPhase":-147.39623,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":2.03774,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightShoulder":{
            "pitch":3.69811,
            "yaw":0,
            "roll":0,
            "pitchPhase":-147.39623,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":2.03774,
            "yawOffset":0,
            "rollOffset":0
        },
        "LeftArm":{
            "pitch":7.4717,
            "yaw":0,
            "roll":0,
            "pitchPhase":-40.07547,
            "yawPhase":0,
            "rollPhase":-2.03774,
            "pitchOffset":68.60377,
            "yawOffset":14.26415,
            "rollOffset":0
        },
        "RightArm":{
            "pitch":7.4717,
            "yaw":0,
            "roll":0,
            "pitchPhase":-40.07547,
            "yawPhase":0,
            "rollPhase":-2.03774,
            "pitchOffset":68.60377,
            "yawOffset":-14.26415,
            "rollOffset":0
        },
        "LeftForeArm":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0.67925,
            "yawOffset":0,
            "rollOffset":18.33962
        },
        "RightForeArm":{
            "pitch":0,
            "yaw":0,
            "roll":0,
            "pitchPhase":0,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":0.67925,
            "yawOffset":0,
            "rollOffset":-18.33962
        },
        "LeftHand":{
            "pitch":9.50943,
            "yaw":0,
            "roll":0,
            "pitchPhase":-0.67925,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":-4.75472,
            "yawOffset":0,
            "rollOffset":0
        },
        "RightHand":{
            "pitch":9.50943,
            "yaw":0,
            "roll":0,
            "pitchPhase":179.32075,
            "yawPhase":0,
            "rollPhase":0,
            "pitchOffset":-4.75472,
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