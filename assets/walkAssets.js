//
//  walkAssets.js
//
//  version 1.1
//
//  Created by David Wooldridge, Autumn 2014
//
//  Organises, loads up and makes available the assets for use by the walk.js script v1.2+
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkAssets = (function () {

    var _animationSetPath = 'animation-sets/standard-male/';

    // load the sound files
    var _footsteps = [];
    _footsteps.push(SoundCache.getSound(pathToAssets + _animationSetPath + "sounds/FootstepW2Left-12db.wav"));
    _footsteps.push(SoundCache.getSound(pathToAssets + _animationSetPath + "sounds/FootstepW2Right-12db.wav"));
    _footsteps.push(SoundCache.getSound(pathToAssets + _animationSetPath + "sounds/FootstepW3Left-12db.wav"));
    _footsteps.push(SoundCache.getSound(pathToAssets + _animationSetPath + "sounds/FootstepW3Right-12db.wav"));
    _footsteps.push(SoundCache.getSound(pathToAssets + _animationSetPath + "sounds/FootstepW5Left-12db.wav"));
    _footsteps.push(SoundCache.getSound(pathToAssets + _animationSetPath + "sounds/FootstepW5Right-12db.wav"));

    // load the animation datafiles
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-walk-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-walk-backwards-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-idle-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-backwards-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-up-animation.js");    
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-down-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-hover-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-sidestep-left-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-sidestep-right-animation.js");

    // load reach pose datafiles
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-2-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-3-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-4-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-hover-to-idle-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-fly-to-walk-reach-pose.js");

    // load the transition parameters datafile
    Script.include(pathToAssets +_animationSetPath +  "transition-parameters.js");

    // load the reachPose parameters datafile
    Script.include(pathToAssets +_animationSetPath +  "reach-pose-parameters.js");

    // blank animation buffer
    Script.include(pathToAssets + "miscellaneous/animation-buffer.js");

    // load the animation reference datafile
    Script.include(pathToAssets + "miscellaneous/animation-reference.js");

    // animations
    var _animations = [];
    _animations.push(new MaleWalk());
    _animations.push(new MaleWalkBackwards());
    _animations.push(new MaleSideStepLeft());
    _animations.push(new MaleSideStepRight());
    _animations.push(new MaleIdle());    
    _animations.push(new MaleFly());
    _animations.push(new MaleFlyBackwards());
    _animations.push(new MaleFlyDown());
    _animations.push(new MaleFlyUp());
    _animations.push(new MaleHover());

    // buffers
    _animations.push(new Buffer("FlyBlend"));
    _animations.push(new Buffer("WalkBlend"));

    // reach poses
    var _reachPoseDataFiles = [];
    _reachPoseDataFiles.push(new MaleIdleToWalkRP());
    _reachPoseDataFiles.push(new MaleIdleToWalk2RP());
    _reachPoseDataFiles.push(new MaleIdleToWalk3RP());
    _reachPoseDataFiles.push(new MaleIdleToWalk4RP());
    _reachPoseDataFiles.push(new MaleHoverToIdleRP());
    _reachPoseDataFiles.push(new MaleFlyToWalkRP());

    // animation reference (lists joints, defines IK chains)
    var _animationReference = new AnimationReference();

    return {
        // expose the sounds
        footsteps: _footsteps,
        
        // expose the animation reference
        animationReference: _animationReference,
        
        // populates passed transitionParameters object with any situation specific params from transition-parameters.js
        getTransitionParameters: function(lastAnimation, nextAnimation, transitionParameters) {
            transitionParameterData.fetch(lastAnimation, nextAnimation, transitionParameters);
        },

        // fetch reach pose parameters by name
        getReachPoseParameters: function(reachPoseName) {
            for (pose in reachPoseParameters) {
                if (reachPoseParameters[pose].name === reachPoseName) {
                    return reachPoseParameters[pose];
                }
            }
            return undefined;
        },

        // fetch reach pose data file by name
        getReachPoseDataFile: function(reachPoseName) {
            for (pose in _reachPoseDataFiles) {
                if (_reachPoseDataFiles[pose].name === reachPoseName) {
                    return _reachPoseDataFiles[pose];
                }
            }
            return undefined;
        },

        // fetch animation data file by name
        getAnimationDataFile: function(animationName) {
            for (animation in _animations) {
                if (_animations[animation].name === animationName) {
                    return _animations[animation];
                }
            }
            return undefined;
        },
        
        // walkTools - REMOVE_FOR_RELEASE - return array containing names of all animations and reach poses
        getAnimationNamesAsArray: function() {
            var allAnimations = [];
            for (animation in _animations) {
                allAnimations.push(_animations[animation].name);
            }
            for (pose in _reachPoseDataFiles) {
                allAnimations.push(_reachPoseDataFiles[pose].name);
            }
            return allAnimations;
        }       
    }
})();