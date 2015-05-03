//
//  walk.js
//
//  version 1.25 beta, May 2015
//
//  https://hifi-public.s3.amazonaws.com/hifi-public/procedural-animator/beta/walk.js
//  http://s3.amazonaws.com/hifi-public/procedural-animator/beta/walk.js
//
//  Design and code: David Wooldridge
//
//  Animates an avatar using procedural animation techniques
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// constants
var MALE = 1;
var FEMALE = 2;
// directions
var UP = 1;
var DOWN = 2;
var LEFT = 4;
var RIGHT = 8;
var FORWARDS = 16;
var BACKWARDS = 32;
var NONE = 64;
// filter
var SAWTOOTH = 1;
var TRIANGLE = 2;
var SQUARE = 4;
var TRANSITION_COMPLETE = 1000;
// animation, locomotion and position
var MOVE_THRESHOLD = 0.075;  //
var FLY_THRESHOLD = 0.01;//
var MAX_WALK_SPEED = 2.6;
var TOP_SPEED = 300;
var ACCELERATION_THRESHOLD = 2;  // detect stop to walking
var DECELERATION_THRESHOLD = -5; // detect walking to stop
var FAST_DECELERATION_THRESHOLD = -150; // detect flying to stop
var GRAVITY_THRESHOLD = 3.0; // height above surface where gravity is in effect
var GRAVITY_REACTION_THRESHOLD = 0.5; // reaction sensitivity to jumping under gravity
var LANDING_THRESHOLD = 0.2; // metres from a surface below which need to prepare for impact
var ON_SURFACE_THRESHOLD = 0.1; // height above surface to be considered as on the surface
var ANGULAR_ACCELERATION_MAX = 75; // rad/s/s
var MAX_TRANSITION_RECURSION = 10; // how many nested transtions are permitted

var walkTools = null; // manual hoisting - REMOVE_FOR_RELEASE
var oscilloscope = null; // REMOVE_FOR_RELEASE

// IMPORTANT - if you want to see your local copy of the animations, change the path here //

// path to animations, reach-poses, actions, transitions, overlay images, etc
var pathToAssets = 'http://localhost/downloads/hf/scripts/walk-1.25-beta/assets/'; // path to local copy of assets folder - REMOVE_FOR_RELEASE
//var pathToAssets = 'http://s3.amazonaws.com/hifi-public/procedural-animator/beta/assets/';

// select UI
//Script.include("./libraries/walkInterface.js"); // currently untested with this version
Script.include("./libraries/walkToolsUI.js"); // REMOVE_FOR_RELEASE

// load filters (Bezier, Butterworth, harmonics, averaging)
Script.include("./libraries/walkFilters.js");

// load objects and constructors
Script.include("./libraries/walkApi.js");

// load the assets
Script.include(pathToAssets + "walkAssets.js");

// create Avatar
var avatar = new Avatar();

// create Motion
var motion = new Motion(avatar);

// initialise Transitions
var nullTransition = new Transition();
motion.currentTransition = nullTransition;

// initialise the UI
walkInterface.initialise(state, walkAssets, avatar, motion);

// Begin by setting the STATIC internal state
state.setInternalState(state.STATIC);

////////////////////////////////////////////
//
// load walkTools - REMOVE_FOR_RELEASE ...
//
// load any additional tools (camera controller, oscilloscope/bezier editor)
/**/Script.include("./libraries/walkToolsCameras.js");
//Script.include("./libraries/walkToolsScopeBezier.js");

var scopeProbe1 = 0;
var scopeProbe2 = 0;
var scopeProbe3 = 0;
var scopePreAmp = 5000;

Script.include('./libraries/walkTools.js');
walkTools.connect(state, motion, walkInterface, avatar, oscilloscope);
walkInterface.minimiseInterface(false);
//
// ... / load walkTools - REMOVE_FOR_RELEASE
//
///////////////////////////////////////////

// motion smoothing filters
var leanPitchSmoothingFilter = filter.createButterworthFilter2(2);
var leanRollSmoothingFilter = filter.createButterworthFilter2(2);
var soaringFilter = filter.createAveragingFilter(8);
var flyUpFilter = filter.createAveragingFilter(50);
var flyDownFilter = filter.createAveragingFilter(50);


// this string functionality will be in the ECMAScript 6 specification.
if (!('contains' in String.prototype)) {

    String.prototype.contains = function(str, startIndex) {

        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

// check for existence of object property (e.g. animation waveform synthesis filters)
function isDefined(value) {

    try {
        if (typeof value != 'undefined') return true;
    } catch (e) {
        return false;
    }
}
var frameNo = 0;
// Main loop
Script.update.connect(function(deltaTime) {

    if (state.powerOn) {

        // REMOVE_FOR_RELEASE
        if(walkTools) walkTools.beginProfiling(deltaTime);

        // assess current locomotion
        motion.quantify(deltaTime);//print('Frame number: '+ (frameNo++)+' Current speed is '+Vec3.length(motion.velocity).toFixed(1)+' m/s and decelerating is '+motion.isDecelerating);//+' '+walkTools.dumpState());

        // decide which animation should be playing
        selectAnimation();

        // turn the frequency time wheels
        turnFrequencyTimeWheels();

        // calculate (or fetch pre-calculated) stride length for this avi
        setStrideLength();

        // update the progress of any live transitions
        updateTransitions();

        // apply translation and rotations
        renderMotion();

        // record this frame's parameters for future reference
        motion.saveHistory();

        // REMOVE_FOR_RELEASE
        if(oscilloscope) walkTools.toOscilloscope(scopeProbe1 , scopeProbe2, scopeProbe3);
        if(walkTools) walkTools.updateStats();
    }
});

// helper function for selectAnimation()
function setTransition(nextAnimation, playTransitionActions) {

    //print('setting new transition from '+avatar.currentAnimation.name+' to '+nextAnimation.name+'. current speed is '+Vec3.length(MyAvatar.getVelocity()));
    var lastTransition = motion.currentTransition;
    motion.currentTransition = new Transition(nextAnimation,
                                              avatar.currentAnimation,
                                              motion.currentTransition,
                                              playTransitionActions);

    avatar.currentAnimation = nextAnimation;

    // reset footstep sounds
    if (nextAnimation === avatar.selectedWalk && lastTransition === nullTransition) {

        avatar.nextStep = RIGHT;
    }

    if(motion.currentTransition.recursionDepth > MAX_TRANSITION_RECURSION) {

        // TODO: recursion levels in transitions should be reset here
        motion.currentTransition.die();
        motion.currentTransition = lastTransition;
    }
}

// initialise a new transition. update progress of a live transition
function updateTransitions() {

    if (motion.currentTransition !== nullTransition) {

        // new transition?
        if (motion.currentTransition.progress === 0) {

            // overlapping transitions?
            if (motion.currentTransition.lastTransition !== nullTransition) {

                // is the last animation for the nested transition the same as the new animation?
                if (motion.currentTransition.lastTransition.lastAnimation === avatar.currentAnimation) {

                    // sync the nested transitions's frequency time wheel for a smooth animation blend
                    motion.frequencyTimeWheelPos = motion.currentTransition.lastTransition.lastFrequencyTimeWheelPos;
                }
            }
        } // end if new transition

        // update the Transition progress
        if (motion.currentTransition.updateProgress() === TRANSITION_COMPLETE) {

            motion.currentTransition.die();
            motion.currentTransition = nullTransition;
        }
    }
}

// select / blend the appropriate animation for the current locomotion mode and state of motion
function selectAnimation() {

    // check for editing modes first, as these require no positioning calculations REMOVE_FOR_RELEASE
    if (!walkTools.editMode()) { // REMOVE_FOR_BETA, REMOVE_FOR_RELEASE - not possible to edit in release version

        // will we use the Transition's Actions?
        var playTransitionActions = true;

        // select appropriate animation. create appropriate transitions
        switch (motion.locomotionMode) {

            case state.STATIC: {

                // TODO: add animation selection code here for; turn on the spot and spin whilst hovering

                if (state.currentState !== state.STATIC) {

                    //if (motion.currentTransition !== nullTransition) {

                        //if (motion.currentTransition.direction === BACKWARDS) {

                            //playTransitionActions = false;
                            //walkTools.toLog('setting playTransitionActions false, as there is already another transition playing ('+
                            //                 motion.currentTransition.lastAnimation.name+' to '+ motion.currentTransition.nextAnimation.name +')');
                        //}
                    //}
                    // must always set the transition before changing the state
                    if (avatar.isOnSurface && avatar.currentAnimation !== avatar.selectedIdle) {

                        setTransition(avatar.selectedIdle, playTransitionActions);

                    } else if (avatar.currentAnimation !== avatar.selectedHover) {

                        setTransition(avatar.selectedHover, playTransitionActions);
                    }
                    state.setInternalState(state.STATIC);

                } else if (avatar.isOnSurface && avatar.currentAnimation !== avatar.selectedIdle) {

                    setTransition(avatar.selectedIdle, playTransitionActions);

                } else if (!avatar.isOnSurface && avatar.currentAnimation !== avatar.selectedHover) {

                    setTransition(avatar.selectedHover, playTransitionActions);
                }
                break;
            }

            case state.SURFACE_MOTION: {

                //animationOperations.zeroAnimation(avatar.selectedWalkBlend);

                // simply fill the walk buffer based on direction for now. future work may involve blending walk / sidestep etc
                switch(motion.direction) {

                    case FORWARDS:

                        animationOperations.deepCopy(avatar.selectedWalk, avatar.selectedWalkBlend);
                        break;

                    case BACKWARDS:

                        animationOperations.deepCopy(avatar.selectedWalkBackwards, avatar.selectedWalkBlend);
                        break;

                    case LEFT:

                        animationOperations.deepCopy(avatar.selectedSideStepLeft, avatar.selectedWalkBlend);
                        break

                    case RIGHT:

                        animationOperations.deepCopy(avatar.selectedSideStepRight, avatar.selectedWalkBlend);
                        break;
                }

                if (state.currentState !== state.SURFACE_MOTION) {

                    // transition actions will cause glitches if a matching animation is continuing from
                    // a previous transition, so in this case we don't play the transition's actions.
                    //if (motion.currentTransition !== nullTransition) {

                        //playTransitionActions = false;
                        //walkTools.toLog('setting playTransitionActions false, as there is already another transition playing ('+
                        //                 motion.currentTransition.lastAnimation.name+' to '+ motion.currentTransition.nextAnimation.name +')');
                    //}
                    if (avatar.currentAnimation === avatar.selectedIdle && motion.direction !== FORWARDS) {

                        playTransitionActions = false;
                        //walkTools.toLog('setting playTransitionActions false, as starting to walk, but not forwards (going '+motion.direction+')');
                    }

                    // must always set the transition before changing the state (allow new transition to record the last state)
                    if (avatar.currentAnimation !== avatar.selectedWalkBlend) {

                        setTransition(avatar.selectedWalkBlend, playTransitionActions);
                    }
                    state.setInternalState(state.SURFACE_MOTION);
                }
                if (avatar.currentAnimation !== avatar.selectedWalkBlend) {

                    setTransition(avatar.selectedWalkBlend, playTransitionActions);
                }
                break;
            }

            case state.AIR_MOTION: {

                // blend the up, down and forward flying animations relative to motion direction
                animationOperations.zeroAnimation(avatar.selectedFlyBlend);

                // calculate influences
                var velocityMagnitude = Vec3.length(motion.velocity);
                var upDownProportion = motion.velocity.y / velocityMagnitude;
                var forwardProportion = -motion.velocity.z / velocityMagnitude;

                var upComponent = motion.velocity.y > 0 ? upDownProportion : 0;
                var downComponent = motion.velocity.y < 0 ? -upDownProportion : 0;
                var forwardComponent = motion.velocity.z < 0 ? forwardProportion : 0;

                //var speedComponent = Math.abs(motion.velocity.z / TOP_SPEED);
                //var soaringComponent = Vec3.length(MyAvatar.getAngularAcceleration()) / ANGULAR_ACCELERATION_MAX;

                // add damping
                upComponent = flyUpFilter.process(upComponent);
                downComponent = flyDownFilter.process(downComponent);
                //soaringComponent = soaringFilter.process(soaringComponent);

                // normalise components
                var denominator = upComponent + downComponent + forwardComponent;// + speedComponent + soaringComponent;
                upComponent = upComponent / denominator;
                downComponent = downComponent / denominator;
                forwardComponent = forwardComponent / denominator;
                //speedComponent = speedComponent / denominator;
                //soaringComponent = soaringComponent / denominator;

                //var sanityCheck = upComponent + downComponent + forwardComponent;
                //print('jump components: up:'+upComponent.toFixed(2)+' down:'+downComponent.toFixed(2)+' forward:'+forwardComponent.toFixed(2)+'. sanity: 1.0='+sanityCheck.toFixed(1));

                // sum the components
                animationOperations.blendAnimation(avatar.selectedFlyUp,
                                         avatar.selectedFlyBlend,
                                         upComponent);

                animationOperations.blendAnimation(avatar.selectedFlyDown,
                                         avatar.selectedFlyBlend,
                                         downComponent);

                //animationOperations.blendAnimation(avatar.selectedRapidFly,
                //                         avatar.selectedFlyBlend,
                //                         0);//speedComponent);

                //animationOperations.blendAnimation(avatar.selectedSoarFly,
                //                         avatar.selectedFlyBlend,
                //                         0);//soaringComponent);

                animationOperations.blendAnimation(avatar.selectedFly,
                                         avatar.selectedFlyBlend,
                                         Math.abs(forwardComponent));

                if (avatar.currentAnimation !== avatar.selectedFlyBlend) {

                    setTransition(avatar.selectedFlyBlend, playTransitionActions);
                }
                if (state.currentState !== state.AIR_MOTION) {

                    state.setInternalState(state.AIR_MOTION);
                }
                break;
            }

        } // end switch(motion.locomotionMode)

    } // end if editing REMOVE_FOR_RELEASE REMOVE_FOR_BETA
}

// advance the frequency time wheels. advance frequency time wheels for any live transitions
function turnFrequencyTimeWheels() {

    var wheelAdvance = 0;

    // turn the frequency time wheel
    if (avatar.currentAnimation === avatar.selectedWalkBlend) {

        // Using technique described here: http://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approach
        // wrap the stride length around a 'surveyor's wheel' twice and calculate the angular speed at the given (linear) speed
        // omega = v / r , where r = circumference / 2 PI , where circumference = 2 * stride length
        var speed = Vec3.length(motion.velocity);
        motion.frequencyTimeWheelRadius = avatar.calibration.strideLength / Math.PI;
        var angularVelocity = speed / motion.frequencyTimeWheelRadius;

        // calculate the degrees turned (at this angular speed) since last frame
        wheelAdvance = filter.radToDeg(motion.deltaTime * angularVelocity);

        // if we are in an edit mode, we will need fake time to turn the wheel - REMOVE_FOR_RELEASE
        if (state.currentState !== state.SURFACE_MOTION) {

            wheelAdvance = avatar.currentAnimation.calibration.frequency / 70;
        }

        // show stats and walk wheel REMOVE_FOR_RELEASE
        if(walkTools) walkTools.updateFrequencyTimeWheelStats(motion.deltaTime, speed, motion.frequencyTimeWheelRadius, wheelAdvance);

    } else {

        // turn the frequency time wheel by the amount specified for this animation
        wheelAdvance = filter.radToDeg(avatar.currentAnimation.calibration.frequency * motion.deltaTime);

        // show stats and walk wheel REMOVE_FOR_RELEASE
        if(walkTools) walkTools.updateFrequencyTimeWheelStats(motion.deltaTime, Vec3.length(motion.velocity), 0.5, wheelAdvance);
    }

    if(motion.currentTransition !== nullTransition) {

        // the last animation is still playing so we turn it's frequency time wheel to maintain the animation
        if (motion.currentTransition.lastAnimation === motion.selectedWalk) {

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

    // REMOVE_FOR_RELEASE
    if(walkTools) walkTools.updateTransitionFTWheelStats(motion.deltaTime, Vec3.length(motion.velocity));
    if (avatar.currentAnimation.calibration.frequency === 0) {
        if(walkTools) motion.frequencyTimeWheelPos = walkTools.getCyclePosition();
    } else

    // advance the walk wheel the appropriate amount
    motion.advanceFrequencyTimeWheel(wheelAdvance);
}

// if the timing's right, recalculate the stride length. if not, fetch the previously calculated value
function setStrideLength() {

    // walking? then try to measure the stride length
    if (avatar.currentAnimation === motion.selectedWalkBlend) {

        // if not at full speed the calculation could be wrong
        var atMaxSpeed = Vec3.length(motion.velocity) / MAX_WALK_SPEED < 0.97 ? false : true;
        var strideMaxAt = avatar.currentAnimation.calibration.strideMaxAt;
        var tolerance = 1.0;

        if (motion.frequencyTimeWheelPos < (strideMaxAt + tolerance) &&
            motion.frequencyTimeWheelPos > (strideMaxAt - tolerance) &&
            atMaxSpeed && motion.currentTransition === nullTransition) {

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

// helper function for renderMotion(). calculate the amount to lean forwards (or backwards) based on the avi's acceleration
function getLeanPitch() {

    var leanProgress = 0;

    if (motion.direction === LEFT ||
        motion.direction === RIGHT ||
        motion.direction === UP) {

        leanProgress = 0;

    } else {

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
    if(Vec3.length(motion.velocity) > 0) {
        linearContribution = (Math.log(Vec3.length(motion.velocity) / TOP_SPEED) + 8) / 8;
    }
    var angularContribution = Math.abs(angularSpeed) / motion.calibration.angularVelocityMax;
    leanRollProgress = linearContribution;
    leanRollProgress *= angularContribution;

    // shape the response curve
    leanRollProgress = filter.bezier(leanRollProgress, {x: 1, y: 0}, {x: 1, y: 0});

    // which way to lean?
    var turnSign = -1;
    if (angularSpeed < 0.001) {

        turnSign = 1;
    }
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
        if (motion.currentTransition.lastAnimation === avatar.selectedWalk) {

            lastDirection = motion.currentTransition.lastDirection;
        }
        hipsTranslations = motion.currentTransition.blendTranslations(motion.frequencyTimeWheelPos,
                                                                      lastDirection);

    } else {

        hipsTranslations = animationOperations.calculateTranslations(avatar.currentAnimation,
                                                                     motion.frequencyTimeWheelPos,
                                                                     motion.direction);
    }

    // factor any leaning into the hips offset
    hipsTranslations.z += avatar.calibration.hipsToFeet * Math.sin(filter.degToRad(leanPitch));
    hipsTranslations.x += avatar.calibration.hipsToFeet * Math.sin(filter.degToRad(leanRoll));

    // ensure skeleton offsets within 1m limit
    hipsTranslations.x = hipsTranslations.x > 1 ? 1 : hipsTranslations.x;
    hipsTranslations.x = hipsTranslations.x < -1 ? -1 : hipsTranslations.x;
    hipsTranslations.y = hipsTranslations.y > 1 ? 1 : hipsTranslations.y;
    hipsTranslations.y = hipsTranslations.y < -1 ? -1 : hipsTranslations.y;
    hipsTranslations.z = hipsTranslations.z > 1 ? 1 : hipsTranslations.z;
    hipsTranslations.z = hipsTranslations.z < -1 ? -1 : hipsTranslations.z;

    // apply translations
    MyAvatar.setSkeletonOffset(hipsTranslations);

    // play footfall sound?
    if (avatar.makesFootStepSounds && avatar.isOnSurface) {

        var footDownLeft = 0;
        var footDownRight = 180;
        var groundPlaneMotion = avatar.currentAnimation === avatar.selectedWalk ||
                                avatar.currentAnimation === avatar.selectedSideStepLeft ||
                                avatar.currentAnimation === avatar.selectedSideStepRight ? true : false;
        var ftWheelPosition = motion.frequencyTimeWheelPos;

        if (motion.currentTransition !== nullTransition) {

            if (motion.currentTransition.lastAnimation === avatar.selectedWalk ||
                motion.currentTransition.lastAnimation === avatar.selectedSideStepLeft ||
                motion.currentTransition.lastAnimation === avatar.selectedSideStepright) {

                ftWheelPosition = motion.currentTransition.lastFrequencyTimeWheelPos;
            }
        }

        if (avatar.nextStep === LEFT && isDefined(footDownLeft)) {

            if (footDownLeft < ftWheelPosition) {

                avatar.makeFootStepSound();
            }

        } else if (avatar.nextStep === RIGHT && isDefined(footDownRight)) {

            if (footDownRight < ftWheelPosition && footDownLeft > ftWheelPosition) {

                avatar.makeFootStepSound();
            }
        }
    }

    // joint rotations
    for (jointName in walkAssets.animationReference.joints) {

        // ignore arms rotations if 'arms free' option is selected for Leap / Hydra use
        if((walkAssets.animationReference.joints[jointName].IKChain === "LeftArm" ||
            walkAssets.animationReference.joints[jointName].IKChain === "RightArm") &&
            avatar.armsFree) {

                continue;
        }

        if (isDefined(avatar.currentAnimation.joints[jointName])) {

            var jointRotations = undefined;

            // if there's a live transition, blend the rotations with the last animation's rotations for this joint
            if (motion.currentTransition !== nullTransition) {

                jointRotations = motion.currentTransition.blendRotations(jointName,
                                                                         motion.frequencyTimeWheelPos,
                                                                         lastDirection);
            } else {

                jointRotations = animationOperations.calculateRotations(jointName,
                                                    avatar.currentAnimation,
                                                    motion.frequencyTimeWheelPos,
                                                    motion.direction);
            }

            // apply lean
            if (jointName === "Hips") {   // || jointName === walkTools.selectedJoint()) {

                jointRotations.x += leanPitch;
                jointRotations.z += leanRoll;

                //scopeProbe1 = hipsTranslations.x * scopePreAmp; //accn.z;
                //scopeProbe2 = hipsTranslations.y * scopePreAmp; //motion.acceleration.z
                //scopeProbe3 = hipsTranslations.z * scopePreAmp; //motion.velocity.z;
            }

            // apply rotation
            MyAvatar.setJointData(jointName, Quat.fromVec3Degrees(jointRotations));
        }
    }
}