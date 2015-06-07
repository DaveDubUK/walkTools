//
//  walkReachPoses.js
//
//  version 1.0
//
//  Created by David Wooldridge, December 2014
//
//  Stores and supplies parameters defining animated reachPoses for the walk.js script v1.2+
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

reachPoseParameters = {

    "MaleIdleToWalkRP": {

        name: "MaleIdleToWalkRP",
        duration: 1.0,
        delay: {timing:0, strength:0},
        attack: {timing:0.5, strength:1},
        decay: {timing:0.5, strength:1},
        sustain: {timing:0.5, strength:1},
        release: {timing:1, strength:0},
        smoothing: 50
    },

    "MaleIdleToWalk2RP": {

        name: "MaleIdleToWalk2RP",
        duration: 1.25,
        delay: {timing:0, strength:0},
        attack: {timing:0.7, strength:1},
        decay: {timing:0.7, strength:1},
        sustain: {timing:0.7, strength:1},
        release: {timing:1, strength:1},
        smoothing: 50
    },

    "MaleIdleToWalk3RP": {

        name: "MaleIdleToWalk3RP",
        duration: 1.25,
        delay: {timing:0, strength:0},
        attack: {timing:0.3, strength:0.3},
        decay: {timing:0.3, strength:0.3},
        sustain: {timing:0.3, strength:0.3},
        release: {timing:1, strength:0.3},
        smoothing: 2
    },

    "MaleIdleToWalk4RP": {

        name: "MaleIdleToWalk4RP",
        duration: 0.6,
        delay: {timing:0, strength:0},
        attack: {timing:0.6, strength:1},
        decay: {timing:0.7, strength:1},
        sustain: {timing:0.7, strength:1},
        release: {timing:1, strength:0},
        smoothing: 2
    },

    "MaleHoverToIdleRP": {

        name: "MaleHoverToIdleRP",
        duration: 0.3,
        delay: {timing:0, strength:0},
        attack: {timing:0.3, strength:1.0},
        decay: {timing:0.3, strength:1.0},
        sustain: {timing:0.3, strength:1.0},
        release: {timing:1, strength:0},
        smoothing: 8
    },
    
    "MaleFlyToWalkRP": {

        name: "MaleFlyToWalkRP",
        duration: 0.4,
        delay: {timing:0, strength:0},
        attack: {timing:0.4, strength:1.0},
        decay: {timing:0.4, strength:1.0},
        sustain: {timing:0.4, strength:1.0},
        release: {timing:1, strength:0},
        smoothing: 8
    }
};