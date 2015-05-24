//
//  walk.js
//
//  version 1.252 May 2015
//
//  https://hifi-public.s3.amazonaws.com/hifi-public/procedural-animator/beta/walk.js
//  http://s3.amazonaws.com/hifi-public/procedural-animator/beta/walk.js
//
//  Design and code: David Wooldridge
//
//  Animates an avatar using procedural animation techniques
// 
//  Editing tools for animation data files available here: https://github.com/DaveDubUK/walkTools
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// locomotion states
var STATIC = 1;
var SURFACE_MOTION = 2;
var AIR_MOTION = 4;

// directions
var UP = 1;
var DOWN = 2;
var LEFT = 4;
var RIGHT = 8;
var FORWARDS = 16;
var BACKWARDS = 32;
var NONE = 64;

// waveshapes
var SAWTOOTH = 1;
var TRIANGLE = 2;
var SQUARE = 4;

// animation and locomotion constants
var MOVE_THRESHOLD = 0.075;
var FLY_THRESHOLD = 0.01;
var MAX_WALK_SPEED = 2.29;
var TOP_SPEED = 300;
var ACCELERATION_THRESHOLD = 2;  // detect stop to walking
var DECELERATION_THRESHOLD = -5; // detect walking to stop
var FAST_DECELERATION_THRESHOLD = -150; // detect flying to stop
var GRAVITY_THRESHOLD = 3.0; // height above surface where gravity is in effect
var GRAVITY_REACTION_THRESHOLD = 0.5; // reaction sensitivity to jumping under gravity
var LANDING_THRESHOLD = 0.45; // metres from a surface below which need to prepare for impact
var ON_SURFACE_THRESHOLD = 0.1; // height above surface to be considered as on the surface
var MAX_TRANSITION_RECURSION = 10; // how many nested transitions are permitted
var TRANSITION_COMPLETE = 1000;

// path to animations, reach-poses, reachPoses, transitions, overlay images and reference files
//var pathToAssets = 'http://s3.amazonaws.com/hifi-public/procedural-animator/assets/';
var pathToAssets = 'http://localhost/downloads/hf/scripts/walk-1.25-RC-1.0/assets/'; // path to local copy of assets folder - REMOVE_FOR_RELEASE

// load filters (Bezier, Butterworth, harmonics, averaging)
Script.include("./libraries/walkFilters.js");

// load objects and constructors
Script.include("./libraries/walkApi.js");

// load assets
Script.include(pathToAssets + "walkAssets.js");

// create Avatar
var avatar = new Avatar();

// create Motion
var motion = new Motion();

// create UI
//Script.include("./libraries/walkInterface.js");

/////////////////////////////////////////////
//
// load walkTools - REMOVE_FOR_RELEASE ...
//
var oscilloscope = null; 
var EDIT = 8; // extra locomotion state
Script.include('./libraries/walkTools.js');
Script.include("./libraries/walkToolsCameras.js");
//Script.include("./libraries/walkToolsScopeBezier.js");
Script.include("./libraries/walkToolsUI.js");
//var scopeProbe1 = 0;
//var scopeProbe2 = 0;
//var scopeProbe3 = 0;
//var scopePreAmp = 5000;
//
// ... / load walkTools - REMOVE_FOR_RELEASE
//
////////////////////////////////////////////

// create and initialise Transition
var nullTransition = new Transition();
motion.currentTransition = nullTransition;

// motion smoothing / damping filters
var FLY_POSE_DAMPING = 50;
var leanPitchSmoothingFilter = filter.createButterworthFilter();
var leanRollSmoothingFilter = filter.createButterworthFilter();
var flyUpFilter = filter.createAveragingFilter(FLY_POSE_DAMPING);
var flyDownFilter = filter.createAveragingFilter(FLY_POSE_DAMPING);
var flyForwardFilter = filter.createAveragingFilter(FLY_POSE_DAMPING);
var flyBackwardFilter = filter.createAveragingFilter(FLY_POSE_DAMPING);

// check for existence of data file object property
function isDefined(value) {
    try {
        if (typeof value != 'undefined') return true;
    } catch (e) {
        return false;
    }
}

// ECMAScript 6 specification ready string.contains() function
if (!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

// Main loop
Script.update.connect(function(deltaTime) {

    if (motion.isLive) {
        
        /////////////////////////////////////////////
        //
        // walkTools - REMOVE_FOR_RELEASE ...
        //
        if (walkTools) walkTools.beginProfiling(deltaTime);              
        
        // assess current locomotion state
        motion.assess(deltaTime);

        // decide which animation should be playing
        selectAnimation();
        
        // turn the frequency time wheels and determine stride length
        determineStride();

        // update the progress of any live transitions
        updateTransitions();

        // apply translation and rotations
        renderMotion();

        // record this frame's parameters for future reference
        motion.saveHistory();

        // REMOVE_FOR_RELEASE
        if (oscilloscope) walkTools.toOscilloscope(scopeProbe1 , scopeProbe2, scopeProbe3);
        if (walkTools) walkTools.updateStats();
        //
        // ... / load walkTools - REMOVE_FOR_RELEASE
        //
        ////////////////////////////////////////////   
    }
});

// helper function for selectAnimation()
function setTransition(nextAnimation, playTransitionReachPoses) {

    var lastTransition = motion.currentTransition;
    motion.currentTransition = new Transition(nextAnimation,
                                              avatar.currentAnimation,
                                              motion.currentTransition,
                                              playTransitionReachPoses);
    avatar.currentAnimation = nextAnimation;

    // resynchronise footstep sounds
    if (nextAnimation === avatar.selectedWalkBlend && lastTransition === nullTransition) {
        avatar.nextStep = RIGHT;
    }
    // handle excessive nested / overlapping transitions
    if (motion.currentTransition.recursionDepth > MAX_TRANSITION_RECURSION) {
        motion.currentTransition.die();
        motion.currentTransition = lastTransition;
    }
}

// select / blend the appropriate animation for the current state of motion
function selectAnimation() {
// walkTools - REMOVE_FOR_RELEASE - not possible to edit in release version 
// check for editing modes first, as these require no positioning calculations
if (!walkTools.editMode()) {
    
    // will we use the Transition's reachPoses?
    var playTransitionReachPoses = true;

    // select appropriate animation. create transitions where appropriate
    switch (motion.nextState) {
        case STATIC: {
            // always set the transition before changing the state to allow new transition to save current animation first
            if (avatar.distanceFromSurface < ON_SURFACE_THRESHOLD && 
                       avatar.currentAnimation !== avatar.selectedIdle) {
                setTransition(avatar.selectedIdle, playTransitionReachPoses);
            } else if (!(avatar.distanceFromSurface < ON_SURFACE_THRESHOLD) && 
                         avatar.currentAnimation !== avatar.selectedHover) {
                setTransition(avatar.selectedHover, playTransitionReachPoses);
            }
            if (motion.state !== STATIC) {
                motion.state = STATIC;
            }
            break;
        }

        case SURFACE_MOTION: {
            // simply fill the walk buffer based on direction for now. future work may involve blending walk / sidestep etc
            switch (motion.direction) {
                case FORWARDS:
                    animationOperations.deepCopy(avatar.selectedWalk, avatar.selectedWalkBlend);
                    avatar.calibration.strideLength = avatar.selectedWalk.calibration.strideLength;
                    break;

                case BACKWARDS:
                    animationOperations.deepCopy(avatar.selectedWalkBackwards, avatar.selectedWalkBlend);
                    avatar.calibration.strideLength = avatar.selectedWalkBackwards.calibration.strideLength;
                    break;

                case LEFT:
                    animationOperations.deepCopy(avatar.selectedSideStepLeft, avatar.selectedWalkBlend);
                    avatar.calibration.strideLength = avatar.selectedSideStepLeft.calibration.strideLength;
                    break

                case RIGHT:
                    animationOperations.deepCopy(avatar.selectedSideStepRight, avatar.selectedWalkBlend);
                    avatar.calibration.strideLength = avatar.selectedSideStepRight.calibration.strideLength;
                    break;
            }

            // walk transition reachPoses are currently only specified for walking forwards
            playTransitionReachPoses = !(motion.direction !== FORWARDS);
            
            // always set the transition before changing the state to allow new transition to save current animation state    
            if (avatar.currentAnimation !== avatar.selectedWalkBlend) {
                setTransition(avatar.selectedWalkBlend, playTransitionReachPoses);
            }
            if (motion.state !== SURFACE_MOTION) {
                 motion.state = SURFACE_MOTION;
            }
            break;
        }

        case AIR_MOTION: {
            // blend the hover, up, down, forward and backward flying animations relative to motion speed and direction
            // at lower speeds, the hover component dominates. at higher speeds, the directional components dominate
            animationOperations.zeroAnimation(avatar.selectedFlyBlend);

            // calculate influences based on velocity and direction
            var velocityMagnitude = Vec3.length(motion.velocity);
            var verticalProportion = motion.velocity.y / velocityMagnitude;
            var thrustProportion = motion.velocity.z / velocityMagnitude / 2;
            
            // directional and hover components
            var upComponent = motion.velocity.y > 0 ? verticalProportion : 0;
            var downComponent = motion.velocity.y < 0 ? -verticalProportion : 0;
            var forwardComponent = motion.velocity.z < 0 ? -thrustProportion : 0;
            var backwardComponent = motion.velocity.z > 0 ? thrustProportion : 0;
            var hoverComponent = velocityMagnitude < MAX_WALK_SPEED ? 
                                (MAX_WALK_SPEED - velocityMagnitude) / MAX_WALK_SPEED : 0;
                                
            // smooth / damp directional components to add visual 'weight''
            upComponent = flyUpFilter.process(upComponent);
            downComponent = flyDownFilter.process(downComponent);
            forwardComponent = flyForwardFilter.process(forwardComponent);
            backwardComponent = flyBackwardFilter.process(backwardComponent);            

            // normalise directional components. blend influence / strength with hover component
            var normaliser = upComponent + downComponent + forwardComponent + backwardComponent;
            upComponent = (1 - hoverComponent) * upComponent / normaliser;
            downComponent = (1 - hoverComponent) * downComponent / normaliser;
            forwardComponent = (1 - hoverComponent) * forwardComponent / normaliser;
            backwardComponent = (1 - hoverComponent) * backwardComponent / normaliser;
            
            // blend animations proportionally
            if (upComponent > 0) {
                animationOperations.blendAnimation(avatar.selectedFlyUp,
                                         avatar.selectedFlyBlend,
                                         upComponent);
            }
            if (downComponent > 0) {
                animationOperations.blendAnimation(avatar.selectedFlyDown,
                                     avatar.selectedFlyBlend,
                                     downComponent);
            }
            if (forwardComponent > 0) {
                animationOperations.blendAnimation(avatar.selectedFly,
                                     avatar.selectedFlyBlend,
                                     Math.abs(forwardComponent));
            }
            if (backwardComponent > 0) {
                animationOperations.blendAnimation(avatar.selectedFlyBackwards,
                                     avatar.selectedFlyBlend,
                                     Math.abs(backwardComponent));
            }
            if (hoverComponent > 0) {
                animationOperations.blendAnimation(avatar.selectedHover,
                                     avatar.selectedFlyBlend,
                                     Math.abs(hoverComponent));
            }

            // always set the transition before changing the state to allow new transition to save current animation state
            if (avatar.currentAnimation !== avatar.selectedFlyBlend) {
                setTransition(avatar.selectedFlyBlend, playTransitionReachPoses);
            }
            if (motion.state !== AIR_MOTION) {
                motion.state = AIR_MOTION;
            }
            break;
        }
    } // end switch (motion.nextState)
} // / walkTools - REMOVE_FOR_RELEASE - not possible to edit in release version    
}

// determine the length of stride. advance the frequency time wheels. advance frequency time wheels for any live transitions
function determineStride() {

    var wheelAdvance = 0;

    // turn the frequency time wheel
    if (avatar.currentAnimation === avatar.selectedWalkBlend) {
        // Using technique described here: http://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approach
        // wrap the stride length around a 'surveyor's wheel' twice and calculate the angular speed at the given (linear) speed
        // omega = v / r , where r = circumference / 2 PI and circumference = 2 * stride length
        var speed = Vec3.length(motion.velocity);
        motion.frequencyTimeWheelRadius = avatar.calibration.strideLength / Math.PI;
        var angularVelocity = speed / motion.frequencyTimeWheelRadius;

        // calculate the degrees turned (at this angular speed) since last frame
        wheelAdvance = filter.radToDeg(motion.deltaTime * angularVelocity);

        // walkTools - show stats and walk wheel - REMOVE_FOR_RELEASE
        if (walkTools) walkTools.updateFrequencyTimeWheelStats(motion.deltaTime, speed, motion.frequencyTimeWheelRadius, wheelAdvance); 
        
    } else {
        // turn the frequency time wheel by the amount specified for this animation
        wheelAdvance = filter.radToDeg(avatar.currentAnimation.calibration.frequency * motion.deltaTime);

        // walkTools - show stats and walk wheel - REMOVE_FOR_RELEASE
        if (walkTools) walkTools.updateFrequencyTimeWheelStats(motion.deltaTime, Vec3.length(motion.velocity), 0.5, wheelAdvance);              
    }

    if (motion.currentTransition !== nullTransition) {
        // the last animation is still playing so we turn it's frequency time wheel to maintain the animation
        if (motion.currentTransition.lastAnimation === motion.selectedWalkBlend) {
            // if at a stop angle (i.e. feet now under the avi) hold the wheel position for remainder of transition
            var tolerance = motion.currentTransition.lastFrequencyTimeIncrement + 0.1;
            if ((motion.currentTransition.lastFrequencyTimeWheelPos >
                (motion.currentTransition.stopAngle - tolerance)) &&
                (motion.currentTransition.lastFrequencyTimeWheelPos <
                (motion.currentTransition.stopAngle + tolerance))) {
                motion.currentTransition.lastFrequencyTimeIncrement = 0;
            }
        }
        motion.currentTransition.advancePreviousFrequencyTimeWheel(motion.deltaTime);
    }
    
    // walkTools - REMOVE_FOR_RELEASE
    if (walkTools) walkTools.updateTransitionFTWheelStats(motion.deltaTime, Vec3.length(motion.velocity));
    if (avatar.currentAnimation.calibration.frequency === 0) {
        if (walkTools) motion.frequencyTimeWheelPos = walkTools.getCyclePosition();
    } else        
    
    // advance the walk wheel the appropriate amount
    motion.advanceFrequencyTimeWheel(wheelAdvance);

    // walking? then see if it's a good time to measure the stride length (needs to be at least 97% of max walking speed)
    if (avatar.currentAnimation === avatar.selectedWalkBlend && 
       (Vec3.length(motion.velocity) / MAX_WALK_SPEED > 0.97)) {
        
        var strideMaxAt = avatar.currentAnimation.calibration.strideMaxAt;
        var tolerance = 1.0;

        if (motion.frequencyTimeWheelPos < (strideMaxAt + tolerance) &&
            motion.frequencyTimeWheelPos > (strideMaxAt - tolerance) &&
            motion.currentTransition === nullTransition) {
            // measure and save stride length
            var footRPos = MyAvatar.getJointPosition("RightFoot");
            var footLPos = MyAvatar.getJointPosition("LeftFoot");
            avatar.calibration.strideLength = Vec3.distance(footRPos, footLPos);
            avatar.currentAnimation.calibration.strideLength = avatar.calibration.strideLength;
        } else {
            // use the previously saved value for stride length
            avatar.calibration.strideLength = avatar.currentAnimation.calibration.strideLength;
        }
    } // end get walk stride length
}

// initialise a new transition. update progress of a live transition
function updateTransitions() {

    if (motion.currentTransition !== nullTransition) {
        // is this a new transition?
        if (motion.currentTransition.progress === 0) {
            // do we have overlapping transitions?
            if (motion.currentTransition.lastTransition !== nullTransition) {
                // is the last animation for the nested transition the same as the new animation?
                if (motion.currentTransition.lastTransition.lastAnimation === avatar.currentAnimation) {
                    // then sync the nested transition's frequency time wheel for a smooth animation blend
                    motion.frequencyTimeWheelPos = motion.currentTransition.lastTransition.lastFrequencyTimeWheelPos;
                }
            }
        }

        // update the Transition progress
        if (motion.currentTransition.updateProgress() === TRANSITION_COMPLETE) {
            motion.currentTransition.die();
            motion.currentTransition = nullTransition;
        }
    }
}

// helper function for renderMotion(). calculate the amount to lean forwards (or backwards) based on the avi's velocity
function getLeanPitch() {

    var leanProgress = 0;
    if (motion.direction === DOWN ||
        motion.direction === FORWARDS ||
        motion.direction === BACKWARDS) {
        leanProgress = -motion.velocity.z / TOP_SPEED;
    }
    
    // use filters to shape the walking acceleration response
    leanProgress = leanPitchSmoothingFilter.process(leanProgress);
    return motion.calibration.pitchMax * leanProgress;
}

// helper function for renderMotion(). calculate the angle at which to bank into corners whilst turning
function getLeanRoll() {

    var leanRollProgress = 0;
    var angularSpeed = filter.radToDeg(MyAvatar.getAngularVelocity().y);

    // factor in both angular and linear speeds
    var linearContribution = 0;
    if (Vec3.length(motion.velocity) > 0) {
        linearContribution = (Math.log(Vec3.length(motion.velocity) / TOP_SPEED) + 8) / 8;
    }
    var angularContribution = Math.abs(angularSpeed) / motion.calibration.angularVelocityMax;
    leanRollProgress = linearContribution;
    leanRollProgress *= angularContribution;

    // shape the response curve
    leanRollProgress = filter.bezier(leanRollProgress, {x: 1, y: 0}, {x: 1, y: 0});

    // which way to lean?
    var turnSign = (angularSpeed < 0.001) ? 1 : -1;
    if (motion.direction === BACKWARDS ||
        motion.direction === LEFT) {
        turnSign *= -1;
    }

    // filter progress
    leanRollProgress = leanRollSmoothingFilter.process(turnSign * leanRollProgress);
    return motion.calibration.rollMax * leanRollProgress;
}

// animate the avatar using sine waves, geometric waveforms and harmonic generators
function renderMotion() {

    // leaning in response to speed and acceleration
    var leanPitch = getLeanPitch();
    var leanRoll = getLeanRoll();
    var lastDirection = motion.lastDirection;

    // hips translations from currently playing animations
    var hipsTranslations = {x:0, y:0, z:0};

    if (motion.currentTransition !== nullTransition) {
        // maintain previous direction when transitioning from a walk
        if (motion.currentTransition.lastAnimation === avatar.selectedWalkBlend) {
            motion.lastDirection = motion.currentTransition.lastDirection;
        }
        hipsTranslations = motion.currentTransition.blendTranslations(motion.frequencyTimeWheelPos,
                                                                      motion.lastDirection);
    } else {
        hipsTranslations = animationOperations.calculateTranslations(avatar.currentAnimation,
                                                                     motion.frequencyTimeWheelPos,
                                                                     motion.direction);
    }

    // factor any leaning into the hips offset
    hipsTranslations.z += avatar.calibration.hipsToFeet * Math.sin(filter.degToRad(leanPitch));
    hipsTranslations.x += avatar.calibration.hipsToFeet * Math.sin(filter.degToRad(leanRoll));

    // ensure skeleton offsets are within the 1m limit
    hipsTranslations.x = hipsTranslations.x > 1 ? 1 : hipsTranslations.x;
    hipsTranslations.x = hipsTranslations.x < -1 ? -1 : hipsTranslations.x;
    hipsTranslations.y = hipsTranslations.y > 1 ? 1 : hipsTranslations.y;
    hipsTranslations.y = hipsTranslations.y < -1 ? -1 : hipsTranslations.y;
    hipsTranslations.z = hipsTranslations.z > 1 ? 1 : hipsTranslations.z;
    hipsTranslations.z = hipsTranslations.z < -1 ? -1 : hipsTranslations.z;

    // apply translations
    MyAvatar.setSkeletonOffset(hipsTranslations);

    // play footfall sound?
    var producingFootstepSounds = (avatar.currentAnimation === avatar.selectedWalkBlend) && avatar.makesFootStepSounds;
    if (motion.currentTransition !== nullTransition && avatar.makesFootStepSounds) {
        if (motion.currentTransition.nextAnimation === avatar.selectedWalkBlend ||
            motion.currentTransition.lastAnimation === avatar.selectedWalkBlend) {
                producingFootstepSounds = true;
        }
    }
    if (producingFootstepSounds) {
        var ftWheelPosition = motion.frequencyTimeWheelPos;
        if (motion.currentTransition !== nullTransition && 
            motion.currentTransition.lastAnimation === avatar.selectedWalkBlend) {
            ftWheelPosition = motion.currentTransition.lastFrequencyTimeWheelPos;
        }
        if (avatar.nextStep === LEFT && ftWheelPosition > 270) {
            avatar.makeFootStepSound();
        } else if (avatar.nextStep === RIGHT && (ftWheelPosition < 270 && ftWheelPosition > 90)) {
            avatar.makeFootStepSound();
        }
    }

    // apply joint rotations
    for (jointName in walkAssets.animationReference.joints) {
        // ignore arms rotations if 'arms free' option is selected for Leap / Hydra use
        if ((walkAssets.animationReference.joints[jointName].IKChain === "LeftArm" ||
             walkAssets.animationReference.joints[jointName].IKChain === "RightArm") &&
             avatar.armsFree) {
                continue;
        }
        if (isDefined(avatar.currentAnimation.joints[jointName])) {
            var jointRotations = undefined;

            // if there's a live transition, blend the rotations with the last animation's rotations
            if (motion.currentTransition !== nullTransition) {
                jointRotations = motion.currentTransition.blendRotations(jointName,
                                                                         motion.frequencyTimeWheelPos,
                                                                         motion.lastDirection);
            } else {
                jointRotations = animationOperations.calculateRotations(jointName,
                                                    avatar.currentAnimation,
                                                    motion.frequencyTimeWheelPos,
                                                    motion.direction);
            }
            // apply angular velocity and speed induced leaning
            if (jointName === "Hips") {
                jointRotations.x += leanPitch;
                jointRotations.z += leanRoll;
            }
            // apply rotations
            MyAvatar.setJointData(jointName, Quat.fromVec3Degrees(jointRotations));
        }
    }
}