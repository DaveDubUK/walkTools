//
//  walk.js
//  version 2.0
//
//  Created by David Wooldridge, June 2015
//  Copyright © 2014 - 2015 High Fidelity, Inc.
//
//  Animates an avatar using procedural animation techniques combined with harmonics sampled from motion capture data.
//
//  Editing tools available here: https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// animations, reach poses, reach pose parameters, transitions, transition parameters, sounds, image/s and reference files
//const HIFI_PUBLIC_BUCKET = "https://hifi-public.s3.amazonaws.com/";
//var pathToAssets = HIFI_PUBLIC_BUCKET + "procedural-animator/assets/";
var pathToAssets = 'http://localhost/downloads/hf/scripts/walk-2.0-beta/assets/'; // path to local copy of assets folder - REMOVE_FOR_RELEASE
//var pathToAssets = "https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/assets/"

print('walk.js: Loading assets from ' + pathToAssets);

Script.include([
    "./libraries/walkConstants.js",
    "./libraries/walkFilters.js",
    "./libraries/walkApi.js",
    pathToAssets + "walkAssets.js"
]);

// construct Avatar, Motion and (null) Transition
var avatar = new Avatar();
var motion = new Motion();
var nullTransition = new Transition();
motion.currentTransition = nullTransition;

// create settings (gets initial values from avatar)
Script.include("./libraries/walkSettings.js");

// calibrate script for this avatar
//avatar.calibrate();

/////////////////////////////////////////////
//
// load walkTools - WALKTOOLS_ONLY ...
//
// extra vars
var walkTools = null;
var walkToolsOscilloscope = null;
var bezierCurveEditor = null;
// walkTools core
Script.include('./walkTools/walkTools.js');
// values assigned to these will be displayed on the oscilloscope
scopeProbe1 = 0;
scopeProbe2 = 0;
scopeProbe3 = 0;
scopePreAmp = 1.66666;/**/ // scales +-180 degrees to scope height
//
// ... / load walkTools - WALKTOOLS_ONLY
//
////////////////////////////////////////////

// Main loop
Script.update.connect(function(deltaTime) { try {
/////////////////////////////////////////////
//
// walkTools - WALKTOOLS_ONLY ...
//
if (walkTools) walkTools.beginProfiling(deltaTime);

    if (motion.isLive) {

        // assess current locomotion state
        motion.assess(deltaTime);

        // decide which animation should be playing
        composeAnimation();

        // advance the animation cycle/s by the correct amount/s
        advanceAnimations();

        // update the progress of any live transitions
        updateTransitions();

        // apply translation and rotations
        renderMotion();

        // save this frame's parameters
        motion.saveHistory();

        // REMOVE_FOR_RELEASE
        if (walkToolsOscilloscope) {
			var selectedJoint = walkTools.currentlySelectedJoint();
			var selectedIKChain = walkAssets.animationReference.joints[selectedJoint].IKChain;
			walkToolsOscilloscope.updateScopeData(
                {
					title: 'Joint '+walkToolsEditor.editMode()+' data',
					metaDataLabel: 'FT Wheel',
					metaData: motion.frequencyTimeWheelPos.toFixed(1)+' deg',
					joint: selectedJoint,
					iKChain: selectedIKChain,
					ch1: scopeProbe1,
					ch2: scopeProbe2,
					ch3: scopeProbe3
				}   
			);
            /*
				{
					title: 'speed, acceleration, yaw delta accn.',
					metaDataLabel: 'FT Wheel',
					metaData: motion.frequencyTimeWheelPos.toFixed(1)+' deg',
					joint: selectedJoint,
					iKChain: selectedIKChain,
					ch1: scopeProbe1,
					ch2: scopeProbe2,
					ch3: scopeProbe3
				}        
            
            ); */
        }
        //
        // ... / load walkTools - WALKTOOLS_ONLY
        //
        ////////////////////////////////////////////
    }
    if (walkTools) walkTools.updateStats();
    } catch(e) { print('walk.js general error: '+e.toString());}}); // WALKTOOLS_ONLY

// helper function for composeAnimation()
function setTransition(nextAnimation, playTransitionReachPoses, inAnticipation) {
    var lastTransition = motion.currentTransition;
    var lastAnimation = avatar.currentAnimation;

    // if already transitioning from a blended walk need to maintain the previous walk's direction
    if (lastAnimation.lastDirection) {
        switch(lastAnimation.lastDirection) {

            case FORWARDS:
                lastAnimation = avatar.selectedWalk;
                break;

            case BACKWARDS:
                lastAnimation = avatar.selectedWalkBackwards;
                break;

            case LEFT:
                lastAnimation = avatar.selectedSideStepLeft;
                break;

            case RIGHT:
                lastAnimation = avatar.selectedSideStepRight;
                break;
        }
    }

    motion.currentTransition = new Transition(nextAnimation, lastAnimation, lastTransition, playTransitionReachPoses);
    avatar.currentAnimation = nextAnimation;

    // reset default first footstep
    if (nextAnimation === avatar.selectedWalkBlend && lastTransition === nullTransition) {
        avatar.nextStep = RIGHT;
    }
}

// fly animation blending: smoothing / damping filters
const FLY_BLEND_DAMPING = 50;
var verticalFilter = filter.createAveragingFilter(FLY_BLEND_DAMPING);
var lateralFilter = filter.createAveragingFilter(FLY_BLEND_DAMPING);
var forwardFilter = filter.createAveragingFilter(FLY_BLEND_DAMPING);
var turningFilter = filter.createAveragingFilter(FLY_BLEND_DAMPING);
var slowFlyFilter = filter.createAveragingFilter(FLY_BLEND_DAMPING);

// select / blend the appropriate animation for the current state of motion
function composeAnimation() {
// walkTools - WALKTOOLS_ONLY - not possible to edit in release version
// check for editing modes first, as these require no positioning calculations
if (motion.state !== EDIT) {
    var playTransitionReachPoses = true;

    // select appropriate animation. create transitions where appropriate
    switch (motion.nextState) {
        case STATIC: {
            
            if (avatar.distanceFromSurface <= ON_SURFACE_THRESHOLD) {
                
                if (motion.yawDelta < -YAW_THRESHOLD && 
                    avatar.currentAnimation !== avatar.selectedTurnLeft) {
                    setTransition(avatar.selectedTurnLeft, playTransitionReachPoses);
                } else if (motion.yawDelta > YAW_THRESHOLD && 
                            avatar.currentAnimation !== avatar.selectedTurnRight) {
                    setTransition(avatar.selectedTurnRight, playTransitionReachPoses);
                } else if (motion.yawDelta > -YAW_THRESHOLD && motion.yawDelta < YAW_THRESHOLD &&
                           avatar.currentAnimation !== avatar.selectedIdle) {
                    setTransition(avatar.selectedIdle, playTransitionReachPoses);
                }            
            } else if (avatar.distanceFromSurface > ON_SURFACE_THRESHOLD &&
                       avatar.currentAnimation !== avatar.selectedHover) {
                setTransition(avatar.selectedHover, playTransitionReachPoses);
            }
            motion.state = STATIC;
            avatar.selectedWalkBlend.lastDirection = NONE;
            break;
        }

        case SURFACE_MOTION: {
            // walk transition reach poses are currently only specified for starting to walk forwards
            playTransitionReachPoses = (motion.direction === FORWARDS);
            var isAlreadyWalking = (avatar.currentAnimation === avatar.selectedWalkBlend);

            switch (motion.direction) {
                case FORWARDS:
                    if (avatar.selectedWalkBlend.lastDirection !== FORWARDS) {
                        animationOperations.deepCopy(avatar.selectedWalk, avatar.selectedWalkBlend);
                    }
                    avatar.selectedWalkBlend.lastDirection = FORWARDS;
                    break;

                case BACKWARDS:
                    if (avatar.selectedWalkBlend.lastDirection !== BACKWARDS) {
                        animationOperations.deepCopy(avatar.selectedWalkBackwards, avatar.selectedWalkBlend);
                    }
                    avatar.selectedWalkBlend.lastDirection = BACKWARDS;
                    break;

                case LEFT:
                    animationOperations.deepCopy(avatar.selectedSideStepLeft, avatar.selectedWalkBlend);
                    avatar.selectedWalkBlend.lastDirection = LEFT;
                    break

                case RIGHT:
                    animationOperations.deepCopy(avatar.selectedSideStepRight, avatar.selectedWalkBlend);
                    avatar.selectedWalkBlend.lastDirection = RIGHT;
                    break;

                default:
                    // condition occurs when the avi goes through the floor due to collision hull errors
                    animationOperations.deepCopy(avatar.selectedWalk, avatar.selectedWalkBlend);
                    avatar.selectedWalkBlend.lastDirection = FORWARDS;
                    break;
            }

            if (!isAlreadyWalking && !motion.isComingToHalt) {
                setTransition(avatar.selectedWalkBlend, playTransitionReachPoses);
            }
            motion.state = SURFACE_MOTION;
            break;
        }

        case AIR_MOTION: {
            // blend the up, down, forward and backward flying animations relative to motion speed and direction
            animationOperations.zeroAnimation(avatar.selectedFlyBlend);

            // calculate influences based on velocity and direction
            var speed = Vec3.length(motion.velocity);
            var sumOfSpeeds = Math.abs(motion.velocity.x) + 
                              Math.abs(motion.velocity.y) + 
                              Math.abs(motion.velocity.z);
            var verticalProportion = motion.velocity.y / sumOfSpeeds;
            var lateralProportion = motion.velocity.x / sumOfSpeeds;
            var forwardProportion = -motion.velocity.z / sumOfSpeeds;
            
            // factor in slow flying and turning influences (overwrite velocity / direction influences)
            const FLY_SPEED_MULTIPLIER = 2;
            var flyingSlowlySpeed = MAX_WALK_SPEED * FLY_SPEED_MULTIPLIER * 
                                   (GRAVITY_THRESHOLD - avatar.distanceFromSurface) > 0 ?
                                    MAX_WALK_SPEED * FLY_SPEED_MULTIPLIER * 
                                   (GRAVITY_THRESHOLD - avatar.distanceFromSurface) : 0;
            var slowFlyComponent = speed > flyingSlowlySpeed ? 0 :
                                   (flyingSlowlySpeed - speed) / flyingSlowlySpeed;
            // only use slow flying animation when moving forwards
            slowFlyComponent *= motion.direction === FORWARDS ? 1 : 0;
            var turningComponent = Math.abs(motion.yawDelta) / DELTA_YAW_MAX > 1 ? 1 :
                                   Math.abs(motion.yawDelta) / DELTA_YAW_MAX;   
            turningComponent *= (1 - slowFlyComponent); // reduce turning influence at low speeds
            // final proportions      
            var overallDirectionInfluence = 1 - slowFlyComponent - turningComponent > 0 ?
                                            1 - slowFlyComponent - turningComponent : 0;
            verticalProportion *= overallDirectionInfluence;
            lateralProportion *= overallDirectionInfluence;
            forwardProportion *= overallDirectionInfluence;
              
            /*print('Fly blend components: verticalProportion: '+verticalProportion.toFixed(2)+
                                       ' lateralProportion: '+lateralProportion.toFixed(2)+
                                       ' forwardProportion: '+forwardProportion.toFixed(2)+
                                       ' slowFlyComponent: '+slowFlyComponent.toFixed(2)+
                                       ' turningComponent: '+turningComponent.toFixed(2)+
                                       ' overallDirectionInfluence: '+overallDirectionInfluence.toFixed(2));*/
                                       
     
            // smooth / damp to add visual 'weight'         
            verticalProportion = verticalFilter.process(verticalProportion);
            lateralProportion = lateralFilter.process(lateralProportion);
            forwardProportion = forwardFilter.process(forwardProportion);
            slowFlyComponent = turningFilter.process(slowFlyComponent);
            turningComponent = slowFlyFilter.process(turningComponent);

            // blend animations proportionally
            if (verticalProportion > 0) {
                avatar.currentAnimation.calibration.frequency = avatar.selectedFlyUp.calibration.frequency
                animationOperations.blendAnimation(avatar.selectedFlyUp,
                                         avatar.selectedFlyBlend,
                                         verticalProportion);
            }
            if (verticalProportion < 0) {
                avatar.currentAnimation.calibration.frequency = avatar.selectedFlyDown.calibration.frequency
                animationOperations.blendAnimation(avatar.selectedFlyDown,
                                     avatar.selectedFlyBlend,
                                     -verticalProportion);
            }
            if (forwardProportion > 0) {
                avatar.currentAnimation.calibration.frequency = avatar.selectedFly.calibration.frequency
                animationOperations.blendAnimation(avatar.selectedFly,
                                     avatar.selectedFlyBlend,
                                     forwardProportion);
            }
            if (forwardProportion < 0) {
                avatar.currentAnimation.calibration.frequency = avatar.selectedFlyBackwards.calibration.frequency
                animationOperations.blendAnimation(avatar.selectedFlyBackwards,
                                     avatar.selectedFlyBlend,
                                     -forwardProportion);
            }
            if (slowFlyComponent > 0) {
                avatar.currentAnimation.calibration.frequency = avatar.selectedFlySlow.calibration.frequency
                animationOperations.blendAnimation(avatar.selectedFlySlow,
                                     avatar.selectedFlyBlend,
                                     slowFlyComponent);
            }
            if (turningComponent > 0) {
                avatar.currentAnimation.calibration.frequency = avatar.selectedFlyTurning.calibration.frequency
                animationOperations.blendAnimation(avatar.selectedFlyTurning,
                                     avatar.selectedFlyBlend,
                                     turningComponent);
            }
            
            // set transition?
            if (avatar.currentAnimation !== avatar.selectedFlyBlend) {
                setTransition(avatar.selectedFlyBlend, playTransitionReachPoses);
            }
            motion.state = AIR_MOTION;
            avatar.selectedWalkBlend.lastDirection = NONE;
            break;
        }
    } // end switch next state of motion
} // / walkTools - REMOVE_FOR_RELEASE - not possible to edit in release version
}

// determine the length of stride. advance the frequency time wheels. advance frequency time wheels for any live transitions
function advanceAnimations() {
    var wheelAdvance = 0;

    if (avatar.currentAnimation === avatar.selectedWalkBlend) {
        // Using technique described here: http://www.gdcvault.com/play/1020583/Animation-Bootcamp-An-Indie-Approach
        // wrap the stride length around a 'surveyor's wheel' twice and calculate the angular speed at the given (linear) speed
        // omega = v / r , where r = circumference / 2 PI and circumference = 2 * stride length
        var speed = Vec3.length(motion.velocity);
        motion.frequencyTimeWheelRadius = avatar.currentAnimation.calibration.strideLength / Math.PI;
        var ftWheelAngularVelocity = speed / motion.frequencyTimeWheelRadius;
        // calculate the degrees turned (at this angular speed) since last frame
        wheelAdvance = filter.radToDeg(motion.deltaTime * ftWheelAngularVelocity);
    } else {
        // turn the frequency time wheel by the amount specified for this animation
        wheelAdvance = filter.radToDeg(avatar.currentAnimation.calibration.frequency * motion.deltaTime);
    }

    // walkTools - show stats and walk wheel - REMOVE_FOR_RELEASE
    if (walkTools) walkTools.updateFrequencyTimeWheelStats(
                        motion.deltaTime, 
                        Vec3.length(motion.velocity),
                        motion.frequencyTimeWheelRadius,
                        wheelAdvance);

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

    // avoid unnaturally fast walking when landing at speed - simulates skimming / skidding
    //if (Math.abs(wheelAdvance) > MAX_FT_WHEEL_INCREMENT) {
    //    wheelAdvance = 0;
    //}

    // walkTools - REMOVE_FOR_RELEASE
    if (avatar.currentAnimation.calibration.frequency === 0) {
        if (walkTools) {
            motion.frequencyTimeWheelPos = walkTools.ftWheelPosition();
        }
    } else

    // advance the walk wheel the appropriate amount
    motion.advanceFrequencyTimeWheel(wheelAdvance);

    // Automatic stride length calibration is disabled, as calls to MyAvatar.getJointPosition are taking > 16 mS to execute
    // bug report submitted here: https://worklist.net/20680
    // walking? then see if it's a good time to measure the stride length (need to be at least 97% of max walking speed)
    /*const ALMOST_ONE = 0.97;
    if (avatar.currentAnimation === avatar.selectedWalkBlend &&
       (Vec3.length(motion.velocity) / MAX_WALK_SPEED > ALMOST_ONE)) {

        var strideMaxAt = avatar.currentAnimation.calibration.strideMaxAt;
        const TOLERANCE = 1.0;

        if (motion.frequencyTimeWheelPos < (strideMaxAt + TOLERANCE) &&
            motion.frequencyTimeWheelPos > (strideMaxAt - TOLERANCE) &&
            motion.currentTransition === nullTransition) {
            // measure and save stride length
            var footRPos = MyAvatar.getJointPosition("RightFoot");
            var footLPos = MyAvatar.getJointPosition("LeftFoot");
            avatar.currentAnimation.calibration.strideLength = Vec3.distance(footRPos, footLPos);
            //print('Recalibrated stride length to '+avatar.currentAnimation.calibration.strideLength);
        }
    }*/
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
        if (motion.currentTransition.updateProgress() === TRANSITION_COMPLETE) {
            //walkTools.toLog('Transition from '+motion.currentTransition.lastAnimation.name+
            //                ' to '+motion.currentTransition.nextAnimation.name+' complete'); 
            motion.currentTransition = nullTransition;
        }
    }
}

// helper function for renderMotion(). calculate the amount to lean forwards (or backwards) based on the avi's velocity
var leanPitchSmoothingFilter = filter.createButterworthFilter();
function getLeanPitch() {
    var leanProgress = 0;

    if (motion.direction === DOWN ||
        motion.direction === FORWARDS ||
        motion.direction === BACKWARDS) {
        leanProgress = -motion.velocity.z / TOP_SPEED;
    }
    // use filters to shape the walking acceleration response
    leanProgress = leanPitchSmoothingFilter.process(leanProgress);
    return PITCH_MAX * leanProgress;
}

// helper function for renderMotion(). calculate the angle at which to bank into corners whilst turning
var leanRollSmoothingFilter = filter.createAveragingFilter(20);
function getLeanRoll() {
    var leanRollProgress = 0;
    var linearContribution = 0;
    const LOG_SCALER = 8;

    if (Vec3.length(motion.velocity) > 0) {
        linearContribution = (Math.log(Vec3.length(motion.velocity) / TOP_SPEED) + LOG_SCALER) / LOG_SCALER;
    }
    var angularContribution = Math.min(Math.abs(motion.yawDelta) / DELTA_YAW_MAX, 1);
    leanRollProgress = linearContribution;
    leanRollProgress *= angularContribution;
    // shape the response curve
    leanRollProgress = filter.bezier(leanRollProgress, {x: 1, y: 0}, {x: 1, y: 0});
    // which way to lean?
    var turnSign = (motion.yawDelta >= 0) ? 1 : -1;

    if (motion.direction === BACKWARDS ||
        motion.direction === LEFT) {
        turnSign *= -1;
    }
    // filter progress
    leanRollProgress = leanRollSmoothingFilter.process(turnSign * leanRollProgress);
    return ROLL_MAX * leanRollProgress;
}

// animate the avatar using sine waves, geometric waveforms and harmonic generators
function renderMotion() {    
    // leaning in response to speed and acceleration
    var leanPitch = motion.state === SURFACE_MOTION ? getLeanPitch() : 0;
    var leanRoll = motion.state === STATIC ? 0 : getLeanRoll();
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
    
    // animation translations are calibrated for a 1m hips to feet height, so we adjust for this particular avatar
    hipsTranslations = Vec3.multiply(hipsTranslations, avatar.calibration.hipsToFeet);
    
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

    // play footsteps sound?
    var producingFootstepSounds = (avatar.currentAnimation === avatar.selectedWalkBlend) && avatar.makesFootStepSounds;
    // is there an animation in the transition that would make footstep sounds?
    if ((motion.currentTransition !== nullTransition && avatar.makesFootStepSounds) ||
        (motion.currentTransition.nextAnimation === avatar.selectedWalkBlend ||
         motion.currentTransition.lastAnimation === avatar.selectedWalkBlend)) {
            producingFootstepSounds = true;
    }

    if (producingFootstepSounds) {
        var ftWheelPosition = motion.frequencyTimeWheelPos;

        if (motion.currentTransition !== nullTransition &&
            motion.currentTransition.lastAnimation === avatar.selectedWalkBlend) {
            ftWheelPosition = motion.currentTransition.lastFrequencyTimeWheelPos;
        }
        if (avatar.nextStep === LEFT && ftWheelPosition > THREE_QUARTER_CYCLE) {
            avatar.makeFootStepSound();
        } else if (avatar.nextStep === RIGHT && (ftWheelPosition < THREE_QUARTER_CYCLE && ftWheelPosition > QUARTER_CYCLE)) {
            avatar.makeFootStepSound();
        }
    }

    // apply joint rotations
    for (jointName in avatar.currentAnimation.joints) {
        var joint = null;
        var jointRotations = {x:0, y:0, z:0};
        
        if (walkAssets.animationReference.joints[jointName]) {
            joint = walkAssets.animationReference.joints[jointName];
        }

        // ignore arms / head / fingers rotations (dependant on options selected in the settings)
        if (avatar.armsNotAnimated && (joint.IKChain === "LeftArm" || joint.IKChain === "RightArm" ||
            joint.IKParent === "LeftHand" || joint.IKParent === "RightHand") ||
            avatar.headNotAnimated && joint.IKChain === "Head") {
            continue;
        }

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
        
        // apply any pre-state change reach poses
        for (reachPose in motion.preReachPoses) {
            var reachPoseStrength = motion.preReachPoses[reachPose].currentStrength();
            var poseRotations = animationOperations.calculateRotations(jointName,
                                                   motion.preReachPoses[reachPose].animation,
                                                   motion.frequencyTimeWheelPos,
                                                   motion.direction);
                                                   
            // don't use Vec3 operations here, as if x,y or z is zero, the reach pose should not have any influence
            if (Math.abs(poseRotations.x) > 0) {
                jointRotations.x = reachPoseStrength * poseRotations.x + (1 - reachPoseStrength) * jointRotations.x;
            }
            if (Math.abs(poseRotations.y) > 0) {
                jointRotations.y = reachPoseStrength * poseRotations.y + (1 - reachPoseStrength) * jointRotations.y;
            }
            if (Math.abs(poseRotations.z) > 0) {
                jointRotations.z = reachPoseStrength * poseRotations.z + (1 - reachPoseStrength) * jointRotations.z;
            }
        }

        // apply angular velocity and speed induced leaning
        if (jointName === "Hips") {
            jointRotations.x += leanPitch;
            jointRotations.z += leanRoll;
        }

        // WALKTOOLS_ONLY - scope probes
        if (jointName === walkTools.currentlySelectedJoint()) {

            if (walkToolsEditor.editMode() === 'translation') {
                scopeProbe1 = hipsTranslations.x * 300;
                scopeProbe2 = hipsTranslations.y * 300;
                scopeProbe3 = hipsTranslations.z * 300;
            } else if (walkToolsEditor.editMode() === 'pre-rotation') {
                scopeProbe1 = walkAssets.preRotations.joints[jointName].x * scopePreAmp;
                scopeProbe2 = walkAssets.preRotations.joints[jointName].y * scopePreAmp;
                scopeProbe3 = walkAssets.preRotations.joints[jointName].z * scopePreAmp;
			} else {
                scopeProbe1 = jointRotations.x * scopePreAmp;
                scopeProbe2 = jointRotations.y * scopePreAmp;
                scopeProbe3 = jointRotations.z * scopePreAmp;
            }
        }/**/

        // apply rotations
        MyAvatar.setJointRotation(jointName, Quat.fromVec3Degrees(jointRotations));
    }
}