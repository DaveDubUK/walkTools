//
//  walkApi.js
//  version 1.4
//
//  Created by David Wooldridge, June 2015
//  Copyright © 2014 - 2015 High Fidelity, Inc.
//
//  Exposes API for use by walk.js version 1.2+.
//
//  Editing tools available here: https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// included here to ensure walkApi.js can be used as an API, separate from walk.js
Script.include("./libraries/walkConstants.js");

Avatar = function() {
    // if Hydras are connected, the only way to enable use is to never set any arm joint rotation
    this.hydraCheck = function() {
        // function courtesy of Thijs Wenker (frisbee.js)
        var numberOfButtons = Controller.getNumberOfButtons();
        var numberOfTriggers = Controller.getNumberOfTriggers();
        var numberOfSpatialControls = Controller.getNumberOfSpatialControls();
        const HYDRA_BUTTONS = 12;
        const HYDRA_TRIGGERS = 2;
        const HYDRA_CONTROLLERS_PER_TRIGGER = 2;
        var controllersPerTrigger = numberOfSpatialControls / numberOfTriggers;
        if (numberOfButtons == HYDRA_BUTTONS &&
            numberOfTriggers == HYDRA_TRIGGERS &&
            controllersPerTrigger == HYDRA_CONTROLLERS_PER_TRIGGER) {
            print('walk.js info: Razer Hydra detected. Setting arms free (not controlled by script)');
            return true;
        } else {
            print('walk.js info: Razer Hydra not detected. Arms will be controlled by script.');
            return false;
        }
    }
    // settings
    this.headNotAnimated = true; // 'true' means script will not animate the head (to avoid interfering with Oculus tracking)
    this.armsNotAnimated = this.hydraCheck(); // automatically sets true to enable Hydra support - temporary fix
    this.hasAnimatedFingers = true;
    this.makesFootStepSounds = true;
    this.isMissingPreRotations = false; // temporary fix

    // references to current animations
    this.loadAnimations = function() {
        this.selectedIdle = walkAssets.getAnimation("Idle");
        this.selectedWalk = walkAssets.getAnimation("Walk");
        this.selectedWalkBackwards = walkAssets.getAnimation("WalkBackwards");
        this.selectedSideStepLeft = walkAssets.getAnimation("SideStepLeft");
        this.selectedSideStepRight = walkAssets.getAnimation("SideStepRight");
        this.selectedTurnLeft = walkAssets.getAnimation("TurnLeft");
        this.selectedTurnRight = walkAssets.getAnimation("TurnRight");
        this.selectedWalkBlend = walkAssets.getAnimation("WalkBlend");
        this.selectedHover = walkAssets.getAnimation("Hover");
        this.selectedFly = walkAssets.getAnimation("Fly");
        this.selectedFlyBackwards = walkAssets.getAnimation("FlyBackwards");
        this.selectedFlyDown = walkAssets.getAnimation("FlyDown");
        this.selectedFlyUp = walkAssets.getAnimation("FlyUp");
        this.selectedFlyBlend = walkAssets.getAnimation("FlyBlend");
        this.selectedFlySlow = walkAssets.getAnimation("FlySlow");
        this.selectedFlyTurning = walkAssets.getAnimation("FlyTurning");
        this.currentAnimation = this.selectedIdle;
        return;
    }
    this.loadAnimations();

    // calibration
    this.calibration = {
        hipsToFeet: 1,
        strideLength: this.selectedWalk.calibration.strideLength
    }
    this.distanceFromSurface = 0;
    this.calibrate = function(quickCalibration) {
        quickCalibration = quickCalibration | false;
        print('walk.js: calibrating for avatar animation');
        // Triple check: measurements are taken three times to ensure accuracy - the first result is often too large
        const MAX_ATTEMPTS = 3;
        var attempts = MAX_ATTEMPTS;
        var extraAttempts = 0;
        do {
            for (joint in walkAssets.animationReference.joints) {
                var IKChain = walkAssets.animationReference.joints[joint].IKChain;

                // only need to zero right leg IK chain and hips
                if (IKChain === "RightLeg" || joint === "Hips" ) {
                    MyAvatar.setJointData(joint, Quat.fromPitchYawRollDegrees(0, 0, 0));
                }
            }
            this.calibration.hipsToFeet = MyAvatar.getJointPosition("Hips").y - MyAvatar.getJointPosition("RightToeBase").y;

            // maybe measuring avatar with no pre-rotations?
            if (this.calibration.hipsToFeet < 0 && this.isMissingPreRotations) {
                this.calibration.hipsToFeet *= -1;
            }

            if (this.calibration.hipsToFeet === 0 && extraAttempts < 100) {
                attempts++;
                extraAttempts++;// Interface can sometimes report zero for hips to feet. if so, we try again.
            }
        } while (attempts-- > 1)

        // measure the various stride lengths
        var animationsToCalibrate = ["Walk", "WalkBackwards", "SideStepLeft", "SideStepRight", "Run"];
        motion.state = EDIT;

        if (quickCalibration) {
            // if the max stride angle has already been calibrated
            // then we just need to calibrate stride length for this avatar

            for (animation in animationsToCalibrate) {
                var repeatedMeasurements = 0;
                do { // a few times for accuracy
                    this.currentAnimation = walkAssets.getAnimation(animationsToCalibrate[animation]);
                    for (jointName in this.currentAnimation.joints) {
                        var joint = null;
                        var jointRotations = {x:0, y:0, z:0};

                        if (walkAssets.animationReference.joints[jointName]) {
                            joint = walkAssets.animationReference.joints[jointName];
                        }
                        jointRotations = animationOperations.calculateRotations(jointName,
                                                            this.currentAnimation,
                                                            avatar.currentAnimation.calibration.strideMaxAt
                                                            , "None");
                        // apply rotations
                        MyAvatar.setJointData(jointName, Quat.fromVec3Degrees(jointRotations));
                    }
                    // measure and save stride length
                    var footRPos = MyAvatar.getJointPosition("RightFoot");
                    var footLPos = MyAvatar.getJointPosition("LeftFoot");
                    this.currentAnimation.calibration.strideLength = Vec3.distance(footRPos, footLPos);
                    print('Measurement '+repeatedMeasurements+': distance is '+Vec3.distance(footRPos, footLPos).toFixed(4));
                } while (++repeatedMeasurements < 3);
            }
        } else {
            // if the max stride angle has not yet been calibrated then do all
            const ACCURACY = 0.2;
            for (animation in animationsToCalibrate) {
                this.currentAnimation = walkAssets.getAnimation(animationsToCalibrate[animation]);
                this.currentAnimation.calibration.strideLength = 0;
                for (angle = 0 ; angle < FULL_CYCLE ; angle += ACCURACY) {
                    // apply joint rotations
                    for (jointName in this.currentAnimation.joints) {
                        var joint = null;
                        var jointRotations = {x:0, y:0, z:0};

                        if (walkAssets.animationReference.joints[jointName]) {
                            joint = walkAssets.animationReference.joints[jointName];
                        }
                        jointRotations = animationOperations.calculateRotations(jointName,
                                                            this.currentAnimation,
                                                            angle,
                                                            "None");
                        // apply rotations
                        MyAvatar.setJointData(jointName, Quat.fromVec3Degrees(jointRotations));
                    }
                    // measure and save stride length
                    var footRPos = MyAvatar.getJointPosition("RightFoot");
                    var footLPos = MyAvatar.getJointPosition("LeftFoot");
                    var strideLength = Vec3.distance(footRPos, footLPos);
                    if (strideLength > this.currentAnimation.calibration.strideLength) {
                        this.currentAnimation.calibration.strideLength = strideLength;
                        this.currentAnimation.calibration.strideMaxAt = angle;
                    }
                    print('walk.js info: Calibration '+this.currentAnimation.name+': '+(100 * angle / FULL_CYCLE).toFixed(2)+'% complete');
                }
            }
        }

        // final checks
        for (animation in animationsToCalibrate) {
            print('walk.js info: Stride length for '+walkAssets.getAnimation(animationsToCalibrate[animation]).name+
                  ' is ' + walkAssets.getAnimation(animationsToCalibrate[animation]).calibration.strideLength.toFixed(4)+
                  ' at ' + walkAssets.getAnimation(animationsToCalibrate[animation]).calibration.strideMaxAt.toFixed(1)+
                  ' degreees');
        }
        if (this.calibration.hipsToFeet <= 0 || isNaN(this.calibration.hipsToFeet)) {
            this.calibration.hipsToFeet = 1;
            print('walk.js error: Unable to get a non-zero measurement for the avatar hips to feet measure. Hips to feet set to default value ('+
                  this.calibration.hipsToFeet.toFixed(3)+'m). This will cause some foot sliding. If your avatar has only just appeared, it is recommended that you re-load the walk script.');
        } else {
            print('walk.js info: Hips to feet calibrated to '+this.calibration.hipsToFeet.toFixed(3)+'m');
        }

        // resume
        motion.state = STATIC;
        this.currentAnimation = this.selectedIdle;
    }

    // footsteps
    this.nextStep = RIGHT; // the first step is right, because the waveforms say so
    this.leftAudioInjector = null;
    this.rightAudioInjector = null;
    this.makeFootStepSound = function() {
        // correlate footstep volume with avatar speed. place the audio source at the feet, not the hips
        const SPEED_THRESHOLD = 0.4;
        const VOLUME_ATTENUATION = 0.5;
        const MIN_VOLUME = 0.3;
        var volume = Vec3.length(motion.velocity) > SPEED_THRESHOLD ?
                     VOLUME_ATTENUATION * Vec3.length(motion.velocity) / MAX_WALK_SPEED : MIN_VOLUME;
        volume = volume > 1 ? 1 : volume; // occurs when landing at speed - can be walking faster than max walk speed
        var options = {
            position: Vec3.sum(MyAvatar.position, {x:0, y: -this.calibration.hipsToFeet, z:0}),
            volume: volume
        };

        if (this.nextStep === RIGHT) {
            if (this.rightAudioInjector === null) {
                this.rightAudioInjector = Audio.playSound(walkAssets.getSound("FootStepLeft").audioData, options);
            } else {
                this.rightAudioInjector.setOptions(options);
                this.rightAudioInjector.restart();
            }
            this.nextStep = LEFT;
        } else if (this.nextStep === LEFT) {
            if (this.leftAudioInjector === null) {
                this.leftAudioInjector = Audio.playSound(walkAssets.getSound("FootStepRight").audioData, options);
            } else {
                this.leftAudioInjector.setOptions(options);
                this.leftAudioInjector.restart();
            }
            this.nextStep = RIGHT;
        }
    }
};

// constructor for the Motion object
Motion = function() {
    this.isLive = true;
    // locomotion status
    this.state = STATIC;
    this.nextState = STATIC;
    this.isMoving = false;
    this.isWalkingSpeed = false;
    this.isFlyingSpeed = false;
    this.isAccelerating = false;
    this.isDecelerating = false;
    this.isDeceleratingFast = false;
    this.isComingToHalt = false;
    this.directedAcceleration = 0;

    // used to make sure at least one step has been taken when transitioning from a walk cycle
    this.elapsedFTDegrees = 0;

    // the current transition (any previous, unfinished transitions are nested within this transition)
    this.currentTransition = null;

    // holds a list of live, pre (state change) reach poses
    this.preReachPoses = [];
    this.addPreReachPose = function(reachPoseName) {

        // check this reach pose is not already active
        for (pose in this.preReachPoses) {
            if (this.preReachPoses[pose].animation.name === reachPoseName) {
                return;
            }
        }
        var activeReachPose = new ReachPoseWrapper(reachPoseName, true);
        this.preReachPoses.push(activeReachPose);
        //walkTools.toLog('Added new pre reach pose: '+activeReachPose.animation.name+'. Now have '+this.preReachPoses.length+' in queue');
    }

    // orientation, locomotion and timing
    this.velocity = {x:0, y:0, z:0};
    this.acceleration = {x:0, y:0, z:0};
    this.yaw = Quat.safeEulerAngles(MyAvatar.orientation).y;
    this.yawDelta = 0;
    this.yawDeltaAcceleration = 0;
    this.direction = FORWARDS;
    this.deltaTime = 0;

    // historical orientation, locomotion and timing
    this.lastDirection = FORWARDS;
    this.lastVelocity = {x:0, y:0, z:0};
    this.lastYaw = Quat.safeEulerAngles(MyAvatar.orientation).y;
    this.lastYawDelta = 0;
    this.lastYawDeltaAcceleration = 0;

    // Quat.safeEulerAngles(MyAvatar.orientation).y tends to repeat values between frames, so values are filtered
    const YAW_SMOOTHING = 22;
    this.yawFilter = filter.createAveragingFilter(YAW_SMOOTHING);
    this.deltaTimeFilter = filter.createAveragingFilter(YAW_SMOOTHING);
    this.yawDeltaAccelerationFilter = filter.createAveragingFilter(YAW_SMOOTHING);

    // assess locomotion state
    this.assess = function(deltaTime) {
        // calculate avatar frame speed, velocity and acceleration
        this.deltaTime = deltaTime;
        this.velocity = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), MyAvatar.getVelocity());
        var lateralVelocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.z, 2));

        // MyAvatar.getAcceleration() currently not working. bug report submitted: https://worklist.net/20527
        var acceleration = {x:0, y:0, z:0};
        this.acceleration.x = (this.velocity.x - this.lastVelocity.x) / deltaTime;
        this.acceleration.y = (this.velocity.y - this.lastVelocity.y) / deltaTime;
        this.acceleration.z = (this.velocity.z - this.lastVelocity.z) / deltaTime;
        //var acceleration = MyAvatar.getAcceleration();

        // MyAvatar.getAngularVelocity and MyAvatar.getAngularAcceleration currently not working. bug report submitted
        this.yaw = Quat.safeEulerAngles(MyAvatar.orientation).y;
        if (this.lastYaw < 0 && this.yaw > 0 || this.lastYaw > 0 && this.yaw < 0) {
            this.lastYaw *= -1;
        }
        var timeDelta = this.deltaTimeFilter.process(deltaTime);
        this.yawDelta = filter.degToRad(this.yawFilter.process(this.lastYaw - this.yaw)) / timeDelta;
        this.yawDeltaAcceleration = this.yawDeltaAccelerationFilter.process(this.lastYawDelta - this.yawDelta) / timeDelta;

        // how far above the surface is the avatar?
        var pickRay = {origin: MyAvatar.position, direction: {x:0, y:-1, z:0}};
        var distanceFromSurface = Entities.findRayIntersectionBlocking(pickRay).distance; // bugged value is - 1.757;
        avatar.distanceFromSurface = distanceFromSurface - avatar.calibration.hipsToFeet;

        // determine principle direction of locomotion
        var FWD_BACK_BIAS = 1; // helps prevent false sidestep condition detection when banking hard
        if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y) &&
            Math.abs(this.velocity.x) > FWD_BACK_BIAS * Math.abs(this.velocity.z)) {
            if (this.velocity.x < 0) {
                this.directedAcceleration = -this.acceleration.x;
                this.direction = LEFT;
            } else if (this.velocity.x > 0){
                this.directedAcceleration = this.acceleration.x;
                this.direction = RIGHT;
            }
        } else if (Math.abs(this.velocity.y) > Math.abs(this.velocity.x) &&
                   Math.abs(this.velocity.y) > Math.abs(this.velocity.z)) {
            if (this.velocity.y > 0) {
                this.directedAcceleration = this.acceleration.y;
                this.direction = UP;
            } else if (this.velocity.y < 0) {
                this.directedAcceleration = -this.acceleration.y;
                this.direction = DOWN;
            }
        } else if (FWD_BACK_BIAS * Math.abs(this.velocity.z) > Math.abs(this.velocity.x) &&
                   Math.abs(this.velocity.z) > Math.abs(this.velocity.y)) {
            if (this.velocity.z < 0) {
                this.direction = FORWARDS;
                this.directedAcceleration = -this.acceleration.z;
            } else if (this.velocity.z > 0) {
                this.directedAcceleration = this.acceleration.z;
                this.direction = BACKWARDS;
            }
        } else {
            this.direction = NONE;
            this.directedAcceleration = 0;
        }

        // set speed flags
        if (Vec3.length(this.velocity) < MOVE_THRESHOLD) {
            this.isMoving = false;
            this.isWalkingSpeed = false;
            this.isFlyingSpeed = false;
            this.isComingToHalt = false;
        } else if (Vec3.length(this.velocity) < MAX_WALK_SPEED) {
            this.isMoving = true;
            this.isWalkingSpeed = true;
            this.isFlyingSpeed = false;
        } else {
            this.isMoving = true;
            this.isWalkingSpeed = false;
            this.isFlyingSpeed = true;
        }

        // set acceleration flags
        if (this.directedAcceleration > ACCELERATION_THRESHOLD) {
            this.isAccelerating = true;
            this.isDecelerating = false;
            this.isDeceleratingFast = false;
            this.isComingToHalt = false;
        } else if (this.directedAcceleration < DECELERATION_THRESHOLD) {
            this.isAccelerating = false;
            this.isDecelerating = true;
            this.isDeceleratingFast = (this.directedAcceleration < FAST_DECELERATION_THRESHOLD);
        } else {
            this.isAccelerating = false;
            this.isDecelerating = false;
            this.isDeceleratingFast = false;
        }

        // use the gathered information to build up some spatial awareness
        var isOnSurface = (avatar.distanceFromSurface < ON_SURFACE_THRESHOLD);
        var isUnderGravity = (avatar.distanceFromSurface < GRAVITY_THRESHOLD);
        var isTakingOff = (isUnderGravity && this.velocity.y > OVERCOME_GRAVITY_SPEED);
        var isComingInToLand = (isUnderGravity && this.velocity.y < -OVERCOME_GRAVITY_SPEED);
        var aboutToLand = isComingInToLand && avatar.distanceFromSurface < LANDING_THRESHOLD;
        var surfaceMotion = isOnSurface && this.isMoving;
        var acceleratingAndAirborne = this.isAccelerating && !isOnSurface;
        var goingTooFastToWalk = !this.isDecelerating && this.isFlyingSpeed;
        var movingDirectlyUpOrDown = (this.direction === UP || this.direction === DOWN)
        var maybeBouncing = Math.abs(this.acceleration.y > BOUNCE_ACCELERATION_THRESHOLD) ? true : false;

        // update any pre reach poses
        for (pose in this.preReachPoses) {
            this.preReachPoses[pose].updateProgress(this.deltaTime / this.preReachPoses[pose].reachPoseParameters.duration);
            if (this.preReachPoses[pose].progress >= 1) {
                // time to kill off this reach pose
                //walkTools.toLog('Pre reach pose '+this.preReachPoses[pose].name + ' is complete');
                this.preReachPoses.splice(pose, 1);
            }
        }

        // we now have enough information to set the appropriate locomotion mode
        switch (this.state) {
            case STATIC:
                var staticToAirMotion = this.isMoving && (acceleratingAndAirborne || goingTooFastToWalk ||
                                                           (movingDirectlyUpOrDown && !isOnSurface));
                var staticToSurfaceMotion = surfaceMotion && !motion.isComingToHalt && !movingDirectlyUpOrDown &&
                                            !this.isDecelerating && lateralVelocity > MOVE_THRESHOLD;

                if (staticToAirMotion) {
                    this.nextState = AIR_MOTION;
                } else if (staticToSurfaceMotion) {
                    this.nextState = SURFACE_MOTION;
                } else {
                    this.nextState = STATIC;
                }
                // not possible to predict impending state change and call preReachPoses
                break;

            case SURFACE_MOTION:
                var surfaceMotionToStatic = !this.isMoving ||
                                            (this.isDecelerating && motion.lastDirection !== DOWN && surfaceMotion &&
                                            !maybeBouncing && Vec3.length(this.velocity) < MAX_WALK_SPEED);
                var surfaceMotionToAirMotion = (acceleratingAndAirborne || goingTooFastToWalk || movingDirectlyUpOrDown) &&
                                               (!surfaceMotion && isTakingOff) ||
                                               (!surfaceMotion && this.isMoving && !isComingInToLand);

                if (surfaceMotionToStatic) {
                    // working on the assumption that stopping is now inevitable
                    if (!motion.isComingToHalt && isOnSurface) {
                        motion.isComingToHalt = true;
                    }
                    this.nextState = STATIC;
                } else if (surfaceMotionToAirMotion) {
                    this.nextState = AIR_MOTION;
                } else {
                    this.nextState = SURFACE_MOTION;
                }
                break;

            case AIR_MOTION:
                var airMotionToSurfaceMotion = surfaceMotion && !movingDirectlyUpOrDown;
                var airMotionToStatic = !this.isMoving && this.direction === this.lastDirection;

                // trigger any pre (state change) reach poses
                if (aboutToLand) {
                    var probableNextAnimation = this.surfaceAnimationFromDirection(this.direction);
                    if (probableNextAnimation) {
                        var transitionParameters = walkAssets.getTransitionParameters("FlyBlend", probableNextAnimation);
                        if (transitionParameters.preReachPoses) {
                            for (pose in transitionParameters.preReachPoses) {
                                motion.addPreReachPose(transitionParameters.preReachPoses[pose]);
                            }
                        }
                    }
                }

                if (airMotionToSurfaceMotion){
                    this.nextState = SURFACE_MOTION;
                } else if (airMotionToStatic) {
                    this.nextState = STATIC;
                } else {
                    this.nextState = AIR_MOTION;
                }
                break;
        }
    }

    this.surfaceAnimationFromDirection = function(direction) {
        var walkName = null;
        switch (direction) {

            case FORWARDS:
                return "Walk";

            case BACKWARDS:
                return "WalkBackwards";

            case LEFT:
                return "SideStepLeft";

            case RIGHT:
                return "SideStepRight";

            case DOWN:
                return "Idle";
        }
    }

    // frequency time wheel (foot / ground speed matching)
    const DEFAULT_HIPS_TO_FEET = 1;
    this.frequencyTimeWheelPos = 0;
    this.frequencyTimeWheelRadius = DEFAULT_HIPS_TO_FEET / 2;
    this.recentFrequencyTimeIncrements = [];
    const FT_WHEEL_HISTORY_LENGTH = 8;
    for (var i = 0; i < FT_WHEEL_HISTORY_LENGTH; i++) {
        this.recentFrequencyTimeIncrements.push(0);
    }
    this.averageFrequencyTimeIncrement = 0;

    this.advanceFrequencyTimeWheel = function(angle){
        this.elapsedFTDegrees += angle;
        // keep a running average of increments for use in transitions (used during transitioning)
        this.recentFrequencyTimeIncrements.push(angle);
        this.recentFrequencyTimeIncrements.shift();
        for (increment in this.recentFrequencyTimeIncrements) {
            this.averageFrequencyTimeIncrement += this.recentFrequencyTimeIncrements[increment];
        }
        this.averageFrequencyTimeIncrement /= this.recentFrequencyTimeIncrements.length;
        this.frequencyTimeWheelPos += angle;
        const FULL_CIRCLE = 360;
        if (this.frequencyTimeWheelPos >= FULL_CIRCLE) {
            this.frequencyTimeWheelPos = this.frequencyTimeWheelPos % FULL_CIRCLE;
        }
    }

    this.saveHistory = function() {
        this.lastDirection = this.direction;
        this.lastVelocity = this.velocity;
        this.lastYaw = this.yaw;
        this.lastYawDelta = this.yawDelta;
        this.lastYawDeltaAcceleration = this.yawDeltaAcceleration;
    }
};  // end Motion constructor

// animation manipulation object
animationOperations = (function() {

    return {

        // helper function for renderMotion(). calculate joint translations based on animation file settings and frequency * time
        calculateTranslations: function(animation, ft, direction) {
            try {
            var jointName = "Hips";
            var joint = animation.joints[jointName];
            var jointTranslations = {x:0, y:0, z:0};

            // gather modifiers and multipliers
            modifiers = new FrequencyMultipliers(joint, direction);

            // sway (oscillation on the x-axis)
            if (animation.harmonics.hasOwnProperty(jointName) && animation.harmonics[jointName].swayHarmonics) {
                jointTranslations.x = joint.sway * animation.harmonics[jointName].swayHarmonics.calculate
                    (filter.degToRad(modifiers.swayFrequencyMultiplier * ft + joint.swayPhase)) + joint.swayOffset;
            } else {
                jointTranslations.x = joint.sway * Math.sin
                    (filter.degToRad(modifiers.swayFrequencyMultiplier * ft + joint.swayPhase)) + joint.swayOffset;
            }
            // bob (oscillation on the y-axis)
            if (animation.harmonics.hasOwnProperty(jointName) &&  animation.harmonics[jointName].bobHarmonics) {
                jointTranslations.y = joint.bob * animation.harmonics[jointName].bobHarmonics.calculate
                    (filter.degToRad(modifiers.bobFrequencyMultiplier * ft + joint.bobPhase)) + joint.bobOffset;
            } else {
                jointTranslations.y = joint.bob * Math.sin
                    (filter.degToRad(modifiers.bobFrequencyMultiplier * ft + joint.bobPhase)) + joint.bobOffset;
            }
            // thrust (oscillation on the z-axis)
            if (animation.harmonics.hasOwnProperty(jointName) &&  animation.harmonics[jointName].thrustHarmonics) {
                jointTranslations.z = joint.thrust * animation.harmonics[jointName].thrustHarmonics.calculate
                    (filter.degToRad(modifiers.thrustFrequencyMultiplier * ft + joint.thrustPhase)) + joint.thrustOffset;
            } else {
                jointTranslations.z = joint.thrust * Math.sin
                    (filter.degToRad(modifiers.thrustFrequencyMultiplier * ft + joint.thrustPhase)) + joint.thrustOffset;
            }
            } catch(e) {print ('Exception caught in walkApi - AnimationOperations - calculateTranslations: '+e.toString());}
            return jointTranslations;
        },

        // helper function for renderMotion(). calculate joint rotations based on animation file settings and frequency * time
        calculateRotations: function(jointName, animation, ft, direction) {
            var jointRotations = {x:0, y:0, z:0};
            var joint = animation.joints[jointName];

            if (joint) {

                if (avatar.isMissingPreRotations) {
                    jointRotations = Vec3.sum(jointRotations, walkAssets.preRotations.joints[jointName]);
                }

                // gather frequency multipliers for this joint - TODO: phase these out, no need if using harmonics
                modifiers = new FrequencyMultipliers(joint, direction);

                // calculate pitch
                if (animation.harmonics.hasOwnProperty(jointName) && animation.harmonics[jointName].pitchHarmonics) {
                    jointRotations.x += joint.pitch * animation.harmonics[jointName].pitchHarmonics.calculate
                        (filter.degToRad(ft * modifiers.pitchFrequencyMultiplier + joint.pitchPhase)) + joint.pitchOffset;
                } else {
                    jointRotations.x += joint.pitch * Math.sin
                        (filter.degToRad(ft * modifiers.pitchFrequencyMultiplier + joint.pitchPhase)) + joint.pitchOffset;
                }
                // calculate yaw
                if (animation.harmonics.hasOwnProperty(jointName) && animation.harmonics[jointName].yawHarmonics) {
                    jointRotations.y += joint.yaw * animation.harmonics[jointName].yawHarmonics.calculate
                        (filter.degToRad(ft * modifiers.yawFrequencyMultiplier + joint.yawPhase)) + joint.yawOffset;
                } else {
                    jointRotations.y += joint.yaw * Math.sin
                        (filter.degToRad(ft * modifiers.yawFrequencyMultiplier + joint.yawPhase)) + joint.yawOffset;
                }
                // calculate roll
                if (animation.harmonics.hasOwnProperty(jointName) && animation.harmonics[jointName].rollHarmonics) {
                    jointRotations.z += joint.roll * animation.harmonics[jointName].rollHarmonics.calculate
                        (filter.degToRad(ft * modifiers.rollFrequencyMultiplier + joint.rollPhase)) + joint.rollOffset;
                } else {
                    jointRotations.z += joint.roll * Math.sin
                        (filter.degToRad(ft * modifiers.rollFrequencyMultiplier + joint.rollPhase)) + joint.rollOffset;
                }
            }
            return jointRotations;
        },

        zeroAnimation: function(animation) {
            for (i in animation.joints) {
                for (j in animation.joints[i]) {
                    animation.joints[i][j] = 0;
                }
            }
        },

        // blend source animation into target animation by given percentage
        // note: does NOT blend harmonic information
        blendAnimation: function(sourceAnimation, targetAnimation, percent) {

            // blend harmonics (with a degree of uncertainty...)
            for (joint in sourceAnimation.harmonics) {
                if (targetAnimation.harmonics[joint] === undefined) {
                    targetAnimation.harmonics[joint] = {};
                }
                for (harmonic in sourceAnimation.harmonics[joint]) {

                    if (!targetAnimation.harmonics[joint][harmonic]) {
                        targetAnimation.harmonics[joint][harmonic] = {
                            "magnitudes": [],
                            "phaseAngles": []
                        };
                        var numHarmonics = sourceAnimation.harmonics[joint][harmonic].numHarmonics;
                        for (value in sourceAnimation.harmonics[joint][harmonic].magnitudes) {
                            targetAnimation.harmonics[joint][harmonic].magnitudes.push(0);
                            targetAnimation.harmonics[joint][harmonic].phaseAngles.push(0);
                        }
                        targetAnimation.harmonics[joint][harmonic] =
                            filter.createHarmonicsFilter(numHarmonics,
                                targetAnimation.harmonics[joint][harmonic].magnitudes,
                                targetAnimation.harmonics[joint][harmonic].phaseAngles);
                    }
                    for (magnitude in sourceAnimation.harmonics[joint][harmonic].magnitudes) {
                        targetAnimation.harmonics[joint][harmonic][magnitude] += percent * sourceAnimation.harmonics[joint][harmonic][magnitude];
                    }
                    //for (phaseAngle in sourceAnimation.harmonics[joint][harmonic].phaseAngles) {
                    //    targetAnimation.harmonics[joint][harmonic][magnitude] += percent * sourceAnimation.harmonics[joint][harmonic][magnitude];
                    //}
                }
            }

            // blend joint values
            for (joint in sourceAnimation.joints) {
                targetAnimation.joints[joint].pitch += percent * sourceAnimation.joints[joint].pitch;
                targetAnimation.joints[joint].yaw += percent * sourceAnimation.joints[joint].yaw;
                targetAnimation.joints[joint].roll += percent * sourceAnimation.joints[joint].roll;
                targetAnimation.joints[joint].pitchPhase += percent * sourceAnimation.joints[joint].pitchPhase;
                targetAnimation.joints[joint].yawPhase += percent * sourceAnimation.joints[joint].yawPhase;
                targetAnimation.joints[joint].rollPhase += percent * sourceAnimation.joints[joint].rollPhase;
                targetAnimation.joints[joint].pitchOffset += percent * sourceAnimation.joints[joint].pitchOffset;
                targetAnimation.joints[joint].yawOffset += percent * sourceAnimation.joints[joint].yawOffset;
                targetAnimation.joints[joint].rollOffset += percent * sourceAnimation.joints[joint].rollOffset;
                if (joint === "Hips") {
                    // Hips only
                    targetAnimation.joints[joint].thrust += percent * sourceAnimation.joints[joint].thrust;
                    targetAnimation.joints[joint].sway += percent * sourceAnimation.joints[joint].sway;
                    targetAnimation.joints[joint].bob += percent * sourceAnimation.joints[joint].bob;
                    targetAnimation.joints[joint].thrustPhase += percent * sourceAnimation.joints[joint].thrustPhase;
                    targetAnimation.joints[joint].swayPhase += percent * sourceAnimation.joints[joint].swayPhase;
                    targetAnimation.joints[joint].bobPhase += percent * sourceAnimation.joints[joint].bobPhase;
                    targetAnimation.joints[joint].thrustOffset += percent * sourceAnimation.joints[joint].thrustOffset;
                    targetAnimation.joints[joint].swayOffset += percent * sourceAnimation.joints[joint].swayOffset;
                    targetAnimation.joints[joint].bobOffset += percent * sourceAnimation.joints[joint].bobOffset;

                    /*walkTools.toLog('\n'+sourceAnimation.name+':'+
                                    ' pitch: '+sourceAnimation.joints[joint].pitch.toFixed(1) +
                                    ' yaw: '+sourceAnimation.joints[joint].yaw.toFixed(1) +
                                    ' roll: '+sourceAnimation.joints[joint].roll.toFixed(1) +
                                    ' sway: '+sourceAnimation.joints[joint].sway.toFixed(1) +
                                    ' bob: '+sourceAnimation.joints[joint].bob.toFixed(1) +
                                    ' thrust: '+sourceAnimation.joints[joint].thrust.toFixed(1) +
                                    '\n'+targetAnimation.name+':'+
                                    ' pitch: '+targetAnimation.joints[joint].pitch.toFixed(1) +
                                    ' yaw: '+targetAnimation.joints[joint].yaw.toFixed(1) +
                                    ' roll: '+targetAnimation.joints[joint].roll.toFixed(1) +
                                    ' sway: '+targetAnimation.joints[joint].sway.toFixed(1) +
                                    ' bob: '+targetAnimation.joints[joint].bob.toFixed(1) +
                                    ' thrust: '+targetAnimation.joints[joint].thrust.toFixed(1));  */
                }
            }
        },

        deepCopy: function(sourceAnimation, targetAnimation) {

            // calibration
            targetAnimation.calibration = JSON.parse(JSON.stringify(sourceAnimation.calibration));

            // harmonics filter references
            targetAnimation.harmonics = sourceAnimation.harmonics;

            // joints
            targetAnimation.joints = JSON.parse(JSON.stringify(sourceAnimation.joints));
        }
    }

})(); // end animation object literal

// reach pose wrapper (contains reach pose animation and reach pose parameters)
ReachPoseWrapper = function(reachPoseName, sustainHold) {
    //walkTools.toLog('New reach pose created: '+reachPoseName);
    this.name = reachPoseName;
    this.animation = walkAssets.getReachPose(reachPoseName);
    this.reachPoseParameters = walkAssets.getReachPoseParameters(reachPoseName);
    this.sustainHold = sustainHold | false;
    this.progress = 0;
    this.smoothingFilter = filter.createAveragingFilter(this.reachPoseParameters.smoothing);

    this.updateProgress = function(increment) {
        if (this.progress < this.reachPoseParameters.sustain.timing || !this.sustainHold) {
            this.progress += increment;
        }
    };
    this.release = function() {
        this.sustainHold = false;
    }

    // returns the current strength (i.e. influence) of this reach pose (based on the current progress value)
    this.currentStrength = function() {
        // apply optionally smoothed (D)ASDR envelope to reach pose's strength / influence whilst active
        var segmentProgress = undefined; // progress through chosen segment
        var segmentTimeDelta = undefined; // total change in time over chosen segment
        var segmentStrengthDelta = undefined; // total change in strength over chosen segment
        var lastStrength = undefined; // the last value the previous segment held
        var currentStrength = undefined; // return value

        // select parameters based on segment (a segment being one of (D),A,S,D or R)
        if (this.progress >= this.reachPoseParameters.sustain.timing) {
            // release segment
            segmentProgress = this.progress - this.reachPoseParameters.sustain.timing;
            segmentTimeDelta = this.reachPoseParameters.release.timing - this.reachPoseParameters.sustain.timing;
            segmentStrengthDelta = this.reachPoseParameters.release.strength - this.reachPoseParameters.sustain.strength;
            lastStrength = this.reachPoseParameters.sustain.strength;
        } else if (this.progress >= this.reachPoseParameters.decay.timing) {
            // sustain phase
            segmentProgress = this.progress - this.reachPoseParameters.decay.timing;
            segmentTimeDelta = this.reachPoseParameters.sustain.timing - this.reachPoseParameters.decay.timing;
            segmentStrengthDelta = this.reachPoseParameters.sustain.strength - this.reachPoseParameters.decay.strength;
            lastStrength = this.reachPoseParameters.decay.strength;
        } else if (this.progress >= this.reachPoseParameters.attack.timing) {
            // decay phase
            segmentProgress = this.progress - this.reachPoseParameters.attack.timing;
            segmentTimeDelta = this.reachPoseParameters.decay.timing - this.reachPoseParameters.attack.timing;
            segmentStrengthDelta = this.reachPoseParameters.decay.strength - this.reachPoseParameters.attack.strength;
            lastStrength = this.reachPoseParameters.attack.strength;
        } else if (this.progress >= this.reachPoseParameters.delay.timing) {
            // attack phase
            segmentProgress = this.progress - this.reachPoseParameters.delay.timing;
            segmentTimeDelta = this.reachPoseParameters.attack.timing - this.reachPoseParameters.delay.timing;
            segmentStrengthDelta = this.reachPoseParameters.attack.strength - this.reachPoseParameters.delay.strength;
            lastStrength = this.reachPoseParameters.delay.strength;
        } else {
            // delay phase
            segmentProgress = this.progress;
            segmentTimeDelta = this.reachPoseParameters.delay.timing;
            segmentStrengthDelta = this.reachPoseParameters.delay.strength;
            lastStrength = 0;
        }
        currentStrength = segmentTimeDelta > 0 ? lastStrength + segmentStrengthDelta * segmentProgress / segmentTimeDelta
                                               : lastStrength;
        // smooth off the response curve
        currentStrength = this.smoothingFilter.process(currentStrength);
        return currentStrength;
    }
};

// constructor for animation Transition
Transition = function(nextAnimation, lastAnimation, lastTransition, playTransitionReachPoses) {

    if (playTransitionReachPoses === undefined) {
        playTransitionReachPoses = true;
    }

    // record the current state of animation
    this.nextAnimation = nextAnimation;
    this.lastAnimation = lastAnimation;
    this.lastTransition = lastTransition;

    // collect information about the currently playing animation
    this.direction = motion.direction;
    this.lastDirection = motion.lastDirection;
    this.lastFrequencyTimeWheelPos = motion.frequencyTimeWheelPos;
    this.lastFrequencyTimeIncrement = motion.averageFrequencyTimeIncrement;
    this.lastFrequencyTimeWheelRadius = motion.frequencyTimeWheelRadius;
    this.degreesToTurn = 0; // total degrees to turn the ft wheel before the avatar stops (walk only)
    this.degreesRemaining = 0; // remaining degrees to turn the ft wheel before the avatar stops (walk only)
    this.lastElapsedFTDegrees = motion.elapsedFTDegrees; // degrees elapsed since last transition start
    motion.elapsedFTDegrees = 0; // reset ready for the next transition
    motion.frequencyTimeWheelPos = 0; // start the next animation's frequency time wheel from zero

    // set the parameters for the transition
    this.liveReachPoses = [];
    this.parameters = {};
    if (walkAssets && lastAnimation && nextAnimation) {
        var next = nextAnimation.name;
        if (this.nextAnimation.name === "WalkBlend") {
            next = motion.surfaceAnimationFromDirection(this.direction)
        }
        var last = lastAnimation.name;
        if (this.lastAnimation.name === "WalkBlend") {
            last = motion.surfaceAnimationFromDirection(this.direction)
        }
        //walkTools.toLog('Transition from '+last+' to '+next+' instantiated');
        this.parameters = walkAssets.getTransitionParameters(last, next);

        // fire up any post event reach poses for this transition
        if (playTransitionReachPoses) {
            if (this.parameters.postReachPoses)
                //walkTools.toLog('Transition from '+last+' to '+next+' has '+this.parameters.postReachPoses.length+' post reach poses');

            for (pose in this.parameters.postReachPoses) {
                this.liveReachPoses.push(new ReachPoseWrapper(this.parameters.postReachPoses[pose], false));
            }
        }
    }
    this.startTime = new Date().getTime(); // Starting timestamp (seconds)
    this.progress = 0; // how far are we through the transition?
    this.filteredProgress = 0;

    // coming to a halt whilst walking? if so, will need a clean stopping point defined
    if (motion.isComingToHalt) {

        const FULL_CYCLE_THRESHOLD = 320;
        const HALF_CYCLE_THRESHOLD = 140;
        const CYCLE_COMMIT_THRESHOLD = 5;

        // how many degrees do we need to turn the walk wheel to finish walking with both feet on the ground?
        if (this.lastElapsedFTDegrees < CYCLE_COMMIT_THRESHOLD) {
            // just stop the walk cycle right here and blend to idle
            this.degreesToTurn = 0;
        } else if (this.lastElapsedFTDegrees < HALF_CYCLE) {
            // we have not taken a complete step yet, so we advance to the second stop angle
            this.degreesToTurn = HALF_CYCLE  - this.lastFrequencyTimeWheelPos;
        } else if (this.lastFrequencyTimeWheelPos > 0 && this.lastFrequencyTimeWheelPos <= HALF_CYCLE_THRESHOLD) {
            // complete the step and stop at 180
            this.degreesToTurn = HALF_CYCLE - this.lastFrequencyTimeWheelPos;
        } else if (this.lastFrequencyTimeWheelPos > HALF_CYCLE_THRESHOLD && this.lastFrequencyTimeWheelPos <= HALF_CYCLE) {
            // complete the step and next then stop at 0
            this.degreesToTurn = HALF_CYCLE - this.lastFrequencyTimeWheelPos + HALF_CYCLE;
        } else if (this.lastFrequencyTimeWheelPos > HALF_CYCLE && this.lastFrequencyTimeWheelPos <= FULL_CYCLE_THRESHOLD) {
            // complete the step and stop at 0
            this.degreesToTurn = FULL_CYCLE - this.lastFrequencyTimeWheelPos;
        } else {
            // complete the step and the next then stop at 180
            this.degreesToTurn = FULL_CYCLE - this.lastFrequencyTimeWheelPos + HALF_CYCLE;
        }

        // transition length in this case should be directly proportional to the remaining degrees to turn
        var MIN_FT_INCREMENT = 5.0; // degrees per frame
        var MIN_TRANSITION_DURATION = 0.4;
        const TWO_THIRDS = 0.6667;
        this.lastFrequencyTimeIncrement *= TWO_THIRDS; // help ease the transition
        var lastFrequencyTimeIncrement = this.lastFrequencyTimeIncrement > MIN_FT_INCREMENT ?
                                         this.lastFrequencyTimeIncrement : MIN_FT_INCREMENT;
        var timeToFinish = Math.max(motion.deltaTime * this.degreesToTurn / lastFrequencyTimeIncrement,
                                    MIN_TRANSITION_DURATION);
        this.parameters.duration = timeToFinish;
        this.degreesRemaining = this.degreesToTurn;
    }

    // deal with transition recursion (overlapping transitions)
    this.recursionDepth = 0;
    this.incrementRecursion = function() {
        this.recursionDepth += 1;

        // cancel any continued motion
        this.degreesToTurn = 0;

        // limit the number of layered / nested transitions
        if (this.lastTransition !== nullTransition) {
            this.lastTransition.incrementRecursion();
            if (this.lastTransition.recursionDepth > MAX_TRANSITION_RECURSION) {
                //walkTools.toLog('Transition from '+this.lastTransition.lastAnimation.name+
                //' to '+this.lastTransition.nextAnimation.name+' deleted due to excessive recursion.');
                this.lastTransition = nullTransition;
            }
        }
    };
    if (this.lastTransition !== nullTransition) {
        this.lastTransition.incrementRecursion();
    }

    // end of transition initialisation. begin Transition public methods

    // keep up the pace for the frequency time wheel for the last animation
    this.advancePreviousFrequencyTimeWheel = function(deltaTime) {
        var wheelAdvance = undefined;

        if (this.lastAnimation === avatar.selectedWalkBlend &&
            this.nextAnimation === avatar.selectedIdle) {
            if (this.degreesRemaining <= 0) {
                // stop continued motion
                wheelAdvance = 0;
                if (motion.isComingToHalt) {
                    if (this.lastFrequencyTimeWheelPos < QUARTER_CYCLE) {
                        this.lastFrequencyTimeWheelPos = 0;
                    } else {
                        this.lastFrequencyTimeWheelPos = HALF_CYCLE;
                    }
                }
            } else {
                wheelAdvance = this.lastFrequencyTimeIncrement;
                var distanceToTravel = avatar.currentAnimation.calibration.strideLength * wheelAdvance / HALF_CYCLE;
                if (this.degreesRemaining <= 0) {
                    distanceToTravel = 0;
                    this.degreesRemaining = 0;
                } else {
                    this.degreesRemaining -= wheelAdvance;
                }
            }
        } else {
            wheelAdvance = this.lastFrequencyTimeIncrement;
        }

        // advance the ft wheel
        this.lastFrequencyTimeWheelPos += wheelAdvance;
        if (this.lastFrequencyTimeWheelPos >= FULL_CYCLE) {
            this.lastFrequencyTimeWheelPos = this.lastFrequencyTimeWheelPos % FULL_CYCLE;
        }

        // advance ft wheel for the nested (previous) Transition
        if (this.lastTransition !== nullTransition) {
            this.lastTransition.advancePreviousFrequencyTimeWheel(deltaTime);
        }
        // update the lastElapsedFTDegrees for short stepping
        this.lastElapsedFTDegrees += wheelAdvance;
        this.degreesTurned += wheelAdvance;
    };

    this.updateProgress = function() {
        const MILLISECONDS_CONVERT = 1000;
        const ACCURACY_INCREASER = 1000;
        var elapasedTime = (new Date().getTime() - this.startTime) / MILLISECONDS_CONVERT;
        this.progress = elapasedTime / this.parameters.duration;
        this.progress = Math.round(this.progress * ACCURACY_INCREASER) / ACCURACY_INCREASER;

        // updated nested transition/s
        if (this.lastTransition !== nullTransition) {
            if (this.lastTransition.updateProgress() === TRANSITION_COMPLETE) {
                //walkTools.toLog('Transition from '+this.lastTransition.lastAnimation.name+
                //' to '+this.lastTransition.nextAnimation.name+' (nested) complete.');
                // the previous transition is now complete
                this.lastTransition = nullTransition;
            }
        }

        if (this.progress >= 1) {
            // release any pre-state change reach poses
            for (reachPose in motion.preReachPoses) {
                //walkTools.toLog(motion.preReachPoses[reachPose].name + ' sustain hold released');
                motion.preReachPoses[reachPose].release();
            }
        }

        // update any post-state change reach poses
        for (pose in this.liveReachPoses) {
            this.liveReachPoses[pose].updateProgress(motion.deltaTime / this.liveReachPoses[pose].reachPoseParameters.duration);
            if (this.liveReachPoses[pose].progress >= 1) {
                // time to kill off this reach pose
                //walkTools.toLog('Post reach pose '+this.liveReachPoses[pose].name + ' is complete');
                this.liveReachPoses.splice(pose, 1);
            }
        }

        // update transition progress
        this.filteredProgress = filter.bezier(this.progress, this.parameters.easingLower, this.parameters.easingUpper);
        return this.progress >= 1 ? TRANSITION_COMPLETE : false;
    };

    this.blendTranslations = function(frequencyTimeWheelPos, direction) {
        var lastTranslations = {x:0, y:0, z:0};
        var nextTranslations = animationOperations.calculateTranslations(this.nextAnimation,
                                                                         frequencyTimeWheelPos,
                                                                         direction);
        // are we blending with a previous, still live transition?
        if (this.lastTransition !== nullTransition) {
            lastTranslations = this.lastTransition.blendTranslations(this.lastFrequencyTimeWheelPos,
                                                                     this.lastDirection);
        } else {
            lastTranslations = animationOperations.calculateTranslations(this.lastAnimation,
                                                     this.lastFrequencyTimeWheelPos,
                                                     this.lastDirection);
        }

        // blend last / next translations
        nextTranslations = Vec3.multiply(this.filteredProgress, nextTranslations);
        lastTranslations = Vec3.multiply((1 - this.filteredProgress), lastTranslations);
        nextTranslations = Vec3.sum(nextTranslations, lastTranslations);

        if (this.liveReachPoses.length > 0) {
            for (pose in this.liveReachPoses) {
                var reachPoseStrength = this.liveReachPoses[pose].currentStrength();
                var poseTranslations = animationOperations.calculateTranslations(
                                                             this.liveReachPoses[pose].animation,
                                                             frequencyTimeWheelPos,
                                                             direction);

                // can't use Vec3 operations here, as if x,y or z is zero, the reachPose should have no influence at all
                if (Math.abs(poseTranslations.x) > 0) {
                    nextTranslations.x = reachPoseStrength * poseTranslations.x + (1 - reachPoseStrength) * nextTranslations.x;
                }
                if (Math.abs(poseTranslations.y) > 0) {
                    nextTranslations.y = reachPoseStrength * poseTranslations.y + (1 - reachPoseStrength) * nextTranslations.y;
                }
                if (Math.abs(poseTranslations.z) > 0) {
                    nextTranslations.z = reachPoseStrength * poseTranslations.z + (1 - reachPoseStrength) * nextTranslations.z;
                }
            }
        }
        return nextTranslations;
    };

    this.blendRotations = function(jointName, frequencyTimeWheelPos, direction) {
        try {
        var lastRotations = {x:0, y:0, z:0};
        var nextRotations = animationOperations.calculateRotations(jointName,
                                               this.nextAnimation,
                                               frequencyTimeWheelPos,
                                               direction);

        // are we blending with a previous, still live transition?
        if (this.lastTransition !== nullTransition) {
            lastRotations = this.lastTransition.blendRotations(jointName,
                                                               this.lastFrequencyTimeWheelPos,
                                                               this.lastDirection);
        } else {
            lastRotations = animationOperations.calculateRotations(jointName,
                                               this.lastAnimation,
                                               this.lastFrequencyTimeWheelPos,
                                               this.lastDirection);
        }
        // blend last / next translations
        nextRotations = Vec3.multiply(this.filteredProgress, nextRotations);
        lastRotations = Vec3.multiply((1 - this.filteredProgress), lastRotations);
        nextRotations = Vec3.sum(nextRotations, lastRotations);

        // are there reachPoses defined for this transition?
        if (this.liveReachPoses.length > 0) { // TODO: does this really need checking?
            for (pose in this.liveReachPoses) {
                var reachPoseStrength = this.liveReachPoses[pose].currentStrength();
                var poseRotations = animationOperations.calculateRotations(jointName,
                                                       this.liveReachPoses[pose].animation,
                                                       frequencyTimeWheelPos,
                                                       direction);

                // don't use Vec3 operations here, as if x,y or z is zero, the reach pose should have no influence at all
                if (Math.abs(poseRotations.x) > 0) {
                    nextRotations.x = reachPoseStrength * poseRotations.x + (1 - reachPoseStrength) * nextRotations.x;
                }
                if (Math.abs(poseRotations.y) > 0) {
                    nextRotations.y = reachPoseStrength * poseRotations.y + (1 - reachPoseStrength) * nextRotations.y;
                }
                if (Math.abs(poseRotations.z) > 0) {
                    nextRotations.z = reachPoseStrength * poseRotations.z + (1 - reachPoseStrength) * nextRotations.z;
                }
            }
        }
        } catch(e) {print ('Exception caught in walkApi - Transition - blendRotations: '+e.toString());}
        return nextRotations;
    };
}; // end Transition constructor

// individual joint modifiers
FrequencyMultipliers = function(joint, direction) {
    // gather multipliers
    this.pitchFrequencyMultiplier = 1;
    this.yawFrequencyMultiplier = 1;
    this.rollFrequencyMultiplier = 1;
    this.swayFrequencyMultiplier = 1;
    this.bobFrequencyMultiplier = 1;
    this.thrustFrequencyMultiplier = 1;

    if (joint) {
        if (joint.pitchFrequencyMultiplier) {
            this.pitchFrequencyMultiplier = joint.pitchFrequencyMultiplier;
        }
        if (joint.yawFrequencyMultiplier) {
            this.yawFrequencyMultiplier = joint.yawFrequencyMultiplier;
        }
        if (joint.rollFrequencyMultiplier) {
            this.rollFrequencyMultiplier = joint.rollFrequencyMultiplier;
        }
        if (joint.swayFrequencyMultiplier) {
            this.swayFrequencyMultiplier = joint.swayFrequencyMultiplier;
        }
        if (joint.bobFrequencyMultiplier) {
            this.bobFrequencyMultiplier = joint.bobFrequencyMultiplier;
        }
        if (joint.thrustFrequencyMultiplier) {
            this.thrustFrequencyMultiplier = joint.thrustFrequencyMultiplier;
        }
    }
};