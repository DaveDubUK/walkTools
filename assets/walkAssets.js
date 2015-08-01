//
//  walkAssets.js
//  version 1.1
//
//  Created by David Wooldridge, June 2015
//  Copyright © 2014 - 2015 High Fidelity, Inc.
//
//  Organises, loads up and makes available the assets for use by the walk.js script v1.2+
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkAssets = (function () {

    //const HIFI_PUBLIC_BUCKET = "https://hifi-public.s3.amazonaws.com/";
    //const _pathToAssets = HIFI_PUBLIC_BUCKET + "procedural-animator/assets/";

    var _pathToAssets = 'http://localhost/downloads/hf/scripts/walk-1.4-beta/assets/'; // path to local copy of assets folder - REMOVE_FOR_RELEASE
    var _animationSetPath = 'animation-sets/standard-male/';

    // asset storage
    var _animationSets = [
        {
            name: 'Female',
            url: 'animation-sets/standard-female/'
        },
        { 
            name: 'Male', 
            url: 'animation-sets/standard-male/'
        },
        {
            name: 'Original',
            url: 'animation-sets/original-male/'
        }
    ];
    var _currentAnimationSet = _animationSets[1];
    var _animations = [];
    var _reachPoses = [];
    var _footsteps = [];
    var _transitionParameters = null;

    // load the sound files
    _footsteps.push(SoundCache.getSound(_pathToAssets + _animationSetPath + "sounds/FootstepW2Left-12db.wav"));
    _footsteps.push(SoundCache.getSound(_pathToAssets + _animationSetPath + "sounds/FootstepW2Right-12db.wav"));
    _footsteps.push(SoundCache.getSound(_pathToAssets + _animationSetPath + "sounds/FootstepW3Left-12db.wav"));
    _footsteps.push(SoundCache.getSound(_pathToAssets + _animationSetPath + "sounds/FootstepW3Right-12db.wav"));
    _footsteps.push(SoundCache.getSound(_pathToAssets + _animationSetPath + "sounds/FootstepW5Left-12db.wav"));
    _footsteps.push(SoundCache.getSound(_pathToAssets + _animationSetPath + "sounds/FootstepW5Right-12db.wav"));

    // load the animation json datafiles
    function loadAnimation(path) {
        var _XMLHttpRequest = new XMLHttpRequest();
        _XMLHttpRequest.open("GET", path, false);
        _XMLHttpRequest.send();
        if (_XMLHttpRequest.status == 200) {
            try {
                var animation = JSON.parse(_XMLHttpRequest.responseText);
                // instantiate harmonics filters
                for (joint in animation.harmonics) {
                    for (jointHarmonics in animation.harmonics[joint]) {
                        var name = joint+'.'+jointHarmonics;
                        var magnitudes = animation.harmonics[joint][jointHarmonics].magnitudes;
                        var phaseAngles = animation.harmonics[joint][jointHarmonics].phaseAngles;
                        var numHarmonics = animation.harmonics[joint][jointHarmonics].numHarmonics;
                        animation.harmonics[joint][jointHarmonics] =
                            filter.createHarmonicsFilter(numHarmonics, magnitudes, phaseAngles);
                        //if (path === (_pathToAssets + _animationSetPath + "animations/walk-animation.json") &&
                        //   (joint === "LeftUpLeg" || joint === "RightUpLeg")) {
                        //    print('Created '+jointHarmonics+' filter for '+joint+' joint using magnitudes: '+magnitudes);
                        //    print('Created '+jointHarmonics+' filter for '+joint+' joint using phase angles: '+phaseAngles);
                        //}
                    }
                }
                print(animation.name + ' animation file loaded');
                return animation;
            } catch (e) {
                print('Error parsing JSON data for '+path+': '+e.toString());
                print('Response text was '+_XMLHttpRequest.responseText);
                return null;
            }
        } else {
            print("Error "+_XMLHttpRequest.status+" encountered whilst loading JSON file from "+path);
            return null;
        }
    }

    // load the JSON animation files
    // note: loading synchronously, as there's no point running the script beforehand
    print('Loading JSON animation files');
    var idle = loadAnimation(_pathToAssets + _animationSetPath + "animations/idle-animation.json");
    //var idle = loadAnimation(_pathToAssets + _animationSetPath + "animations/experiment.json");
    
    var walk = loadAnimation(_pathToAssets + _animationSetPath + "animations/walk-animation.json"); 
    var walkBackwards = loadAnimation(_pathToAssets + _animationSetPath + "animations/walk-backwards-animation.json");
    var sideStepLeft = loadAnimation(_pathToAssets + _animationSetPath + "animations/sidestep-left-animation.json");
    var sideStepRight = loadAnimation(_pathToAssets + _animationSetPath + "animations/sidestep-right-animation.json");
    var fly = loadAnimation(_pathToAssets + _animationSetPath + "animations/fly-animation.json");
    var flyBackwards = loadAnimation(_pathToAssets + _animationSetPath + "animations/fly-backwards-animation.json");
    var flyUp = loadAnimation(_pathToAssets + _animationSetPath + "animations/fly-up-animation.json");
    var flyDown = loadAnimation(_pathToAssets + _animationSetPath + "animations/fly-down-animation.json");
    var hover = loadAnimation(_pathToAssets + _animationSetPath + "animations/hover-animation.json");

    _animations.push(idle);
    _animations.push(walk);
    _animations.push(walkBackwards);
    _animations.push(sideStepLeft);
    _animations.push(sideStepRight);
    _animations.push(fly);
    _animations.push(flyBackwards);
    _animations.push(flyUp);
    _animations.push(flyDown);
    _animations.push(hover);

    // load the reach pose files
    var idleToWalk = loadAnimation(_pathToAssets + _animationSetPath + "reach-poses/male-idle-to-walk-reach-pose.json");
    var idleToWalk2 = loadAnimation(_pathToAssets + _animationSetPath + "reach-poses/male-idle-to-walk-2-reach-pose.json");
    var idleToWalk3 = loadAnimation(_pathToAssets + _animationSetPath + "reach-poses/male-idle-to-walk-3-reach-pose.json");
    var idleToWalk4 = loadAnimation(_pathToAssets + _animationSetPath + "reach-poses/male-idle-to-walk-4-reach-pose.json");
    var hoverToIdle = loadAnimation(_pathToAssets + _animationSetPath + "reach-poses/male-hover-to-idle-reach-pose.json");
    var flyToWalk = loadAnimation(_pathToAssets + _animationSetPath + "reach-poses/male-fly-to-walk-reach-pose.json");

    _reachPoses.push(idleToWalk);
    _reachPoses.push(idleToWalk2);
    _reachPoses.push(idleToWalk3);
    _reachPoses.push(idleToWalk4);
    _reachPoses.push(hoverToIdle);
    _reachPoses.push(flyToWalk);

    print('JSON animation files loaded');

    // load the transition parameters datafile
    Script.include(_pathToAssets + _animationSetPath + "transition-parameters.js");
    _transitionParameters = transitionParameters;

    // load the reachPose parameters datafile
    Script.include(_pathToAssets + _animationSetPath + "reach-pose-parameters.js");

    // blank animation buffer
    Script.include(_pathToAssets + "miscellaneous/animation-buffer.js");

    // load the animation reference datafile
    Script.include(_pathToAssets + "miscellaneous/animation-reference.js");

    // load the Blender pre-rotations
    Script.include(_pathToAssets + "miscellaneous/mixamo-pre-rotations.js");

    // instantiate buffers
    _animations.push(new Buffer("FlyBlend"));
    _animations.push(new Buffer("WalkBlend"));

    // animation reference (lists joints, defines IK chains)
    var _animationReference = new AnimationReference();

    // Blender pre-rotations
    var _mixamoPreRotations = new MixamoPreRotations();

    return {
        // expose the sounds
        footsteps: _footsteps,

        // expose the animation reference
        animationReference: _animationReference,

        // expose the Blender pre-rotations
        mixamoPreRotations: _mixamoPreRotations,

        // populates passed transitionParameters object with any situation specific params from transition-parameters.js
        getTransitionParameters: function(lastAnimation, nextAnimation, transitionParameters) {
            _transitionParameters.fetch(lastAnimation, nextAnimation, transitionParameters);
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
            for (pose in _reachPoses) {
                if (_reachPoses[pose].name === reachPoseName) {
                    return _reachPoses[pose];
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
        
        // fetch the list of current animation sets
        //getAnimationSets: function() {
            
        //}
    }
})();