//
//  walkAssets.js
//
//  version 1.1
//
//  Created by David Wooldridge, Autumn 2014
//
//  Organises, loads up and makes available the assets for use by the walk.js script v1.25
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkAssets = (function () {

    var _animationSetPath = 'animation-sets/standard-male/';

    // load the sounds
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
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-up-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-fly-down-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-soar-fly.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-rapid-fly.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-hover-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-sidestep-left-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-sidestep-right-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-turn-left-animation.js");
    Script.include(pathToAssets + _animationSetPath + "animations/dd-male-turn-right-animation.js");

    // load reach pose datafiles
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-2-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-3-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-idle-to-walk-4-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-walk-to-idle-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-fly-to-walk-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-walk-to-fly-reach-pose.js");
    Script.include(pathToAssets + _animationSetPath + "reach-poses/dd-male-hover-to-idle-reach-pose.js");

    // load the transitions datafile
    Script.include(pathToAssets +_animationSetPath +  "transitions.js");

    // load the actions datafile
    Script.include(pathToAssets +_animationSetPath +  "actions.js");

    // animation buffer prototype
    Script.include(pathToAssets + "miscellaneous/animation-buffer.js");

    // load the animation reference datafile
    Script.include(pathToAssets + "miscellaneous/animation-reference.js");

    // animations
    var _animations = [];
    _animations.push(new MaleWalk(filter));
    _animations.push(new MaleWalkBackwards());
    _animations.push(new MaleIdle());
    _animations.push(new MaleSideStepLeft());
    _animations.push(new MaleSideStepRight());
    _animations.push(new MaleTurnLeft());
    _animations.push(new MaleTurnRight());
    _animations.push(new MaleFly());
    _animations.push(new MaleFlyDown());
    _animations.push(new MaleFlyUp());
    _animations.push(new MaleHover());

    // flying modifiers
    _animations.push(new RapidFly());
    _animations.push(new SoarFly());

    // buffers
    _animations.push(new Buffer("FlyBlend"));
    _animations.push(new Buffer("WalkBlend"));

    // reach poses
    var _reachPoses = [];
    _reachPoses.push(new MaleIdleToWalkRP());
    _reachPoses.push(new MaleIdleToWalk2RP());
    _reachPoses.push(new MaleIdleToWalk3RP());
    _reachPoses.push(new MaleIdleToWalk4RP());
    _reachPoses.push(new MaleWalkToIdleRP());
    _reachPoses.push(new MaleFlyToWalkRP());
    _reachPoses.push(new MaleWalkToFlyRP());
    _reachPoses.push(new MaleHoverToIdleRP());

    // transitions
    var _transitions = transitions;

    // actions
    var _actions = actions;

    // animation reference (lists joints, defines IK chains)
    var _animationReference = new AnimationReference();

    return {

        // expose the sound assets
        footsteps: _footsteps,

        // expose the animations
        animations: _animations,

        // expose the animation reference
        animationReference: _animationReference,

        // expose the actions
        actions: _actions,

        // expose the transitions
        transitions: _transitions,

        // fetch reach pose by name
        getReachPose: function(reachPoseName) {

            for (reachPose in _reachPoses) {

                if (_reachPoses[reachPose].name === reachPoseName) {

                    return _reachPoses[reachPose];
                }
            }
            return undefined;
        },

        // fetch animation by name
        getAnimation: function(animationName) {

            for (animation in _animations) {

                if (_animations[animation].name === animationName) {

                    return _animations[animation];
                }
            }
            return undefined;
        },

        // return array containing names of all animations and reach poses
        getAnimationNamesAsArray: function() {

            var allAnimations = [];

            for (animation in _animations) {

                allAnimations.push(_animations[animation].name);
            }
            for (pose in _reachPoses) {

                allAnimations.push(_reachPoses[pose].name);
            }
            return allAnimations;
        }
    }

})();