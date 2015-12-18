//
//  walkToolsBVHPlayer.js
//  version 0.1
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge
//
//  Loads a bvh file and plays it
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Include choice of two BVH parser libraries
Script.include("./libraries/jaanga-bvh-parser-hifi-version.js");
Script.include("./libraries/murayama-bvh-parser-hifi-version.js");

// Borrow a couple of classes from Three.js
// Used for Euler rotations to Pitch / Yaw / Roll angles conversion
THREE = {};
Script.include("./libraries/three.js/math/Quaternion.js");
Script.include("./libraries/three.js/math/Euler.js");
Script.include("./libraries/three.js/math/Vector3.js");


// ECMAScript 6 specification ready string.contains() function
if (!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

// bvh player object
WalkToolsBVHPlayer = function() {
    var that = {};

    var _visible = false;
    var _isLive = false;
    var _bvhFrameNumber = 0;
    var _bvhStartTime = 0;
    var _frameTimeModifier = 1;
    var _lastURL = "";

    // web window
	var _innerWidth = Window.innerWidth;
	var _innerHeight = Window.innerHeight;
	const PLAYER_WIDTH = 665;
	const PLAYER_HEIGHT = 316;
	const MARGIN_TOP = 107;
    var _url = Script.resolvePath('../html/walkToolsBVHPlayer.html');
    var _webView = new WebWindow('walkTools BVH Player', _url, PLAYER_WIDTH, PLAYER_HEIGHT, false);
	_webView.setPosition((_innerWidth / 4) - (PLAYER_WIDTH / 2), MARGIN_TOP);
    _webView.setVisible(_visible);

    // conversion 
    var _bvhParser = "jaanga"; //// or "murayama"; 
	var _subtractPreRotations = false; 
    // translation scale is ratio of hips to feet (metres, in Interface) and hips to feet (units, source animation)
    var _translationScale = 1.0 / 93.80; // i.e. hips to feet in Interface / Hips translation in MB
    var _rawBVHData = null;

    function loadBVHFile(fileURL) {

        print('Downloading bvh file: '+fileURL);
        var _XMLHttpRequest = new XMLHttpRequest();
        _XMLHttpRequest.open("GET", fileURL, false);
        _XMLHttpRequest.send();

        if (_XMLHttpRequest.status == 200) {
			var responseText = _XMLHttpRequest.responseText;

			if (_bvhParser === "murayama") {
				var lines = responseText.replace("\r", '').split("\n");
				bvhFile = new BVH((new Parser(lines)).parse());
				print('bvh file parsed using Murayama\'s parser.');
			} else if (_bvhParser === "jaanga") {
                _rawBVHData = responseText;
				Bvh.parseData(responseText, _translationScale);
				print('bvh file parsed using Jaanga\'s parser.');
			}

			_isLive = true;
			_bvhStartTime = new Date().getTime();

			_webView.eventBridge.emitScriptEvent(JSON.stringify({
				type: "bvhPlayerEvent",
				action: "bvhFileLoaded"
			}));

			// turn off walk.js animation and walkTools
			if (_isLive) {
				motion.isLive = false;
				walkTools.enableWalkTools(false);
			}
        } else {
            print("Error loading bvh file. Status: " + _XMLHttpRequest.status +
                  " Status Text: " + _XMLHttpRequest.statusText +
                  " Error Code: " + _XMLHttpRequest.errorCode);
        }
    }
    
    // convert Euler rotations to angles using Three.js objects
    function eulerRotationsToAngles(rotations, rotationOrder) {
        var euler = new THREE.Euler(
            filter.degToRad(rotations.x),
            filter.degToRad(rotations.y),
            filter.degToRad(rotations.z), 
            rotationOrder);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);
        var quat = {
            x: quaternion.x,
            y: quaternion.y,
            z: quaternion.z,
            w: quaternion.w
        };
        return Quat.safeEulerAngles(quat); 		
    }    

    function bvhToXYZ(node, iKChain, rotationOrder, frameNumber) {
		var rotation = {x:0, y:0, z:0};
			
		switch (rotationOrder) {
			
			case 'XYZ':
				if (node.id === "Hips") {
                    rotation = Vec3.sum(rotation, {
						x: node.frames[frameNumber][3], 
						y: node.frames[frameNumber][4],
						z: node.frames[frameNumber][5]
					});	
                } else {
                    rotation = Vec3.sum(rotation, {
						x: node.frames[frameNumber][0], 
						y: node.frames[frameNumber][1],
						z: node.frames[frameNumber][2]
					});	
				}    
				break;	

            case 'ZXY':
			case 'NONE':
			default:
				if (node.id === "Hips") {
                    rotation = Vec3.sum(rotation, {
						x: node.frames[frameNumber][4], 
						y: node.frames[frameNumber][5],
						z: node.frames[frameNumber][3]
					});	
                } else {
                    rotation = Vec3.sum(rotation, {
						x: node.frames[frameNumber][1], 
						y: node.frames[frameNumber][2],
						z: node.frames[frameNumber][0]
					});	
				}
				break;
		}
        
        //rotation = eulerRotationsToAngles(rotation, rotationOrder);
				
		if (_subtractPreRotations) {

			// prevent legs from flip flopping around +- 180, as confuses DFT
			if (node.id === "RightUpLeg" && rotation.z < 0) {
				rotation.z += 360;
			} else if (node.id === "LeftUpLeg" && rotation.z > 0) {
				rotation.z -= 360;
			}
			
			var preRotation = walkAssets.preRotations.joints[node.id];
			//preRotation = eulerRotationsToAngles(preRotation, "ZYX"); // nope!
			rotation = Vec3.subtract(rotation, preRotation);
		}
        
        rotation = eulerRotationsToAngles(rotation, rotationOrder);

		if (node.id === walkTools.currentlySelectedJoint()) {
			walkToolsOscilloscope.updateScopeData(
				{
					title: 'BVH joint data',
					joint: node.id,
					iKChain: iKChain,
					ch1: rotation.x, 
					ch2: rotation.y, 
					ch3: rotation.z,
					metaDataLabel: 'Frame number',
					metaData: _bvhFrameNumber
				}
			);
		}	
		return rotation;				
    }

    // events from webWindow arrive here
    _webView.eventBridge.webEventReceived.connect(function(data) {
        data = JSON.parse(data);

        if (data.type === "bvhPlayerEvent") {
            switch (data.action) {
                case "openBVHFile":
                    if (data.url === _lastURL) {
                        motion.isLive = false;
                        if (walkTools) {
                            walkTools.enableWalkTools(false);
                        }
                        _isLive = true;
                        _webView.eventBridge.emitScriptEvent(JSON.stringify({
                            type: "bvhPlayerEvent",
                            action: "bvhFileLoaded"
                        }));
                    } else {
                        loadBVHFile(data.url);
                        _lastURL = data.url;
                    }
                    return;

                case "playBVHFaster":
                    _frameTimeModifier += 0.1;
                    if (_frameTimeModifier > 10) {
                        _frameTimeModifier = 10;
                    }
                    return;

                case "playBVHSlower":
                    _frameTimeModifier -= 0.1;
                    if (_frameTimeModifier < 0.1) {
                        _frameTimeModifier = 0.1;
                    }
                    return;

                case "stop":
                    _isLive = false;
                    motion.isLive = true;
                    if (walkTools) {
                        walkTools.enableWalkTools(true);
                    }
                    return;

                case "changeParser":
                    _isLive = false;
					_bvhParser = data.parser;
					loadBVHFile(data.url);
					_lastURL = data.url;
                    return;
					
				case "export":
                    /*Window.alert('Unable to export BVH file. The exporter is not installed.'); */             
					if (_rawBVHData) {
                        Script.include("./walkTools/walkToolsBVHConverter.js");
						walkToolsBVHConverter.exportJaanga(_rawBVHData, _translationScale);
					} else {
						alert('Unable to export BVH file. Please load a BVH file using the Jaanga parser to continue.');
					}
					return;
					
				case "preRotationIgnore":
					_subtractPreRotations = false;
					return;
					
				case "preRotationSubtract":
					_subtractPreRotations = true;
					return;			
            }
        }
    });

    const MILLISECONDS = 1000;
    Script.update.connect(function(deltaTime) {

        // preview raw bvh data
        if (_isLive) {

            if (_bvhParser === "jaanga") {
                try {
                    _bvhFrameNumber = ( _frameTimeModifier * (Date.now() - Bvh.startTime ) / Bvh.secsPerFrame / 1000) | 0;
                    var preRotations = false;
                    
                    if (_subtractPreRotations) {
                        preRotations = walkAssets.preRotations;
                    }				
                    Bvh.animate(_bvhFrameNumber, preRotations);
                } catch(e) {
                    print('Error is Jaanga BVH playback: '+e.toString());
                }
                
			}  else if (_bvhParser === "murayama") {
				try {
					var timeNow = new Date().getTime();
					var timeSoFar = timeNow - _bvhStartTime;
					// frame 0 is not available?
					_bvhFrameNumber = 1 + Math.round(_frameTimeModifier * timeSoFar / bvhFile.frameTime / MILLISECONDS);

					if (_bvhFrameNumber >= bvhFile.numFrames) {
						_bvhStartTime = timeNow;
						_bvhFrameNumber = 1;
					}

					var node = bvhFile.of('Hips');
					node.at(_bvhFrameNumber);

					// do translation
					var hipsTranslations = {x: _translationScale * node.positionX, y: _translationScale * node.positionY, z: _translationScale * node.positionZ};
					// ensure skeleton offsets are within the 1m limit
					hipsTranslations.x = hipsTranslations.x > 1 ? 1 : hipsTranslations.x;
					hipsTranslations.x = hipsTranslations.x < -1 ? -1 : hipsTranslations.x;
					hipsTranslations.y = hipsTranslations.y > 1 ? 1 : hipsTranslations.y;
					hipsTranslations.y = hipsTranslations.y < -1 ? -1 : hipsTranslations.y;
					hipsTranslations.z = hipsTranslations.z > 1 ? 1 : hipsTranslations.z;
					hipsTranslations.z = hipsTranslations.z < -1 ? -1 : hipsTranslations.z;
					MyAvatar.setSkeletonOffset(hipsTranslations);

					for (joint in walkAssets.animationReference.joints) {
						var node = bvhFile.of(joint);
						var iKChain = walkAssets.animationReference.joints[joint].IKChain;

						if (node) {
							node.at(_bvhFrameNumber);
							var rotation = bvhToXYZ(node, iKChain, "ZXY", _bvhFrameNumber);

							if (avatar.isMissingPreRotations) {
								rotation = Vec3.sum(rotation, walkAssets.preRotations.joints[joint]);
							}
							MyAvatar.setJointRotation(joint, Quat.fromPitchYawRollDegrees(rotation.x, rotation.y, rotation.z));
						}
					}
				} catch(e) {
					print('WalkToolsBVHPlayer error at frame number '+_bvhFrameNumber+': '+e.toString());
				}
			}
        }
    });

    that.setVisible = function(visible) {
        _visible = visible;
        _webView.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
        }
    };

    return that;
};

walkToolsBVHPlayer = WalkToolsBVHPlayer();