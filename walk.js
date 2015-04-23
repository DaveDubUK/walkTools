//
//  walk.js
//
//  version 1.25 beta, April 2015
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
// JS motor constants
var VERY_LONG_TIME = 1000000.0;
var VERY_SHORT_TIME = 0.001;
var SHORT_TIME = 0.2;
// animation, locomotion and position
var MOVE_THRESHOLD = 0.075; // movement dead zone
var MAX_WALK_SPEED = 2.6;
var TOP_SPEED = 300;
var ACCELERATION_THRESHOLD = -2;  // detect stop to walking
var DECELERATION_THRESHOLD = 5; // detect walking to stop
var FAST_DECELERATION_THRESHOLD = 150; // detect flying to stop
var GRAVITY_THRESHOLD = 3.0; // height above voxel surface where gravity kicks in
var ON_SURFACE_THRESHOLD = 0.1; // height above voxel surface to be considered as on the surface
var ANGULAR_ACCELERATION_MAX = 75; // rad/s/s
var MAX_TRANSITION_RECURSION = 10; // how many nested transtions are permitted

var walkTools = null; // manual hoisting - REMOVE_FOR_RELEASE
var oscilloscope = null; // REMOVE_FOR_RELEASE

// IMPORTANT - if you want to see your local copy of the animations, change the path here //

// path to animations, reach-poses, actions, transitions, overlay images, etc
//var pathToAssets = './assets/'; // TODO: get this working ! - REMOVE_FOR_RELEASE
//var pathToAssets = 'http://localhost/downloads/hf/scripts/walk-1.25-beta/assets/'; // path to local copy of assets folder - REMOVE_FOR_RELEASE
var pathToAssets = 'http://s3.amazonaws.com/hifi-public/procedural-animator/beta/assets/';

// select UI
//Script.include("./libraries/walkInterface.js"); // currently untested with this version
Script.include("./libraries/walkToolsUI.js"); // REMOVE_FOR_RELEASE

// load filters (Bezier, Butterworth, harmonics, averaging)
Script.include("./libraries/walkFilters.js");

// load objects and constructors
Script.include("./libraries/walkApi.js");

// start the asset loading throbber
throbber = new LoadingThrobber();

// load the assets
Script.include(pathToAssets + "walkAssets.js");

// stop the asset loading throbber
throbber.stop();
delete throbber;
throbber = null;

// create Avatar
var avatar = new Avatar();

// create Motion
var motion = new Motion(avatar);

// initialise Transitions
var nullTransition = new Transition();
motion.currentTransition = nullTransition;

// initialise the UI
walkInterface.initialise(state, walkAssets, avatar, motion);

// Begin by setting the STANDING internal state
state.setInternalState(state.STANDING);

/*////////////////////////////////////////////*/
//
// load walkTools - REMOVE_FOR_RELEASE ...
//
// load any additional tools (camera controller, oscilloscope/bezier editor)
Script.include("./libraries/walkToolsCameras.js");
//Script.include("./libraries/walkToolsScopeBezier.js");
// fire up the scope
//var scopeProbe1 = 0;
//var scopeProbe2 = 0;
//var scopeProbe3 = 0;
//var scopePreAmp = 20;
oscilloscope = null; // new Oscilloscope(pathToAssets, true);//

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
var flyUpFilter = filter.createAveragingFilter(30);
var flyDownFilter = filter.createAveragingFilter(30);

// Main loop
Script.update.connect(function(deltaTime) {

    if (state.powerOn) {

        // REMOVE_FOR_RELEASE
        if(walkTools) walkTools.beginProfiling(deltaTime);

        // assess current locomotion
        motion.initialise(deltaTime);

        // assess environment
        spatialAwareness.update();

        // decide which animation should be playing
        selectAnimation();

        // turn the frequency time wheels
        turnFrequencyTimeWheels();

        // calculate (or fetch pre-calculated) stride length for this avi
        setStrideLength();

        // update the progress of any live transitions
        updateTransitions();

        // update the progress of any live actions
        liveActions.update();

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
function determineLocomotionMode() {

    var locomotionMode = state.STANDING;

    switch(state.currentState) {

        case state.STANDING:

            if ((avatar.isAccelerating && !avatar.isOnSurface) ||
                (!avatar.isDecelerating && avatar.isAtFlyingSpeed) ||
                 avatar.isGoingUp ||
                 avatar.isGoingDown) {

                locomotionMode = state.FLYING; //print('stand to fly: going up '+avatar.isGoingUp+
                //                                     ' going down '+avatar.isGoingDown+
                //                                     ' accelerating '+avatar.isAccelerating+
                //                                     ' decelerating '+avatar.isDecelerating+
                //                                     ' at flying speed '+avatar.isAtFlyingSpeed+
                //                                     ' velocity.y '+motion.velocity.y);
            } else if (avatar.isOnSurface &&
                       avatar.isAtWalkingSpeed &&
                       avatar.isAccelerating &&
                       !jsMotor.isMotoring() &&
                       motion.direction !== DOWN && motion.direction !== UP) {

                locomotionMode = state.WALKING; //print('stand to walk: walking speed: '+avatar.isAtWalkingSpeed+
                                                //      ' motoring: '+jsMotor.isMotoring());

            } else {

                locomotionMode = state.STANDING;
            }
            break;

        case state.WALKING:
        case state.SIDE_STEP:

            if (avatar.isOnSurface && (avatar.isNotMoving || avatar.isDecelerating)) {

                // immediately start the motor to complete the walk cycle
                if (!jsMotor.isMotoring() && motion.direction !== LEFT && motion.direction !== RIGHT) {

                    jsMotor.startMotoring();
                }
                locomotionMode = state.STANDING; //print('walk to stand');

            } else if (((avatar.isAtFlyingSpeed && !avatar.isComingInToLand) ||
                        (avatar.isAtWalkingSpeed && !avatar.isComingInToLand)) &&
                         !avatar.isOnSurface) {

                locomotionMode = state.FLYING; //print('walk to fly');

            } else {

                locomotionMode = state.WALKING;
            }
            break;

        case state.FLYING:

            if (avatar.isNotMoving || avatar.isDeceleratingFast) {

                locomotionMode = state.STANDING; //print('fly to stand');

            } else if (((avatar.isAtWalkingSpeed && avatar.isOnSurface) || avatar.isComingInToLand) &&
                       motion.direction !== UP && motion.direction !== DOWN){

                locomotionMode = state.WALKING; //print('fly to walk');

            } else {

                locomotionMode = state.FLYING;
            }
            break;
    }

    // maybe travelling at walking speed, but sideways?
    if (locomotionMode === state.WALKING &&
       (motion.direction === LEFT ||
        motion.direction === RIGHT)) {

        // temporary - sidestep will be blended with walk each frame (direction of motion dependant)
        locomotionMode = state.SIDE_STEP;
    }

    return locomotionMode;
}

// helper function for selectAnimation()
function setTransition(nextAnimation, playTransitionActions) {

    //print('setting new transition from '+avatar.currentAnimation.name+' to '+nextAnimation.name);
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

        // TODO: recursion levels in transitions should be reset here?
        motion.currentTransition.die();
        motion.currentTransition = lastTransition;
    }
}

// select which animation should be played based on speed, mode of locomotion and direction of travel
function selectAnimation() {

    // check for editing modes first, as these require no positioning calculations REMOVE_FOR_RELEASE
    if (!walkTools.editMode()) { // REMOVE_FOR_RELEASE - not possible to edit in release version

        // determine mode of locomotion
        var locomotionMode = determineLocomotionMode();

        // will we use the Transition's Actions?
        var playTransitionActions = true;

        // select appropriate animation. create appropriate transitions
        switch (locomotionMode) {

            case state.STANDING: {

                if (state.currentState !== state.STANDING) {

                    if (motion.currentTransition !== nullTransition) {

                        if (motion.currentTransition.direction === BACKWARDS) {

                            playTransitionActions = false; // actions for forwards walking only
                        }
                    }
                    if (avatar.isOnSurface && avatar.currentAnimation !== avatar.selectedIdle) {

                        setTransition(avatar.selectedIdle, playTransitionActions);

                    } else if (avatar.currentAnimation !== avatar.selectedHover) {

                        setTransition(avatar.selectedHover, playTransitionActions);
                    }
                    state.setInternalState(state.STANDING);

                } else if (avatar.isOnSurface && avatar.currentAnimation !== avatar.selectedIdle) {

                    setTransition(avatar.selectedIdle, playTransitionActions);

                } else if (!avatar.isOnSurface && avatar.currentAnimation !== avatar.selectedHover) {

                    setTransition(avatar.selectedHover, playTransitionActions);
                }
                break;
            }

            case state.WALKING: {

                if (state.currentState !== state.WALKING) {

                    // transition actions will cause glitches if a matching animation is continuing from a previous transition
                    if (motion.currentTransition !== nullTransition) {

                        if (motion.currentTransition.lastAnimation === avatar.selectedWalk &&
                            motion.currentTransition.nextAnimation === avatar.selectedIdle) {

                            playTransitionActions = false;
                        }
                    }

                    // walking backwards?
                    if (motion.direction === BACKWARDS) {

                        setTransition(avatar.selectedWalkBackwards, playTransitionActions);

                    } else {

                        setTransition(avatar.selectedWalk, playTransitionActions);
                    }
                    state.setInternalState(state.WALKING);

                } else if (avatar.currentAnimation !== avatar.selectedWalk &&
                           avatar.currentAnimation !== avatar.selectedWalkBackwards) {

                    // walking backwards?
                    if (motion.direction === BACKWARDS) {

                        setTransition(avatar.selectedWalkBackwards, playTransitionActions);
                        walkTools.toLog('setting walk backwards');

                    } else {

                        setTransition(avatar.selectedWalk, playTransitionActions);
                        walkTools.toLog('setting walk forwards');
                    }
                }
                break;
            }

            case state.SIDE_STEP: {

                var selSideStep = undefined;

                if (state.currentState !== state.SIDE_STEP) {

                    if (motion.direction === LEFT) {

                        motion.frequencyTimeWheelPos = avatar.selectedSideStepLeft.calibration.startAngle;
                        selSideStep = avatar.selectedSideStepLeft;

                    } else {

                        motion.frequencyTimeWheelPos = avatar.selectedSideStepRight.calibration.startAngle;
                        selSideStep = avatar.selectedSideStepRight;
                    }
                    setTransition(selSideStep, playTransitionActions);
                    state.setInternalState(state.SIDE_STEP);

                } else if (motion.direction === LEFT) {

                    if (motion.lastDirection !== LEFT) {

                        motion.frequencyTimeWheelPos = avatar.selectedSideStepLeft.calibration.startAngle;
                    }
                    selSideStep = avatar.selectedSideStepLeft;

                } else {

                    if (motion.lastDirection !== RIGHT) {

                        motion.frequencyTimeWheelPos = avatar.selectedSideStepRight.calibration.startAngle;
                    }
                    selSideStep = avatar.selectedSideStepRight;
                }
                if (avatar.currentAnimation !== selSideStep) {

                    setTransition(selSideStep, playTransitionActions);
                }
                break;
            }

            case state.FLYING: {

                // blend the up, down and forward flying animations relative to motion direction
                animationOperations.zeroAnimation(avatar.selectedFlyBlend);

                // calculate influences
                var upComponent = motion.velocity.y > 0 ? motion.velocity.y / motion.speed : 0;
                var downComponent = motion.velocity.y < 0 ? -motion.velocity.y / motion.speed : 0;
                var forwardComponent = motion.velocity.z / motion.speed;
                var speedComponent = Math.abs(motion.velocity.z / TOP_SPEED);
                var soaringComponent = Vec3.length(MyAvatar.getAngularAcceleration()) / ANGULAR_ACCELERATION_MAX;

                //print('MyAvatar.getAngularAcceleration(): '+MyAvatar.getAngularAcceleration().length);

                // add damping
                upComponent = flyUpFilter.process(upComponent);
                downComponent = flyDownFilter.process(downComponent);
                soaringComponent = soaringFilter.process(soaringComponent);

                // normalise components
                var denominator = upComponent + downComponent + Math.abs(forwardComponent) + speedComponent + soaringComponent;
                upComponent = upComponent / denominator;
                downComponent = downComponent / denominator;
                forwardComponent = forwardComponent / denominator;
                speedComponent = speedComponent / denominator;
                soaringComponent = soaringComponent / denominator;

                // sum the components
                animationOperations.blendAnimation(avatar.selectedFlyUp,
                                         avatar.selectedFlyBlend,
                                         upComponent);

                animationOperations.blendAnimation(avatar.selectedFlyDown,
                                         avatar.selectedFlyBlend,
                                         downComponent);

                animationOperations.blendAnimation(avatar.selectedRapidFly,
                                         avatar.selectedFlyBlend,
                                         speedComponent);

                animationOperations.blendAnimation(avatar.selectedSoarFly,
                                         avatar.selectedFlyBlend,
                                         soaringComponent);

                animationOperations.blendAnimation(avatar.selectedFly,
                                         avatar.selectedFlyBlend,
                                         Math.abs(forwardComponent));

                if (state.currentState !== state.FLYING) {

                    state.setInternalState(state.FLYING);
                }
                if (avatar.currentAnimation !== avatar.selectedFlyBlend) {

                    setTransition(avatar.selectedFlyBlend, playTransitionActions);
                }
                break;
            }

        } // end switch(locomotionMode)

    } // end if editing REMOVE_FOR_RELEASE
}

// advance the frequency time wheels. advance frequency time wheels for any live transitions
function turnFrequencyTimeWheels() {

    var wheelAdvance = 0;

    // turn the frequency time wheel
    if (avatar.currentAnimation === avatar.selectedWalk ||
        avatar.currentAnimation === avatar.selectedSideStepLeft ||
        avatar.currentAnimation === avatar.selectedSideStepRight) {

        // Using technique described here: http://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approach
        // wrap the stride length around a 'surveyor's wheel' twice and calculate the angular speed at the given (linear) speed
        // omega = v / r , where r = circumference / 2 PI , where circumference = 2 * stride length
        var speed = Vec3.length(motion.velocity);
        motion.frequencyTimeWheelRadius = avatar.calibration.strideLength / Math.PI;
        var angularVelocity = speed / motion.frequencyTimeWheelRadius;

        // calculate the degrees turned (at this angular speed) since last frame
        wheelAdvance = filter.radToDeg(motion.deltaTime * angularVelocity);

        // if we are in an edit mode, we will need fake time to turn the wheel - REMOVE_FOR_RELEASE
        if (state.currentState !== state.WALKING &&
            state.currentState !== state.SIDE_STEP) {

            wheelAdvance = avatar.currentAnimation.calibration.frequency / 70;
        }

        // show stats and walk wheel REMOVE_FOR_RELEASE
        if(walkTools) walkTools.updateFrequencyTimeWheelStats(motion.deltaTime, speed, motion.frequencyTimeWheelRadius, wheelAdvance);

    } else {

        // turn the frequency time wheel by the amount specified for this animation
        wheelAdvance = filter.radToDeg(avatar.currentAnimation.calibration.frequency * motion.deltaTime);

        // show stats and walk wheel REMOVE_FOR_RELEASE
        if(walkTools) walkTools.updateFrequencyTimeWheelStats(motion.deltaTime, motion.speed, 0.5, wheelAdvance);
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
    if(walkTools) walkTools.updateTransitionFTWheelStats(motion.deltaTime, motion.speed);
    if (avatar.currentAnimation.calibration.frequency === 0) {
        if(walkTools) motion.frequencyTimeWheelPos = walkTools.getCyclePosition();
    } else

    // advance the walk wheel the appropriate amount
    motion.advanceFrequencyTimeWheel(wheelAdvance);
}

// if the timing's right, recalculate the stride length. if not, fetch the previously calculated value
function setStrideLength() {

    // if not at full speed the calculation could be wrong, as we may still be transitioning
    var atMaxSpeed = motion.speed / MAX_WALK_SPEED < 0.97 ? false : true;

    // walking? then get the stride length
    if (avatar.currentAnimation === motion.selectedWalk) {

        var strideMaxAt = avatar.currentAnimation.calibration.strideMaxAt;
        if (motion.direction === BACKWARDS) {

            strideMaxAt = avatar.currentAnimation.calibration.backwardsStrideMaxAt;
        }

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

    // sidestepping? get the stride length
    if (avatar.currentAnimation === motion.selectedSideStepLeft ||
        avatar.currentAnimation === motion.selectedSideStepRight) {

        // if the timing's right, take a snapshot of the stride max and recalibrate the stride length
        var tolerance = 1.0;
        if (motion.direction === LEFT) {

            if (motion.frequencyTimeWheelPos < avatar.currentAnimation.calibration.strideMaxAt + tolerance &&
                motion.frequencyTimeWheelPos > avatar.currentAnimation.calibration.strideMaxAt - tolerance &&
                atMaxSpeed && motion.currentTransition === nullTransition) {

                var footRPos = MyAvatar.getJointPosition("RightFoot");
                var footLPos = MyAvatar.getJointPosition("LeftFoot");
                avatar.calibration.strideLength = Vec3.distance(footRPos, footLPos);
                avatar.currentAnimation.calibration.strideLength = avatar.calibration.strideLength;

            } else {

                avatar.calibration.strideLength = avatar.selectedSideStepLeft.calibration.strideLength;
            }

        } else if (motion.direction === RIGHT) {

            if (motion.frequencyTimeWheelPos < avatar.currentAnimation.calibration.strideMaxAt + tolerance &&
                motion.frequencyTimeWheelPos > avatar.currentAnimation.calibration.strideMaxAt - tolerance &&
                atMaxSpeed && motion.currentTransition === nullTransition) {

                var footRPos = MyAvatar.getJointPosition("RightFoot");
                var footLPos = MyAvatar.getJointPosition("LeftFoot");
                avatar.calibration.strideLength = Vec3.distance(footRPos, footLPos);
                avatar.currentAnimation.calibration.strideLength = avatar.calibration.strideLength;

            } else {

                avatar.calibration.strideLength = avatar.selectedSideStepRight.calibration.strideLength;
            }
        }
    } // end get sidestep stride length
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
    if(motion.speed > 0) {
        linearContribution = (Math.log(motion.speed / TOP_SPEED) + 8) / 8;
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

// check for existence of object property (e.g. animation waveform synthesis filters)
function isDefined(value) {

    try {
        if (typeof value != 'undefined') return true;
    } catch (e) {
        return false;
    }
}

// animate the avatar using sine waves, geometric waveforms and harmonic generators
function renderMotion() {

    // leaning in response to speed and acceleration
    var leanPitch = getLeanPitch();
    var leanRoll = getLeanRoll();
    var lastDirection = motion.lastDirection;

    // hips translations from currently playing animations
    var hipsTranslations = undefined;
    if (motion.currentTransition !== nullTransition) {

        // maintain previous direction when transitioning from a walk
        //if (motion.currentTransition.lastAnimation === avatar.selectedWalk) {

            //lastDirection = motion.currentTransition.lastDirection;
        //}
        hipsTranslations = motion.currentTransition.blendTranslations(motion.frequencyTimeWheelPos,
                                                                      lastDirection);

    } else {

        hipsTranslations = animationOperations.calculateTranslations(avatar.currentAnimation,
                                                                     motion.frequencyTimeWheelPos,
                                                                     motion.direction);
    }

    // apply transitions from any live actions
    if (liveActions.actionsCount() > 0) {

        for (action in liveActions.actions) {

            var actionStrength = filter.bezier(liveActions.actions[action].currentStrength(), {x:1, y:0}, {x:0, y:1});
            var poseTranslations = animationOperations.calculateTranslations(
                                                         walkAssets.getReachPose(liveActions.actions[action].reachPose),
                                                         motion.frequencyTimeWheelPos,
                                                         motion.direction);
            if(Math.abs(poseTranslations.x) > 0) {

                hipsTranslations.x = actionStrength * poseTranslations.x +
                                    (1 - actionStrength) * hipsTranslations.x;
            }

            if(Math.abs(poseTranslations.y) > 0) {

                hipsTranslations.y = actionStrength * poseTranslations.y +
                                    (1 - actionStrength) * hipsTranslations.y;
            }

            if(Math.abs(poseTranslations.z) > 0) {

                hipsTranslations.z = actionStrength * poseTranslations.z +
                                    (1 - actionStrength) * hipsTranslations.z;
            }
        }
    }/**/

    // factor any leaning into the hips offset - bad effect after Bullet added
    //hipsTranslations.z += avatar.calibration.hipsToFeet * Math.sin(filter.degToRad(leanPitch));
    //hipsTranslations.x += avatar.calibration.hipsToFeet * Math.sin(filter.degToRad(leanRoll));

    // keep skeleton offsets within 1m limit
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

                //footDownLeft = motion.currentTransition.lastAnimation.calibration.footDownLeft;
                //footDownRight = motion.currentTransition.lastAnimation.calibration.footDownRight;
                ftWheelPosition = motion.currentTransition.lastFrequencyTimeWheelPos;

            } //else if (groundPlaneMotion) {

            //    footDownLeft = motion.currentTransition.nextAnimation.calibration.footDownLeft;
            //    footDownRight = motion.currentTransition.nextAnimation.calibration.footDownRight;
            //}

        }// else if (groundPlaneMotion) {

        //    footDownLeft = avatar.currentAnimation.calibration.footDownLeft;
        //    footDownRight = avatar.currentAnimation.calibration.footDownRight;
        //}

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

            // apply rotations from any live actions
            if (liveActions.actionsCount() > 0) {

                for (action in liveActions.actions) {

                    var actionStrength = filter.bezier(liveActions.actions[action].currentStrength(), {x:1, y:0}, {x:0, y:1});
                    var poseRotations = animationOperations.calculateRotations(jointName,
                                                           walkAssets.getReachPose(liveActions.actions[action].reachPose),
                                                           motion.frequencyTimeWheelPos,
                                                           motion.direction);
                    if(Math.abs(poseRotations.x) > 0) {

                        jointRotations.x = actionStrength * poseRotations.x +
                                         (1 - actionStrength) * jointRotations.x;
                    }

                    if(Math.abs(poseRotations.y) > 0) {

                        jointRotations.y = actionStrength * poseRotations.y +
                                         (1 - actionStrength) * jointRotations.y;
                    }

                    if(Math.abs(poseRotations.z) > 0) {

                        jointRotations.z = actionStrength * poseRotations.z +
                                         (1 - actionStrength) * jointRotations.z;
                    }
                }
            }

            // apply lean
            if (jointName === "Hips") {

                jointRotations.x += leanPitch;
                jointRotations.z += leanRoll;
            }

            // scope currently selected joint REMOVE_FOR_RELEASE
            /*if (jointName === walkTools.selectedJoint()) {

                //var accn = MyAvatar.getAcceleration();
                //var accn = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), MyAvatar.getAcceleration());

                //scopeProbe1 = hipsTranslations.x; //accn.z;
                //scopeProbe2 = hipsTranslations.y; //motion.acceleration.z
                //scopeProbe3 = hipsTranslations.z; //motion.velocity.z;

                scopeProbe1 = jointRotations.x * scopePreAmp;
                scopeProbe2 = jointRotations.y * scopePreAmp;
                scopeProbe3 = jointRotations.z * scopePreAmp;

                //scopeProbe1 = hipsTranslations.x * 100 * scopePreAmp;
                //scopeProbe2 = hipsTranslations.y * 100 * scopePreAmp;//hipsTranslations
                //scopeProbe3 = hipsTranslations.z * 100 * scopePreAmp;//jointRotations
            }*/

            // apply rotation
            MyAvatar.setJointData(jointName, Quat.fromVec3Degrees(jointRotations));
        }
    }
}