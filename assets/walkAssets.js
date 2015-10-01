//
//  walkAssets.js
//  version 1.1
//
//  Created by David Wooldridge, June 2015
//  Copyright © 2014 - 2015 High Fidelity, Inc.
//
//  Organises, loads up and makes available the assets for use by the walk.js script
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

walkAssets = (function () {

    //var HIFI_PUBLIC_BUCKET = "https://hifi-public.s3.amazonaws.com/";
    //var _pathToAssets = HIFI_PUBLIC_BUCKET + "procedural-animator/assets/";
    //var _pathToAssets = 'http://localhost/downloads/hf/scripts/walk-1.4-beta/assets/'; // path to local copy of assets folder - REMOVE_FOR_RELEASE
    var _pathToAssets = "https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/assets/";

    var _animationSets = {
        "Male": {
            path: 'animation-sets/standard-male/'
        },
        "Original": {
            path: 'animation-sets/original-male/'
        }
    };
    var _currentAnimationSet = 'Male';
    var _character = null;

    // load json datafiles
    function loadFile(path, name) {
        var _XMLHttpRequest = new XMLHttpRequest();
        _XMLHttpRequest.open("GET", path, false);
        _XMLHttpRequest.send();
        if (_XMLHttpRequest.status == 200) {
            try {
                var file = JSON.parse(_XMLHttpRequest.responseText);
                if (name === undefined) {
                    name = file.name;
                }
                file.name = name;
                return file;
            } catch (e) {
                print('walk.js: Error parsing JSON data for '+path+': '+e.toString());
                print('walk.js: Response text was '+_XMLHttpRequest.responseText);
                return null;
            }
        } else {
            print("walk.js: Error "+_XMLHttpRequest.status+" encountered whilst loading JSON file from "+path);
            return null;
        }
    }

    // load json animation datafiles
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
                    }
                }
                return animation;
            } catch (e) {
                print('walk.js: Error parsing JSON data for '+path+': '+e.toString());
                print('walk.js: Response text was '+_XMLHttpRequest.responseText);
                return null;
            }
        } else {
            print("walk.js: Error "+_XMLHttpRequest.status+" encountered whilst loading JSON file from "+path);
            return null;
        }
    }

    function loadAnimationSet() {

        // load the character animation definition file
        print('walk.js: Loading animation set "'+_currentAnimationSet+'" from '+ _pathToAssets + _animationSets[_currentAnimationSet].path);
        _character = loadFile(_pathToAssets + _animationSets[_currentAnimationSet].path + "character.json");

        // load animations data
        for (animation in _character.animations) {
            _character.animations[animation] = loadAnimation(_pathToAssets + _character.animations[animation].path);
            print('walk.js: Loaded ' + _character.animations[animation].name+' animation');
        }

        // load reach poses data
        for (pose in _character.reachPoses) {
            _character.reachPoses[pose].animation = loadAnimation(_pathToAssets + _character.reachPoses[pose].path);
            print('walk.js: Loaded ' + _character.reachPoses[pose].animation.name+ ' reach pose');
        }

        // load sounds
        for (sound in _character.sounds) {
            _character.sounds[sound].audioData = SoundCache.getSound(_pathToAssets + _character.sounds[sound].path);
        }
        print('walk.js: Loaded audio files');

        // create walk and fly animation blending buffers
        var flyBlend = loadFile(_pathToAssets + "miscellaneous/animation-buffer.json", "FlyBlend");
        var walkBlend = loadFile(_pathToAssets + "miscellaneous/animation-buffer.json", "WalkBlend");
        _character.animations["FlyBlend"] = flyBlend;
        _character.animations["WalkBlend"] = walkBlend;
        print('walk.js: Buffers created');

        // add a t-pose
        _character.animations["T-Pose"] = loadAnimation(_pathToAssets + "miscellaneous/t-pose.json");

        if (avatar) {
            avatar.loadAnimations();
        }
        print('walk.js: '+_currentAnimationSet + ' animation set loaded');
    }

    // initialise
    var _animationReference = loadFile(_pathToAssets + "miscellaneous/animation-reference.json");
    var _preRotations = loadFile(_pathToAssets + "miscellaneous/pre-rotations.json");
    loadAnimationSet();

    return {

        // expose the reference files
        animationReference: _animationReference,
        preRotations: _preRotations,

        // fetch animation data file by name
        getAnimation: function(animationName) {
            var animation = null;
            try {
                animation = _character.animations[animationName];
            } catch(e) {
                print('walk.js: Animation '+animationName+' not found');
            }
            return animation;
        },

        // fetch reach pose data file by name
        getReachPose: function(reachPoseName) {
            var reachPose = null;
            try {
                reachPose = _character.reachPoses[reachPoseName].animation;
            } catch(e) {
                print('walk.js: Reach pose '+reachPoseName+' not found');
            }
            return reachPose;
        },

        // fetch transition parameters
        getTransitionParameters: function(lastAnimationName, nextAnimationName) {
            // defaults for when no parameters are defined for this character
            var transitionParameters = {
                duration: 0.5,
                easingLower: {x:0.5, y:0.0},
                easingUpper: {x:0.5, y:1.0}
            }
            try {
                if (_character.transitions[lastAnimationName]) {
                    if (_character.transitions[lastAnimationName][nextAnimationName]) {
                        transitionParameters = _character.transitions[lastAnimationName][nextAnimationName];
                    }
                }
            } catch (e) {
                print('walk.js: Transition parameters for '+lastAnimationName+' to '+nextAnimationName+' not found - using default values');
            }
            return transitionParameters;
        },

        // fetch reach pose parameters by name
        getReachPoseParameters: function(reachPoseName) {
            var reachPoseParameters = undefined;
            try {
                reachPoseParameters = _character.reachPoses[reachPoseName];
            } catch (e) {
                print('walk.js: Reach pose parameters for '+reachPoseName+' not found');
            }
            return reachPoseParameters;
        },

        getSound: function(soundName) {
            return _character.sounds[soundName];
        },

        // return array containing names of all animations and reach poses
        getAnimationNamesAsArray: function() {
            var allAnimations = [];
            for (animation in _character.animations) {
                if (_character.animations[animation].name !== "WalkBlend" &&
                    _character.animations[animation].name !== "FlyBlend") {
                    allAnimations.push(_character.animations[animation].name);
                }
            }
            for (pose in _character.reachPoses) {
                allAnimations.push(_character.reachPoses[pose].animation.name);
            }
            return allAnimations;
        },

        // animation set stuff
        getAnimationSets: function() {
            var animationSetNames = [];
            for (set in _animationSets) {
                animationSetNames.push(set);
            }
            return animationSetNames;
        },

        setAnimationSet: function(animationSetName) {
            print('setting animation set to '+animationSetName);
            for (set in _animationSets) {
                if (set === animationSetName) {
                    _currentAnimationSet = set;
                    loadAnimationSet();
                    print('walk.js: Loaded '+_currentAnimationSet+' animation set');
                }
            }
        },

        getCurrentAnimationSet: function() {
            return _currentAnimationSet;
        },

        createAnimationBuffer: function(bufferName) {
            var newBuffer = loadFile(_pathToAssets + "miscellaneous/animation-buffer.json", bufferName);
            return newBuffer;
        },

        setPathToAssets: function(newPath) {
            _pathToAssets = newPath;
            loadAnimationSet();
        }
    }
})();