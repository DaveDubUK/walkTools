//
//  walkActions.js
//
//  version 1.0
//
//  Created by David Wooldridge, December 2014
//
//  Stores and supplies parameters defining animated actions for the walk.js script v1.2
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

actions = {

    "MaleIdleToWalkRP": {

        duration: 1.0,
        reachPose: "MaleIdleToWalkRP",
        delay: {timing:0, strength:0},
        attack: {timing:0.5, strength:1},
        decay: {timing:0.5, strength:1},
        sustain: {timing:0.5, strength:1},
        release: {timing:1, strength:0},
        smoothing: 50
    },

    "MaleIdleToWalk2RP": {

        duration: 1.25,
        reachPose: "MaleIdleToWalk2RP",
        delay: {timing:0, strength:0},
        attack: {timing:0.7, strength:1},
        decay: {timing:0.7, strength:1},
        sustain: {timing:0.7, strength:1},
        release: {timing:1, strength:1},
        smoothing: 50
    },

    "MaleIdleToWalk3RP": {

        duration: 1.25,
        reachPose: "MaleIdleToWalk3RP",
        delay: {timing:0, strength:0},
        attack: {timing:0.3, strength:0.3},
        decay: {timing:0.3, strength:0.3},
        sustain: {timing:0.3, strength:0.3},
        release: {timing:1, strength:0.3},
        smoothing: 2
    },

    "MaleWalkToIdleRP": {

        duration: 0.5,
        reachPose: "MaleWalkToIdleRP",
        delay: {timing:0.1, strength:0},
        attack: {timing:0.4, strength:1.0},
        decay: {timing:0.4, strength:1.0},
        sustain: {timing:0.4, strength:1.0},
        release: {timing:1, strength:0},
        smoothing: 50
    },
/*
    "MaleWalkToFlyRP": {

        duration: 0.5,
        reachPose: "MaleWalkToFlyRP",
        delay: {timing:0, strength:0},
        attack: {timing:0.3, strength:1.0},
        decay: {timing:0.3, strength:1.0},
        sustain: {timing:0.3, strength:1.0},
        release: {timing:1, strength:0},
        smoothing: 8
    },
*/
    "MaleHoverToIdleRP": {

        duration: 0.5,
        reachPose: "MaleHoverToIdleRP",
        delay: {timing:0, strength:0},
        attack: {timing:0.3, strength:1.0},
        decay: {timing:0.3, strength:1.0},
        sustain: {timing:0.3, strength:1.0},
        release: {timing:1, strength:0},
        smoothing: 8
    },

    "MaleFlyToWalkRP": {

        duration: 0.4,
        reachPose: "MaleFlyToWalkRP",
        delay: {timing:0, strength:0},
        attack: {timing:0.3, strength:1},
        decay: {timing:0.3, strength:1},
        sustain: {timing:0.3, strength:1},
        release: {timing:1.0, strength:0},
        smoothing: 25
    },
/*
    "RapidFlyingSlowdownRP": {

        duration: 1.0,
        reachPose: "RapidFlyingSlowdownRP",
        delay: {timing:0, strength:0},
        attack: {timing:0.1, strength:1},
        decay: {timing:0.1, strength:1},
        sustain: {timing:0.1, strength:1},
        release: {timing:1.0, strength:0},
        smoothing: 50
    }
*/
};