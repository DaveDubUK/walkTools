//
//  walkApi.js
//
//  version 1.003
//
//  Created by David Wooldridge, Autumn 2014
//
//  Motion, state and Transition objects for use by the walk.js script v1.2
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Avatar = function() {

    // motion, locomotion, spatial awareness
    this.distanceToSurface = 0;
    this.isOnSurface = true;
    this.isComingInToLand = false;
    this.isTakingOff = false;
    this.isUnderGravity = false;

    // if Hydras are connected, the only way to enable use is by never setting any rotations on the arm joints
    this.hydraCheck = function() {

        // function courtesy of Thijs Wenker (frisbee.js)
        var numberOfButtons = Controller.getNumberOfButtons();
        var numberOfTriggers = Controller.getNumberOfTriggers();
        var numberOfSpatialControls = Controller.getNumberOfSpatialControls();
        var controllersPerTrigger = numberOfSpatialControls / numberOfTriggers;
        hydrasConnected = (numberOfButtons == 12 && numberOfTriggers == 2 && controllersPerTrigger == 2);
        return hydrasConnected;
    }

    // settings
    this.armsFree = this.hydraCheck(); // automatically sets true for Hydra support - temporary fix
    this.makesFootStepSounds = false;
    this.animationSet = undefined; // currently just one animation set
    this.setAnimationSet = function(animationSet) {

        this.animationSet = animationSet;

        switch(animationSet) {

            case 'standard':

                this.selectedWalk = walkAssets.getAnimation("MaleWalk");
                this.selectedWalkBackwards = walkAssets.getAnimation("MaleWalkBackwards");
                this.selectedWalkBlend = walkAssets.getAnimation("WalkBlend");
                this.selectedIdle = walkAssets.getAnimation("MaleIdle");
                this.selectedFlyUp = walkAssets.getAnimation("MaleFlyUp");
                this.selectedFly = walkAssets.getAnimation("MaleFly");
                this.selectedFlyDown = walkAssets.getAnimation("MaleFlyDown");
                this.selectedFlyBlend = walkAssets.getAnimation("FlyBlend");
                this.selectedRapidFly = walkAssets.getAnimation("RapidFly");
                this.selectedSoarFly = walkAssets.getAnimation("SoarFly");
                this.selectedHover = walkAssets.getAnimation("MaleHover");
                this.selectedSideStepLeft = walkAssets.getAnimation("MaleSideStepLeft");
                this.selectedSideStepRight = walkAssets.getAnimation("MaleSideStepRight");
                this.selectedTurnLeft = walkAssets.getAnimation("MaleTurnLeft");
                this.selectedTurnRight = walkAssets.getAnimation("MaleTurnRight");
                this.currentAnimation = this.selectedIdle;
                return;
        }
    }
    this.setAnimationSet('standard');
    this.avatarJointNames = MyAvatar.getJointNames();

    // calibration
    this.calibration = {

        hipsToFeet: 1.35,
        strideLength: this.selectedWalk.calibration.strideLength
    }

    this.calibrate = function() {

        // Triple check: measurements are taken three times to ensure accuracy - the first result is often too large
        var attempts = 3;
        var extraAttempts = 0;

        do {

            for (joint in walkAssets.animationReference.joints) {

                var IKChain = walkAssets.animationReference.joints[joint].IKChain;

                // only need to zero right leg and hips
                if (IKChain === "RightLeg" || joint === "Hips" ) {

                    MyAvatar.setJointData(joint, Quat.fromPitchYawRollDegrees(0, 0, 0));
                }
            }
            this.calibration.hipsToFeet = MyAvatar.getJointPosition("Hips").y - MyAvatar.getJointPosition("RightToeBase").y;

            if (this.calibration.hipsToFeet === 0 && extraAttempts < 100) {

                // Interface can sometimes report zero for hips to feet. if so, we repeat.
                attempts++;
                extraAttempts++;
            }
            print('calibration attempt '+attempts+' with '+extraAttempts+' extra attempts. Hips to feet calibrated to '+this.calibration.hipsToFeet.toFixed(3)+'m'); // REMOVIE_FOR_RELEASE

        } while (attempts-- > 1)

        // just in case
        if (this.calibration.hipsToFeet <= 0) {

            this.calibration.hipsToFeet = 1.0;
        }
    }

    // pose the fingers
    this.poseFingers = function() {

        for (knuckle in walkAssets.animationReference.leftHand) {

            if (walkAssets.animationReference.leftHand[knuckle].IKChain === "LeftHandThumb") {

                MyAvatar.setJointData(knuckle, Quat.fromPitchYawRollDegrees(10, 0, -4));

            } else {

                MyAvatar.setJointData(knuckle, Quat.fromPitchYawRollDegrees(16, 0, 5));
            }
        }

        for (knuckle in walkAssets.animationReference.rightHand) {

            if (walkAssets.animationReference.rightHand[knuckle].IKChain === "RightHandThumb") {

                MyAvatar.setJointData(knuckle, Quat.fromPitchYawRollDegrees(10, 0, 4));

            } else {

                MyAvatar.setJointData(knuckle, Quat.fromPitchYawRollDegrees(16, 0, -5));
            }
        }
    };

    this.calibrate();
    this.poseFingers();

    // footsteps
    this.nextStep = RIGHT; // the first step is right, because the waveforms say so
    this.makeFootStepSound = function() {

        // correlate footstep volume with avatar speed. place the audio source at the feet, not the hips
        var SPEED_THRESHOLD = 0.4;
        var VOLUME_ATTENUATION = 0.3;
        var MIN_VOLUME = 0.08;
        var options = {
            position: Vec3.sum(MyAvatar.position, {x:0, y: -this.calibration.hipsToFeet, z:0}),
            volume: Vec3.length(motion.velocity) > SPEED_THRESHOLD ?
                    VOLUME_ATTENUATION * Vec3.length(motion.velocity) / MAX_WALK_SPEED : MIN_VOLUME
        };

        // different sounds for male / female
        var soundNumber = undefined;
        if (this.animationSet === MALE) {

            soundNumber = 0; // 0, 2 or 4

        } else {

            soundNumber = 2; // 0, 2 or 4
        }
        if (this.nextStep === RIGHT) {

            Audio.playSound(walkAssets.footsteps[soundNumber], options);
            this.nextStep = LEFT;

        } else if (this.nextStep === LEFT) {

            Audio.playSound(walkAssets.footsteps[soundNumber + 1], options);
            this.nextStep = RIGHT;
        }
    }
};

// JS motor
jsMotor = (function () {

    var _motoring = false;
    var _braking = false;
    var _direction = FORWARDS;
    var _motorVelocity = {x:0, y:0, z:0};
    var _motorTimeScale = VERY_LONG_TIME;

    function _update() {

        //MyAvatar.motorVelocity = _motorVelocity;
        //MyAvatar.motorTimescale = _motorTimeScale;
    }

    return {

        isMotoring: function() {

            return _motoring;
        },

        isBraking: function() {

            return _braking;
        },

        startMotoring: function() {

            _direction = motion.lastDirection;
            var speed = MAX_WALK_SPEED;
            if (_direction === FORWARDS) {

                speed *= -1;
            }
            _motorVelocity =  {x:0.0, y:0.0, z: speed};
            _motorTimeScale = SHORT_TIME;
            _motoring = true;

            //print('jsMotor: started motoring at speed '+speed.toFixed(2)+' in direction '+_direction+'. current speed is '+Vec3.length(MyAvatar.getVelocity()));

            _update();
        },

        setMotorSpeed: function(speed, timeScale) {

            if (_direction === FORWARDS) {

                speed *= -1;
            }
            _motorVelocity =  {x:0.0, y:0.0, z: speed};
            _motorTimeScale = timeScale;
            _motoring = true;

            //print('jsMotor: set motor speed to '+speed.toFixed(2)+ ' in direction '+_direction+'. current speed is '+Vec3.length(MyAvatar.getVelocity()));

            _update();
        },

        applyBrakes: function() {

            // stop the motion quickly
            _motorVelocity = {x:0.0, y:0.0, z:0};
            _motorTimeScale = VERY_SHORT_TIME;
            _braking = true;

            //print('jsMotor: applyBrakes - set motor speed to zero - stopping. current speed is '+Vec3.length(MyAvatar.getVelocity()));

            _update();

            if(Vec3.length(Motion.velocity) < (MOVE_THRESHOLD/100)) {

                _motoring = false;
            }
        },

        stopBraking: function() {

            _motorVelocity = {x:0, y:0, z:0};
            _motorTimeScale = VERY_LONG_TIME;
            _braking = false;

            //print('jsMotor: stopBraking. current speed is '+Vec3.length(MyAvatar.getVelocity()));

            _update();
        }
    }

})(); // end jsMotor object literal


// constructor for the Motion object
Motion = function(avatar) {

    // link the motion to the avatar
    this.avatar = avatar;

    // locomotion status
    this.locomotionMode = state.STATIC;
    this.isMoving = true;
    this.isWalkingSpeed = false;
    this.isFlyingSpeed = false;
    this.isAccelerating = false;
    this.isDecelerating = false;
    this.isDeceleratingFast = false;
    //this.isGoingUp = false;
    //this.isGoingDown = false;

    this.directedAcceleration = 0;

    // calibration
    this.calibration = {

        pitchMax: 70,
        maxWalkAcceleration: 5,
        maxWalkDeceleration: 24,
        rollMax: 80,
        angularVelocityMax: 67
    }

    // used to make sure at least one step has been taken when transitioning from a walk cycle
    this.elapsedFTDegrees = 0;

    // current transition
    this.currentTransition = null;

    // orientation, locomotion and timing
    this.velocity = {x:0, y:0, z:0};
    this.acceleration = {x:0, y:0, z:0};
    this.direction = FORWARDS;
    this.transitionCount = 0;
    this.deltaTime = 0;

    // historical orientation, locomotion and timing
    this.lastDirection = FORWARDS;
    this.lastVelocity = {x:0, y:0, z:0};
    this.lastAcceleration = {x:0, y:0, z:0};

    // calculate local velocity, speed, acceleration and proximity to voxel surface for the current frame
    this.quantify = function(deltaTime) {

        if (jsMotor.isBraking() && Vec3.length(Motion.velocity) < MOVE_THRESHOLD) {

            // reset any braking
            jsMotor.stopBraking();
        }

        // calculate avatar frame speed, velocity and acceleration
        this.deltaTime = deltaTime;
        this.velocity = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), MyAvatar.getVelocity());
        var lateralVelocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.z, 2));


        // TODO: Don't use MyAvatar.getVelocity() to calculate acceleration, use MyAvatar.getAcceleration()?
        var acceleration = {x:0, y:0, z:0};
        this.acceleration.x = (this.velocity.x - this.lastVelocity.x) / deltaTime;
        this.acceleration.y = (this.velocity.y - this.lastVelocity.y) / deltaTime;
        this.acceleration.z = (this.velocity.z - this.lastVelocity.z) / deltaTime;

        /*this.acceleration = MyAvatar.getAcceleration();
        this.acceleration = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), MyAvatar.getAcceleration());*/

        // how far above the suface is the avatar?
        var pickRay = {origin: MyAvatar.position, direction: {x:0, y:-1, z:0}};
        var distanceToSurface = Entities.findRayIntersectionBlocking(pickRay).distance;
        this.avatar.distanceToSurface = distanceToSurface - this.avatar.calibration.hipsToFeet;

        // determine principle direction of movement
        /*if (!this.isMoving) {

            this.direction = NONE;
            this.directedAcceleration = 0;

        } else */if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y) &&
                   Math.abs(this.velocity.x) > Math.abs(this.velocity.z)) {

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

        } else if (Math.abs(this.velocity.z) > Math.abs(this.velocity.x) &&
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

        if (walkTools.editMode.editing) {
            this.direction = walkTools.editMode.editDirection;
        }// REMOVE_FOR_RELEASE - no walktools

        // determine if at static, walking or flying speed
        if (Vec3.length(this.velocity) < MOVE_THRESHOLD) {

            this.isMoving = false;
            this.isWalkingSpeed = false;
            this.isFlyingSpeed = false;

        } else if (Vec3.length(this.velocity) < MAX_WALK_SPEED) {

            this.isMoving = true;
            this.isWalkingSpeed = true;
            this.isFlyingSpeed = false;

        /*} else if (this.avatar.distanceToSurface < ON_SURFACE_THRESHOLD && this.direction === DOWN && lateralVelocity > MOVE_THRESHOLD) {
            // special case to debounce flying to walking
            this.isMoving = true;
            this.isWalkingSpeed = true;
            this.isFlyingSpeed = false;
*/
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

        } else if (this.directedAcceleration < DECELERATION_THRESHOLD) {

            this.isAccelerating = false;
            this.isDecelerating = true;

            if (this.directedAcceleration < FAST_DECELERATION_THRESHOLD) {

                this.isDeceleratingFast = true;

            } else {

                this.isDeceleratingFast = false;
            }

        } else {

            this.isAccelerating = false;
            this.isDecelerating = false;
            this.isDeceleratingFast = false;
        }

        // use the gathered info to build up some spatial awareness for the avatar
        this.avatar.isOnSurface = false;
        this.avatar.isComingInToLand = false;
        this.avatar.isTakingOff = false;
        this.avatar.isUnderGravity = false;

        if (this.avatar.distanceToSurface < ON_SURFACE_THRESHOLD) {

            this.avatar.isOnSurface = true;
        }
        if (this.avatar.distanceToSurface < GRAVITY_THRESHOLD) {

            this.avatar.isUnderGravity = true;
        }
        if (this.avatar.isUnderGravity && this.velocity.y < -GRAVITY_REACTION_THRESHOLD) {

            this.avatar.isComingInToLand = true;

        } else if (this.avatar.isUnderGravity && this.velocity.y > GRAVITY_REACTION_THRESHOLD) {

            this.avatar.isTakingOff = true;
        }

        // we now have enough information to set the appropriate locomotion mode
        var SURFACE_MOTION = this.avatar.isOnSurface && this.isWalkingSpeed;
        var ACCELERATING_AND_AIRBORNE = this.isAccelerating && !this.avatar.isOnSurface;
        var GOING_TOO_FAST_TO_WALK = !this.isDecelerating && this.isAtFlyingSpeed;
        var MOVING_DIRECTLY_UP_OR_DOWN = (this.direction === UP || this.direction === DOWN) &&
                                         lateralVelocity < MOVE_THRESHOLD; //
        var ABOUT_TO_LAND = this.avatar.isComingInToLand && this.avatar.distanceToSurface < LANDING_THRESHOLD;

        switch(state.currentState) {

            case state.STATIC:

                if (ACCELERATING_AND_AIRBORNE || GOING_TOO_FAST_TO_WALK ||
                   (MOVING_DIRECTLY_UP_OR_DOWN && !this.avatar.isOnSurface)) {

                    this.locomotionMode = state.AIR_MOTION;
                    //print('static to air motion. lateralVelocity is '+lateralVelocity.toFixed(2));//print(walkTools.dumpState());

                } else if (SURFACE_MOTION && !jsMotor.isMotoring() && lateralVelocity > MOVE_THRESHOLD) {

                    this.locomotionMode = state.SURFACE_MOTION;
                    //print('static to surface motion. lateralVelocity is '+lateralVelocity.toFixed(2));//print(walkTools.dumpState());

                } else {

                    this.locomotionMode = state.STATIC;
                }
                break;

            case state.SURFACE_MOTION:

                if (!this.isMoving) { //!this.isMoving || this.isDecelerating)) {

                    // stopping walk, so immediately start the motor so we can complete the current walk half cycle
                    if (!jsMotor.isMotoring() && this.avatar.isOnSurface) {

                        jsMotor.startMotoring();
                    }
                    this.locomotionMode = state.STATIC;
                    //print('surface motion to static. lateralVelocity is '+lateralVelocity.toFixed(2));//print(walkTools.dumpState());

                } else if ((!SURFACE_MOTION || ACCELERATING_AND_AIRBORNE ||
                    GOING_TOO_FAST_TO_WALK || MOVING_DIRECTLY_UP_OR_DOWN) && this.avatar.isTakingOff) {

                    this.locomotionMode = state.AIR_MOTION;
                    //print('surface motion to air motion. lateralVelocity is '+lateralVelocity.toFixed(2));//print(walkTools.dumpState());

                } else {

                    this.locomotionMode = state.SURFACE_MOTION;
                }
                break;

            case state.AIR_MOTION:

                if ((SURFACE_MOTION || ABOUT_TO_LAND) && !MOVING_DIRECTLY_UP_OR_DOWN){

                    this.locomotionMode = state.SURFACE_MOTION;
                    //print('air motion to surface motion. lateralVelocity is '+lateralVelocity.toFixed(2));//print(walkTools.dumpState());

                } else if (Vec3.length(this.velocity) < FLY_THRESHOLD || this.isDeceleratingFast ||
                           this.avatar.isOnSurface) {

                    this.locomotionMode = state.STATIC;
                    //print('air motion to static. lateralVelocity is '+lateralVelocity.toFixed(2));//print(walkTools.dumpState());

                } else {

                    this.locomotionMode = state.AIR_MOTION;
                }
                break;
        }
    }

    // frequency time wheel (foot / ground speed matching)
    this.frequencyTimeWheelPos = 0;
    this.frequencyTimeWheelRadius = 0.5;
    this.recentFrequencyTimeIncrements = [];
    for(var i = 0; i < 8; i++) {
        this.recentFrequencyTimeIncrements.push(0);
    }
    this.averageFrequencyTimeIncrement = 0;

    this.advanceFrequencyTimeWheel = function(angle){

        this.elapsedFTDegrees += angle;

        // keep a running average of increments for use in transitions (used for non-walking cycles) - REMOVE_FOR_RELEASE - still used?
        this.recentFrequencyTimeIncrements.push(angle);
        this.recentFrequencyTimeIncrements.shift();
        for(increment in this.recentFrequencyTimeIncrements) {
            this.averageFrequencyTimeIncrement += this.recentFrequencyTimeIncrements[increment];
        }
        this.averageFrequencyTimeIncrement /= this.recentFrequencyTimeIncrements.length;

        this.frequencyTimeWheelPos += angle;
        if (this.frequencyTimeWheelPos >= 360) {
            this.frequencyTimeWheelPos = this.frequencyTimeWheelPos % 360;
        }
    }

    this.saveHistory = function() {

        this.lastDirection = this.direction;
        this.lastVelocity = this.velocity;
        this.lastAcceleration = this.acceleration;
        this.lastdistanceToSurface = avatar.distanceToSurface;
    }
};  // end Motion constructor


// animation manipulation object
animationOperations = (function() {

    return {

        // helper function for renderMotion(). calculate joint translations based on animation file settings and frequency * time
        calculateTranslations: function(animation, ft, direction) {

            var jointName = "Hips";
            var joint = animation.joints[jointName];
            var jointTranslations = {x:0, y:0, z:0};

            // gather modifiers and multipliers
            modifiers = new FrequencyMultipliers(joint, direction);

            // calculate translations. Use synthesis filters where specified by the animation data file.

            // sway (oscillation on the x-axis)
            if(animation.filters.hasOwnProperty(jointName) && 'swayFilter' in animation.filters[jointName]) {

                jointTranslations.x = joint.sway * animation.filters[jointName].swayFilter.calculate
                    (filter.degToRad(modifiers.swayFrequencyMultiplier * ft + joint.swayPhase)) + joint.swayOffset;

            } else {

                jointTranslations.x = joint.sway * Math.sin
                    (filter.degToRad(modifiers.swayFrequencyMultiplier * ft + joint.swayPhase)) + joint.swayOffset;
            }

            // bob (oscillation on the y-axis)
            if(animation.filters.hasOwnProperty(jointName) && 'bobFilter' in animation.filters[jointName]) {

                jointTranslations.y = joint.bob * animation.filters[jointName].bobFilter.calculate
                    (filter.degToRad(modifiers.bobFrequencyMultiplier * ft + joint.bobPhase)) + joint.bobOffset;

            } else {

                jointTranslations.y = joint.bob * Math.sin
                    (filter.degToRad(modifiers.bobFrequencyMultiplier * ft + joint.bobPhase)) + joint.bobOffset;

                // check for specified low pass filter for this joint (currently Hips bob only)
                if(animation.filters.hasOwnProperty(jointName) &&
                       'bobLPFilter' in animation.filters[jointName]) {

                    jointTranslations.y = filter.clipTrough(jointTranslations.y, joint, 2);
                    jointTranslations.y = animation.filters[jointName].bobLPFilter.process(jointTranslations.y);
                }
            }

            // thrust (oscillation on the z-axis)
            if(animation.filters.hasOwnProperty(jointName) &&
               'thrustFilter' in animation.filters[jointName]) {

                jointTranslations.z = joint.thrust * animation.filters[jointName].thrustFilter.calculate
                    (filter.degToRad(modifiers.thrustFrequencyMultiplier * ft + joint.thrustPhase)) + joint.thrustOffset;

            } else {

                jointTranslations.z = joint.thrust * Math.sin
                    (filter.degToRad(modifiers.thrustFrequencyMultiplier * ft + joint.thrustPhase)) + joint.thrustOffset;
            }

            return jointTranslations;
        },

        // helper function for renderMotion(). calculate joint rotations based on animation file settings and frequency * time
        calculateRotations: function(jointName, animation, ft, direction) {

            var joint = animation.joints[jointName];
            var jointRotations = {x:0, y:0, z:0};

            // gather modifiers and multipliers for this joint
            modifiers = new FrequencyMultipliers(joint, direction);

            // calculate rotations. Use synthesis filters where specified by the animation data file.

            // calculate pitch
            if(animation.filters.hasOwnProperty(jointName) &&
               'pitchFilter' in animation.filters[jointName]) {

                jointRotations.x = joint.pitch * animation.filters[jointName].pitchFilter.calculate
                    (filter.degToRad(ft * modifiers.pitchFrequencyMultiplier + joint.pitchPhase)) + joint.pitchOffset;

            } else {

                jointRotations.x = joint.pitch * Math.sin
                    (filter.degToRad(ft * modifiers.pitchFrequencyMultiplier + joint.pitchPhase)) + joint.pitchOffset;
            }

            // calculate yaw
            if(animation.filters.hasOwnProperty(jointName) &&
               'yawFilter' in animation.filters[jointName]) {

                jointRotations.y = joint.yaw * animation.filters[jointName].yawFilter.calculate
                    (filter.degToRad(ft * modifiers.yawFrequencyMultiplier + joint.yawPhase)) + joint.yawOffset;

            } else {

                jointRotations.y = joint.yaw * Math.sin
                    (filter.degToRad(ft * modifiers.yawFrequencyMultiplier + joint.yawPhase)) + joint.yawOffset;
            }

            // calculate roll
            if(animation.filters.hasOwnProperty(jointName) &&
               'rollFilter' in animation.filters[jointName]) {

                jointRotations.z = joint.roll * animation.filters[jointName].rollFilter.calculate
                    (filter.degToRad(ft * modifiers.rollFrequencyMultiplier + joint.rollPhase)) + joint.rollOffset;

            } else {

                jointRotations.z = joint.roll * Math.sin
                    (filter.degToRad(ft * modifiers.rollFrequencyMultiplier + joint.rollPhase)) + joint.rollOffset;
            }

            return jointRotations;
        },

        zeroAnimation: function(animation) {

            for (i in animation.joints) {

                animation.joints[i].pitch = 0;
                animation.joints[i].yaw = 0;
                animation.joints[i].roll = 0;
                animation.joints[i].pitchPhase = 0;
                animation.joints[i].yawPhase = 0;
                animation.joints[i].rollPhase = 0;
                animation.joints[i].pitchOffset = 0;
                animation.joints[i].yawOffset = 0;
                animation.joints[i].rollOffset = 0;
                if (i === "Hips") {

                    // Hips only
                    animation.joints[i].thrust = 0;
                    animation.joints[i].sway = 0;
                    animation.joints[i].bob = 0;
                    animation.joints[i].thrustPhase = 0;
                    animation.joints[i].swayPhase = 0;
                    animation.joints[i].bobPhase = 0;
                    animation.joints[i].thrustOffset = 0;
                    animation.joints[i].swayOffset = 0;
                    animation.joints[i].bobOffset = 0;
                }
            }
        },

        blendAnimation: function(sourceAnimation, targetAnimation, percent) {

            for (i in targetAnimation.joints) {

                targetAnimation.joints[i].pitch += percent * sourceAnimation.joints[i].pitch;
                targetAnimation.joints[i].yaw += percent * sourceAnimation.joints[i].yaw;
                targetAnimation.joints[i].roll += percent * sourceAnimation.joints[i].roll;
                targetAnimation.joints[i].pitchPhase += percent * sourceAnimation.joints[i].pitchPhase;
                targetAnimation.joints[i].yawPhase += percent * sourceAnimation.joints[i].yawPhase;
                targetAnimation.joints[i].rollPhase += percent * sourceAnimation.joints[i].rollPhase;
                targetAnimation.joints[i].pitchOffset += percent * sourceAnimation.joints[i].pitchOffset;
                targetAnimation.joints[i].yawOffset += percent * sourceAnimation.joints[i].yawOffset;
                targetAnimation.joints[i].rollOffset += percent * sourceAnimation.joints[i].rollOffset;
                if (i === "Hips") {

                    // Hips only
                    targetAnimation.joints[i].thrust += percent * sourceAnimation.joints[i].thrust;
                    targetAnimation.joints[i].sway += percent * sourceAnimation.joints[i].sway;
                    targetAnimation.joints[i].bob += percent * sourceAnimation.joints[i].bob;
                    targetAnimation.joints[i].thrustPhase += percent * sourceAnimation.joints[i].thrustPhase;
                    targetAnimation.joints[i].swayPhase += percent * sourceAnimation.joints[i].swayPhase;
                    targetAnimation.joints[i].bobPhase += percent * sourceAnimation.joints[i].bobPhase;
                    targetAnimation.joints[i].thrustOffset += percent * sourceAnimation.joints[i].thrustOffset;
                    targetAnimation.joints[i].swayOffset += percent * sourceAnimation.joints[i].swayOffset;
                    targetAnimation.joints[i].bobOffset += percent * sourceAnimation.joints[i].bobOffset;
                }
            }
        },

        deepCopy: function(sourceAnimation, targetAnimation) {

            // calibration
            targetAnimation.calibration = JSON.parse(JSON.stringify( sourceAnimation.calibration ));

            // harmonics
            if (isDefined(sourceAnimation.harmonics)) {

                targetAnimation.harmonics = JSON.parse(JSON.stringify(sourceAnimation.harmonics));
            }

            // filters
            for(i in sourceAnimation.filters) {

                // are any filters specified for this joint?
                if (isDefined(sourceAnimation.filters[i])) {

                    targetAnimation.filters[i] = sourceAnimation.filters[i];

                    // wave shapers
                    if (isDefined(sourceAnimation.filters[i].pitchFilter)) {

                        targetAnimation.filters[i].pitchFilter = sourceAnimation.filters[i].pitchFilter;
                    }
                    if (isDefined(sourceAnimation.filters[i].yawFilter)) {

                        targetAnimation.filters[i].yawFilter = sourceAnimation.filters[i].yawFilter;
                    }
                    if (isDefined(sourceAnimation.filters[i].rollFilter)) {

                        targetAnimation.filters[i].rollFilter = sourceAnimation.filters[i].rollFilter;
                    }

                    // LP filters
                    if (isDefined(sourceAnimation.filters[i].swayLPFilter)) {

                        targetAnimation.filters[i].swayLPFilter = sourceAnimation.filters[i].swayLPFilter;
                    }
                    if (isDefined(sourceAnimation.filters[i].bobLPFilter)) {

                        targetAnimation.filters[i].bobLPFilter = sourceAnimation.filters[i].bobLPFilter;
                    }
                    if (isDefined(sourceAnimation.filters[i].thrustLPFilter)) {

                        targetAnimation.filters[i].thrustLPFilter = sourceAnimation.filters[i].thrustLPFilter;
                    }
                }
            }

            // joints
            targetAnimation.joints = JSON.parse(JSON.stringify(sourceAnimation.joints));
        }
    }

})(); // end animation object literal

// finite state machine. Avatar locomotion modes represent states in the FSM
state = (function () {

    var _powerOn = true;

    return {

        // the finite list of states
        STATIC: 1,
        SURFACE_MOTION: 2,
        AIR_MOTION: 4,
        EDIT: 8,  // REMOVE_FOR_RELEASE

        currentState: this.STATIC,

        // status vars
        powerOn: _powerOn,

        setInternalState: function(newInternalState) {

            switch (newInternalState) {

                case this.SURFACE_MOTION:

                    this.currentState = this.SURFACE_MOTION;
                    return;

                case this.AIR_MOTION:

                    this.currentState = this.AIR_MOTION;
                    return;

                case this.EDIT:

                    this.currentState = this.EDIT; // REMOVE_FOR_RELEASE (all editing state references need removal)
                    return;

                case this.STATIC:
                default:

                    this.currentState = this.STATIC;
                    return;
            }
        }
    }
})(); // end state object literal


// Action objects
Action = function(actionName, duration, strength) {

    this.name = actionName;
    this.strength = isDefined(strength) ? strength : 1;
    this.progress = 0;
    this.duration = isDefined(duration) ? duration : actions[actionName].duration;
    this.reachPose = actions[actionName].reachPose;
    this.delay = actions[actionName].delay;
    this.attack = actions[actionName].attack;
    this.decay = actions[actionName].decay;
    this.sustain = actions[actionName].sustain;
    this.release = actions[actionName].release;
    this.smoothingFilter = filter.createAveragingFilter(actions[actionName].smoothing);//filter.createButterworthFilter8(3); //

    this.currentStrength = function() {

        // apply (D)ASDR envelope
        var segmentProgress = undefined; // progress through chosen segment
        var segmentTimeDelta = undefined; // total change in time over chosen segment
        var segmentStrengthDelta = undefined; // total change in strength over chosen segment
        var lastStrength = undefined; // the last value the previous segment held
        var currentStrength = undefined; // return value

        // select parameters based on segment (a segment being one of (D),A,S,D or R)
        if (this.progress >= this.sustain.timing) {

            // release segment
            segmentProgress = this.progress - this.sustain.timing;
            segmentTimeDelta = this.release.timing - this.sustain.timing;
            segmentStrengthDelta = this.release.strength - this.sustain.strength;
            lastStrength = this.sustain.strength;

        } else if (this.progress >= this.decay.timing) {

            // sustain phase
            segmentProgress = this.progress - this.decay.timing;
            segmentTimeDelta = this.sustain.timing - this.decay.timing;
            segmentStrengthDelta = this.sustain.strength - this.decay.strength;
            lastStrength = this.decay.strength;

        } else if (this.progress >= this.attack.timing) {

            // decay phase
            segmentProgress = this.progress - this.attack.timing;
            segmentTimeDelta = this.decay.timing - this.attack.timing;
            segmentStrengthDelta = this.decay.strength - this.attack.strength;
            lastStrength = this.attack.strength;

        } else if (this.progress >= this.delay.timing) {

            // attack phase
            segmentProgress = this.progress - this.delay.timing;
            segmentTimeDelta = this.attack.timing - this.delay.timing;
            segmentStrengthDelta = this.attack.strength - this.delay.strength;
            lastStrength = 0; //this.delay.strength;

        } else {

            // delay phase
            segmentProgress = this.progress;
            segmentTimeDelta = this.delay.timing;
            segmentStrengthDelta = this.delay.strength;
            lastStrength = 0;
        }

        currentStrength = segmentTimeDelta > 0 ? lastStrength + segmentStrengthDelta * segmentProgress / segmentTimeDelta
                                               : lastStrength;
        currentStrength *= this.strength;

        // smooth off the response curve
        currentStrength = this.smoothingFilter.process(currentStrength);
        return currentStrength;
    }
};

// constructor for animation Transition parameters with default settings
TransitionParameters = function() {

    this.duration = 0.7;
    this.actions = [];
    this.easingLower = {x:0.5, y:0.5};
    this.easingUpper = {x:0.5, y:0.5};
}

// constructor for animation Transition
Transition = function(nextAnimation, lastAnimation, lastTransition, playTransitionActions) {

    if (playTransitionActions === undefined ) {
        playTransitionActions = true;
    }

    //if(isDefined(lastAnimation)) print('New Transition from '+lastAnimation.name+' to '+ nextAnimation.name +' created. Using actions: '+playTransitionActions);

    this.id = motion.transitionCount++; // serial number for this transition REMOVE_FOR_RELEASE

    // record the current state of animation
    this.nextAnimation = nextAnimation;
    this.lastAnimation = lastAnimation;
    this.lastTransition = lastTransition;

    if (this.id > 0 && !isDefined(this.lastAnimation)) print('New Transition without valid last animation (no. '+this.id+') caller is '+this.caller);

    // collect information about the currently playing animation
    this.direction = motion.direction;
    this.lastDirection = motion.lastDirection;
    this.lastFrequencyTimeWheelPos = motion.frequencyTimeWheelPos;
    this.lastFrequencyTimeIncrement = motion.averageFrequencyTimeIncrement;
    this.lastFrequencyTimeWheelRadius = motion.frequencyTimeWheelRadius;
    this.stopAngle = 0; // what angle should we stop turning this frequency time wheel?
    this.degreesToTurn = 0; // total degrees to turn the ft wheel before the avatar stops (walk only)
    this.degreesRemaining = 0; // remaining degrees to turn the ft wheel before the avatar stops (walk only)
    this.lastElapsedFTDegrees = motion.elapsedFTDegrees; // degrees elapsed since last transition start
    motion.elapsedFTDegrees = 0; // reset ready for the next transtion

    // set the inital parameters for the transition
    this.parameters = new TransitionParameters();
    this.liveActions = []; // to be populate with action objects as per action names supplied by TransitionParameters

    if (walkAssets && isDefined(lastAnimation) && isDefined(nextAnimation)) {

        // start up any actions for this transition
        walkAssets.transitions.getTransitionParameters(lastAnimation, nextAnimation, this.parameters);
        if (playTransitionActions) {

            for(action in this.parameters.actions) {

                // create the action and add it to this Transition's live actions
                this.liveActions.push(new Action(this.parameters.actions[action]));
            }
        }
    }

    this.continuedMotionDuration = 0;
    this.startTime = new Date().getTime(); // Starting timestamp (seconds) - REMOVE_FOR_RELEASE - not used any more?
    this.progress = 0; // how far are we through the transition?
    this.filteredProgress = 0;
    this.startLocation = MyAvatar.position; // REMOVE_FOR_RELEASE - debug only?

    // will we need to continue motion? if the motor has been turned on, then we do
    if (jsMotor.isMotoring()) {

        // decide at which angle we should stop the frequency time wheel
        //var STOP_ANGLE = 0;
        var degreesToTurn = 0;
        var lastFrequencyTimeWheelPos = this.lastFrequencyTimeWheelPos;
        var lastElapsedFTDegrees = this.lastElapsedFTDegrees;

        //var debug = '';

        // set the stop angle depending on which quadrant of the walk cycle we are currently in
        // and decide whether we need to take an extra step to complete the walk cycle or not
        if(lastFrequencyTimeWheelPos <= 0 && lastElapsedFTDegrees < 180) {

            // we have not taken a complete step yet, so we advance to the second stop angle
            degreesToTurn = 180  - lastFrequencyTimeWheelPos;
            //debug += 'case 1';

        } else if(lastFrequencyTimeWheelPos > 0 && lastFrequencyTimeWheelPos <= 90) {

            // take an extra step to complete the walk cycle and stop at the second stop angle
            degreesToTurn = 180 - lastFrequencyTimeWheelPos;
            //debug += 'case 2';

        } else if(lastFrequencyTimeWheelPos > 90 && lastFrequencyTimeWheelPos <= 180) {

            // stop on the other foot at the second stop angle for this walk cycle
            degreesToTurn = 180 - lastFrequencyTimeWheelPos;
            //debug += 'case 3';

        } else if(lastFrequencyTimeWheelPos > 180 && lastFrequencyTimeWheelPos <= 270) {

            // take an extra step to complete the walk cycle and stop at the first stop angle
            degreesToTurn = 360 - lastFrequencyTimeWheelPos;
            //debug += 'case 4';

        } else {

            degreesToTurn = 360 - lastFrequencyTimeWheelPos;
            //debug += 'case 5';
        }
        this.stopAngle = 0; // TODO: finish clearing out stop angle
        this.degreesToTurn = degreesToTurn;
        this.degreesRemaining = degreesToTurn;

        // work out the distance we need to cover to complete the cycle
        var distance = degreesToTurn * avatar.calibration.strideLength / 180;

        // work out the duration for this transition (assuming starting from MAX_WALK_SPEED as we have already set that on the JS motor)
        //if (Vec3.length(motion.velocity) < 1.0 ) {

            this.continuedMotionDuration = distance / MAX_WALK_SPEED;

        //} else {

        //    this.continuedMotionDuration = distance / Vec3.length(motion.velocity);
        //}

        // do we need more time to complete the cyccle than the set duration allows?
        if (this.continuedMotionDuration > this.parameters.duration) {

            this.parameters.duration = this.continuedMotionDuration;
        }

        //print('Will turn the ftwheel through '+degreesToTurn.toFixed(1) +
        //                ' degrees to advance the avi '+distance.toFixed(3) +
        //                'm in '+this.continuedMotionDuration.toFixed(2)+' seconds'+
        //                ' motion.direction is '+motion.direction+
        //                ' motion.lastDirection is '+motion.lastDirection +
        //                ' .'+debug);
    }
    //if (this.id > 0) print('Transition '+this.id+' started. Last anim is '+this.lastAnimation.name+' next is '+this.nextAnimation.name);

    // deal with transition recursion (overlapping transitions)
    this.recursionDepth = 0;
    this.incrementRecursion = function() {

        this.recursionDepth += 1;

        // cancel any continued motion
        this.degreesToTurn = 0;

        if(this.lastTransition !== nullTransition) {

            this.lastTransition.incrementRecursion();

            if(this.lastTransition.recursionDepth > MAX_TRANSITION_RECURSION) {

                this.lastTransition.die();
                this.lastTransition = nullTransition;
            }
        }
    };

    if(this.lastTransition !== nullTransition) {

        this.lastTransition.incrementRecursion();
    }


    // end of transition initialisation. begin transition public methods


    this.advancePreviousFrequencyTimeWheel = function(deltaTime) {

        var wheelAdvance = undefined;

        if (this.lastAnimation === avatar.selectedWalk &&
            this.nextAnimation === avatar.selectedIdle) {

            if(this.degreesRemaining <= 0) {

                // stop continued motion
                wheelAdvance = 0;
                if (jsMotor.isMotoring()) {

                    jsMotor.applyBrakes();
                    //walkTools.toLog('Final step/s complete. Distance travelled = ' +Vec3.distance(this.startLocation, MyAvatar.position).toFixed(3)+'m');
                }

            } else {

                wheelAdvance = this.degreesRemaining * deltaTime / this.continuedMotionDuration;
                var distanceToTravel = avatar.calibration.strideLength * wheelAdvance / 180;
                var MIN_BRAKING_DISTANCE = 0.01;

                if (distanceToTravel < MIN_BRAKING_DISTANCE) {

                    distanceToTravel = 0;
                    this.degreesRemaining = 0;

                } else {

                    this.degreesRemaining -= wheelAdvance;
                }
                var newSpeed = distanceToTravel / deltaTime > MAX_WALK_SPEED ? MAX_WALK_SPEED : distanceToTravel / deltaTime;

                jsMotor.setMotorSpeed(newSpeed, SHORT_TIME);

                //print('Still motoring: degreesRemaining = '+this.degreesRemaining.toFixed(1)+
                //      ' this.degreesToTurn: '+this.degreesToTurn.toFixed(2) +
                //      ' this.continuedMotionDuration: '+this.continuedMotionDuration.toFixed(2)+
                //      ' distance travelled: ' +Vec3.distance(this.startLocation, MyAvatar.position).toFixed(3)+
                //      'm distance to travel is '+distanceToTravel.toFixed(3)+'m' +
                //      ' at speed '+newSpeed.toFixed(2)+' m/s');
            }

        } else {

            wheelAdvance = this.lastFrequencyTimeIncrement;
            //print('Transition '+this.id+
            //      ' is advancing the ft wheel by '+this.lastFrequencyTimeIncrement.toFixed(3)+
            //      ' this.lastAnimation is '+this.lastAnimation.name+
            //      ' this.nextAnimation is '+this.nextAnimation.name);
        }

        // advance the ft wheel
        this.lastFrequencyTimeWheelPos += wheelAdvance;
        if (this.lastFrequencyTimeWheelPos >= 360) {

            this.lastFrequencyTimeWheelPos = this.lastFrequencyTimeWheelPos % 360;
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

        var elapasedTime = (new Date().getTime() - this.startTime) / 1000;
        this.progress = elapasedTime / this.parameters.duration;
        this.progress = Math.round(this.progress * 1000) / 1000;

        // updated nested transition/s
        if(this.lastTransition !== nullTransition) {

            if(this.lastTransition.updateProgress() === TRANSITION_COMPLETE) {

                //walkTools.toLog('walkAPI.js, line 1093: killing transition ' + this.lastTransition.id +
                //            ' - was recursion level '+this.lastTransition.recursionDepth +
                //            '. last anim '+this.lastTransition.lastAnimation.name+
                //            ', next anim '+this.lastTransition.nextAnimation.name);

                // the previous transition is now complete
                this.lastTransition.die();
                this.lastTransition = nullTransition;
            }
        }

        // update any actions
        for(action in this.liveActions) {

            // use independent timing for actions so as not to apply Bezier response above
            this.liveActions[action].progress += (motion.deltaTime / this.liveActions[action].duration);

            if (this.liveActions[action].progress >= 1) {

                // time to kill off this action
                this.liveActions.splice(action, 1);
            }
        }

        this.filteredProgress = filter.bezier(this.progress, this.parameters.easingLower, this.parameters.easingUpper);

        return this.progress >= 1 ? TRANSITION_COMPLETE : false;
    };

    this.blendTranslations = function(frequencyTimeWheelPos, direction) {

        var lastTranslations = {x:0, y:0, z:0};
        var nextTranslations = animationOperations.calculateTranslations(this.nextAnimation,
                                                                         frequencyTimeWheelPos,
                                                                         direction);

        // are we blending with a previous, still live transition?
        if(this.lastTransition !== nullTransition) {

            lastTranslations = this.lastTransition.blendTranslations(this.lastFrequencyTimeWheelPos,
                                                                     this.lastDirection);

        } else {

            lastTranslations = animationOperations.calculateTranslations(this.lastAnimation,
                                                     this.lastFrequencyTimeWheelPos,
                                                     this.lastDirection);
        }

        nextTranslations.x = this.filteredProgress * nextTranslations.x +
                             (1 - this.filteredProgress) * lastTranslations.x;

        nextTranslations.y = this.filteredProgress * nextTranslations.y +
                             (1 - this.filteredProgress) * lastTranslations.y;

        nextTranslations.z = this.filteredProgress * nextTranslations.z +
                             (1 - this.filteredProgress) * lastTranslations.z;

        if (this.liveActions.length > 0) {

            for(action in this.liveActions) {

                var actionStrength = filter.bezier(this.liveActions[action].currentStrength(), {x:1, y:0}, {x:0, y:1});
                var poseTranslations = animationOperations.calculateTranslations(walkAssets.getReachPose(this.liveActions[action].reachPose),
                                                             frequencyTimeWheelPos,
                                                             direction);

                if(Math.abs(poseTranslations.x) > 0) {

                    nextTranslations.x = actionStrength * poseTranslations.x +
                                        (1 - actionStrength) * nextTranslations.x;
                }

                if(Math.abs(poseTranslations.y) > 0) {

                    nextTranslations.y = actionStrength * poseTranslations.y +
                                        (1 - actionStrength) * nextTranslations.y;
                }

                if(Math.abs(poseTranslations.z) > 0) {

                    nextTranslations.z = actionStrength * poseTranslations.z +
                                        (1 - actionStrength) * nextTranslations.z;
                }
            }
        }

        return nextTranslations;
    };

    this.blendRotations = function(jointName, frequencyTimeWheelPos, direction) {

        //print('Transition '+this.id+' is blending rotations. direction is '+direction+' for '+this.nextAnimation.name+' and last direction is '+this.lastDirection+ ' for '+this.lastAnimation.name);

        var lastRotations = {x:0, y:0, z:0};
        var nextRotations = animationOperations.calculateRotations(jointName,
                                               this.nextAnimation,
                                               frequencyTimeWheelPos,
                                               direction);

        // attenuate transition effects for shorter steps
        var shortStepAdjust = 1;
        var SHORT_STEP = 120; // minimum ft wheel degrees turned to define a short step

        if (this.lastAnimation === avatar.selectedWalk &&
            this.lastElapsedFTDegrees < SHORT_STEP) {

            shortStepAdjust = 1 - ((SHORT_STEP - this.lastElapsedFTDegrees) / SHORT_STEP);
            shortStepAdjust = filter.bezier(shortStepAdjust, {x:1, y:0}, {x:0, y:1});
        }

        // are we blending with a previous, still live transition?
        if(this.lastTransition !== nullTransition) {

            lastRotations = this.lastTransition.blendRotations(jointName,
                                                               this.lastFrequencyTimeWheelPos,
                                                               this.lastDirection);
        } else {

            lastRotations = animationOperations.calculateRotations(jointName,
                                               this.lastAnimation,
                                               this.lastFrequencyTimeWheelPos,
                                               this.lastDirection);
        }

        nextRotations.x = shortStepAdjust * this.filteredProgress * nextRotations.x +
                          (1 - shortStepAdjust * this.filteredProgress) * lastRotations.x;

        nextRotations.y = shortStepAdjust * this.filteredProgress * nextRotations.y +
                          (1 - shortStepAdjust * this.filteredProgress) * lastRotations.y;

        nextRotations.z = shortStepAdjust * this.filteredProgress * nextRotations.z +
                          (1 - shortStepAdjust * this.filteredProgress) * lastRotations.z;


        // are there actions defined for this transition?
        if (this.liveActions.length > 0) {

            for(action in this.liveActions) {

                var actionStrength = filter.bezier(this.liveActions[action].currentStrength(), {x:1, y:0}, {x:0, y:1});
                var poseRotations = animationOperations.calculateRotations(jointName,
                                                       walkAssets.getReachPose(this.liveActions[action].reachPose),
                                                       frequencyTimeWheelPos,
                                                       direction);
                if(Math.abs(poseRotations.x) > 0) {

                    nextRotations.x = shortStepAdjust * actionStrength * poseRotations.x +
                                     (1 - shortStepAdjust * actionStrength) * nextRotations.x;
                }

                if(Math.abs(poseRotations.y) > 0) {

                    nextRotations.y = shortStepAdjust * actionStrength * poseRotations.y +
                                     (1 - shortStepAdjust * actionStrength) * nextRotations.y;
                }

                if(Math.abs(poseRotations.z) > 0) {

                    nextRotations.z = shortStepAdjust * actionStrength * poseRotations.z +
                                     (1 - shortStepAdjust * actionStrength) * nextRotations.z;
                }
            }
        }

        return nextRotations;
    };

    this.die = function() {

        if (jsMotor.isMotoring()) {

            jsMotor.applyBrakes();
        }
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

    if (isDefined(joint)) {

        if (isDefined(joint.pitchFrequencyMultiplier)) {
            this.pitchFrequencyMultiplier = joint.pitchFrequencyMultiplier;
        }
        if (isDefined(joint.yawFrequencyMultiplier)) {
            this.yawFrequencyMultiplier = joint.yawFrequencyMultiplier;
        }
        if (isDefined(joint.rollFrequencyMultiplier)) {
            this.rollFrequencyMultiplier = joint.rollFrequencyMultiplier;
        }
        if (isDefined(joint.swayFrequencyMultiplier)) {
            this.swayFrequencyMultiplier = joint.swayFrequencyMultiplier;
        }
        if (isDefined(joint.bobFrequencyMultiplier)) {
            this.bobFrequencyMultiplier = joint.bobFrequencyMultiplier;
        }
        if (isDefined(joint.thrustFrequencyMultiplier)) {
            this.thrustFrequencyMultiplier = joint.thrustFrequencyMultiplier;
        }
    }
};