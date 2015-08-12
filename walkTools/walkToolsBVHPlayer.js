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

// Not sure why this doesn't work - simply pasting the BVH parser lib for now (July 2015)
//Script.include("./libraries/bvh/parser.js");
//Script.include("./libraries/bvh/bvh.js");


// ECMAScript 6 specification ready string.contains() function
if (!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

// Ryo Murayama's bvh parser code pasted from https://github.com/hitsujiwool/bvh
// シンタックスハイライトが崩れるので修正
// Copyright (c) 2012 hitsujiwool
//
// Adapted to remove 'mixamorig_' from joint names
//  - David Wooldridge July 2015
function BVH(parser) {
  function iter(node, res) {
    if (res[node.id]) throw new Error('Error: Node ' + node.id + ' already exists');
    res[node.id] = node;
    for (var i = 0, len = node.children.length; i < len; i++) {
      iter(node.children[i], res);
    }
    return res;
  }
  this.root = parser.currentNode;
  this.numFrames = parser.numFrames;
  this.frameTime = parser.frameTime;
  this.nodeList = this.root.flatten();
  this._nodeIndex = iter(this.root, {});
}

BVH.prototype.at = function(nthFrame) {
  nthFrame = nthFrame | 0;
  for (var prop in this._nodeIndex) {
    this._nodeIndex[prop].at(nthFrame);
  }
  return this;
};

BVH.prototype.of = function(id) {
  return this._nodeIndex[id];
};

function Parser(lines) {
  this._lines = lines;
  this._lineNumber = -1;
  this.currentNode = null;
  this.next();
};

Parser.prototype.parse = function() {
  this
    .expect('HIERARCHY')
    .root()
    .motion();
  if (this.get()) throw new Error('Parse error: Invalid token ' + this.get() + '.');
  return this;
};

Parser.prototype.root = function() {
  var that = this,
      node;
  this
    .expect('ROOT', function(line) {
        var nodeName = line.split(/\s+/)[1];
        if (nodeName.contains('mixamorig_')) {
            nodeName = nodeName.substring(10);
        }
        node = new BVHNode(nodeName);
        that.currentNode = node;
    })
    .expect('{')
    .offset()
    .channels();
  while (this.accept('JOINT')) {
    this.joint();
    this.currentNode = node;
  }
  if (this.accept('End')) this.end();
  this.expect('}');
  return this;
};

Parser.prototype.joint = function() {
  var that = this,
      node;
  this
    .expect('JOINT', function(line) {
        var nodeName = line.split(/\s+/)[1];
        if (nodeName.contains('mixamorig_')) {
            nodeName = nodeName.substring(10);
        }
        node = new BVHNode(nodeName);
        node.parent = that.currentNode;
        that.currentNode.children.push(node);
        that.currentNode = node;
    })
    .expect('{')
    .offset()
    .channels();
  while (this.accept('JOINT')) {
    this.joint();
    this.currentNode = node;
  }
  if (this.accept('End')) this.end();
  this.expect('}');
  return this;
};

Parser.prototype.end = function() {
  if (this.get(0) !== 'End Site') throw new Error('Parse error: End Site expected, but ' + this.get() + '.');
  this
    .next()
    .expect('{')
    .endOffset()
    .expect('}');
  return this;
};

Parser.prototype.offset = function() {
  var offsets = this.get().split(/\s+/).slice(1);
  if (offsets.length !== 3) throw new Error('Parse error: Invalid offset number.');
  this.currentNode.offsetX = +offsets[0];
  this.currentNode.offsetY = +offsets[1];
  this.currentNode.offsetZ = +offsets[2];
  return this.next();
};

Parser.prototype.endOffset = function() {
  var offsets = this.get().split(/\s+/).slice(1);
  if (offsets.length !== 3) throw new Error('Parse error: Invalid offset number.');
  this.currentNode.hasEnd = true;
  this.currentNode.endOffsetX = +offsets[0];
  this.currentNode.endOffsetY = +offsets[1];
  this.currentNode.endOffsetZ = +offsets[2];
  return this.next();
};

Parser.prototype.channels = function() {
  var pieces = this.get(0).split(/\s+/),
      n = parseInt(pieces[1], 10),
      channels = pieces.slice(2);
  if (n !== channels.length) throw new Error('Parse error: ' + n + ' expected for number of channels, but ' + channels.length + '.');
  this.currentNode.channels = channels;
  return this.next();
};

Parser.prototype.motion = function() {
  this._nodeList = this.currentNode.flatten();
  this
    .expect('MOTION')
    .frames()
    .frameTime();
  for (var i = 0, len = this.numFrames; i < len; i++) {
    this.frameValues();
  }
  return this;
};

Parser.prototype.frames = function() {
  var match = /^Frames:\s+(\d+)\s*$/.exec(this.get());
  if (match !== null) {
    this.numFrames = +match[1];
  } else {
    throw new Error('Parse error: Cannot find valid number of frames');
  }
  return this.next();
};

Parser.prototype.frameTime = function() {
  var match = /^Frame Time:\s+([0-9.]+)$/.exec(this.get());
  if (match !== null) {
    this.frameTime = +match[1];
  } else {
    throw new Error('Parse error: Cannot find valid frametime');
  }
  return this.next();
};

Parser.prototype.frameValues = function() {
  var values = this.get().split(/\s+/),
      that = this;
  this._nodeList.forEach(function(node) {
    if (values.length < node.channels.length) throw new Error('Parse error: Too short motion values per frame');
    node.frames.push(values.splice(0, node.channels.length).map(function(str) { return +str; }));
  });
  if (values.length > 0) throw new Error('Parse error: Too much motion values per frame');
  return this.next();
};

Parser.prototype.expect = function(state, callback) {
  if (this.accept(state)) {
    if (callback) callback(this.get());
    return this.next();
  } else {
    throw new Error('Parse error: Unexpected token ' + this.get() + ' for ' + state);
  }
};

Parser.prototype.accept = function(state) {
  var line = this.get();
  if (line === undefined) return false;
  return line.split(/\s+/)[0] == state;
};

Parser.prototype.next = function() {
  do {
    this._lineNumber++;
  } while (this.get() === '')
  return this;
};

Parser.prototype.get = function() {
  if (typeof this._lines[this._lineNumber] === 'undefined') {
    return undefined;
  } else {
    return this._lines[this._lineNumber].replace(/(^\s+)|(\s+$)/g, "");
  }
};

function BVHNode(nodeName) {
  this.id = nodeName;
  this.children = [];
  this.parent = null;
  this.frames = [];
  this.channels = null;
  this.hasEnd = false;
}

BVHNode.prototype.at = function(nthFrame) {
  var that = this;
  nthFrame = nthFrame | 0;
  this.currentFrame = nthFrame;
  var frame = this.frames[nthFrame - 1];
  this.channels.forEach(function(channel, i) {
    var prop = channel.slice(1) + channel.slice(0, 1).toUpperCase();
    that[prop] = frame[i];
  });
  return this;
};

BVHNode.prototype.flatten = function() {
  function iter(node) {
    var tmp = [node];
    for (var i = 0, len = node.children.length; i < len; i++) {
      tmp = tmp.concat(iter(node.children[i]));
    }
    return tmp;
  };
  return iter(this);
};

BVHNode.prototype.toString = function() {
  function iter(node, indent) {
    var tmp = [indent + '- ' + node.id];
    for (var i = 0, len = node.children.length; i < len; i++) {
      tmp = tmp.concat(iter(node.children[i], indent + '   '));
    }
    return tmp;
  };
  return iter(this, '').join("\n");
};



// BVH loader adapted from http://jaanga.github.io/cookbook/bvh-reader/readme-reader.html by Jaanga
// This second bvh loader was added to verify that the twisted feet issues were nothing to do with the bvh conversion process
// Adapted for HiFi JS: David wooldridge, August 2015
var Bvh = {};
Bvh.numJoints = 0;
Bvh.nodes = [];

Bvh.parseData = function (data, translationScale) {
    var _this = Bvh;
    _this.data = data.split(/\s+/g);
    _this.channels = [];
	_this.translationScale = translationScale;
    done = false;

    while (!done) {
        var nextBit = _this.data.shift();

        switch (nextBit) {

			case 'ROOT':
				_this.root = _this.parseNode(_this.data);
				break;
			case 'MOTION':
				_this.data.shift();
				_this.numFrames = parseInt( _this.data.shift() );
				_this.data.shift();
				_this.data.shift();
				_this.secsPerFrame = parseFloat(_this.data.shift());
				done = true;
        }
    }
    _this.startTime = Date.now();
};

Bvh.animate = function(frame) {

	// use the standard walk.js animation buffer to store keyframe values as offset parameters for each frame
    var buffer = new Buffer('bvhData');
    var subtractPreRotations = false;
	var threshold = 180; // because of large pre-rotations...
    var ch, frame, n;
    n = frame % this.numFrames * this.channels.length;

    for (var i = 0, len = this.channels.length; i < len; i++) {

		ch = this.channels[i];

        switch (ch.prop) {
            case 'Xrotation':
                buffer.joints[ch.node.name].pitchOffset = this.data[n];
                break;
            case 'Yrotation':
                buffer.joints[ch.node.name].yawOffset = this.data[n];
				break;
            case 'Zrotation':
                buffer.joints[ch.node.name].rollOffset = this.data[n];
                break;
            case 'Xposition':
                buffer.joints[ch.node.name].swayOffset = this.data[n];
                break;
            case 'Yposition':
                buffer.joints[ch.node.name].bobOffset = this.data[n];
                break;
            case 'Zposition':
                buffer.joints[ch.node.name].thrustOffset = this.data[n];
				break;
			default:
				print('Warning: missing or unrecognised channel property in walkTools bvh player: '+ch.prop);
				break;
        }
		n++;
    }

    // the buffer's offsets have been filled for this frame, time to render
    var threshold = 180; // because of large pre-rotations...

	for (joint in buffer.joints) {
		var rotation = {x: 0, y: 0, z: 0};
		var iKChain = walkAssets.animationReference.joints[joint].IKChain;
		var yawSign = 1;
		var rollSign = 1;

		//if (iKChain === "RightLeg") {
		//	yawSign = -1;
		//}

		// deal with Hips translation first
		if (joint === "Hips") {
            var hipsTranslations = {
                x: this.translationScale * buffer.joints["Hips"].swayOffset,
                y: this.translationScale * buffer.joints["Hips"].bobOffset,
                z: this.translationScale * buffer.joints["Hips"].thrustOffset
            };
            // ensure skeleton offsets are within the 1m limit
            hipsTranslations.x = hipsTranslations.x > 1 ? 1 : hipsTranslations.x;
            hipsTranslations.x = hipsTranslations.x < -1 ? -1 : hipsTranslations.x;
            hipsTranslations.y = hipsTranslations.y > 1 ? 1 : hipsTranslations.y;
            hipsTranslations.y = hipsTranslations.y < -1 ? -1 : hipsTranslations.y;
            hipsTranslations.z = hipsTranslations.z > 1 ? 1 : hipsTranslations.z;
            hipsTranslations.z = hipsTranslations.z < -1 ? -1 : hipsTranslations.z;
            MyAvatar.setSkeletonOffset(hipsTranslations);
        }

		// calculate rotations
		rotation = Vec3.sum(rotation, {x: 0, y: 0, z: buffer.joints[joint].rollOffset});
		rotation = Vec3.sum(rotation, {x: buffer.joints[joint].pitchOffset, y: 0, z: 0});
		rotation = Vec3.sum(rotation, {x: 0, y: yawSign * buffer.joints[joint].yawOffset, z: 0});
		if (subtractPreRotations) {
			rotation = Vec3.subtract(rotation, {x: 0, y: 0, z: walkAssets.mixamoPreRotations.joints[joint].z});
			rotation = Vec3.subtract(rotation, {x: walkAssets.mixamoPreRotations.joints[joint].x, y: 0, z: 0});
			rotation = Vec3.subtract(rotation, {x: 0, y: walkAssets.mixamoPreRotations.joints[joint].y, z: 0});
		}

		// remove flips between +- 180 (caused by large pre-rotations on upper legs)
		if (iKChain === "LeftLeg") {
			if (rotation.z > threshold) {
				rotation.z -= 360;
			}
        } else if (iKChain === "RightLeg") {
			if (rotation.z < -threshold) {
				rotation.z += 360;
			}
		}
		if (joint === "RightFoot") {
            //rotation.y = -rotation.y;
			//rotation.z = -rotation.z;
		} else  if (joint === "RightToeBase" || joint === "LeftToeBase" ) {
			//rotation.y = 0;//-rotation.y;
			//rotation.z = 0;//-rotation.z;
		}

        if (joint === walkTools.currentlySelectedJoint()) {
            walkToolsOscilloscope.updateScopeTrace(rotation.x, rotation.y, rotation.z);
        }
        MyAvatar.setJointData(joint, Quat.fromVec3Degrees(rotation));
    }
};

Bvh.parseNode = function(data) {
    var geometry, material, n, t, done;
    var nextBit = data.shift();
    var node = {};
    node.name = nextBit;
    node.rotationOrder = 'ZXY';
    node.childNodes = [];
    done = false;

    while ( !done ) {
        nextBit = data.shift();
        switch (nextBit) {
            case 'OFFSET':
                node.position = { x: parseFloat(data.shift()), y: parseFloat(data.shift()), z: parseFloat(data.shift()) };
                node.offset = node.position;
                break;
            case 'CHANNELS':
                n = parseInt(data.shift());
                for ( var i = 0;  0 <= n ? i < n : i > n;  0 <= n ? i++ : i-- ) {
                    this.channels.push({
                        node: node,
                        prop: data.shift()
                    });
                }
                break;
            case 'JOINT':
                node.childNodes.push(this.parseNode(data));
                break;
            case 'End':
                node.childNodes.push(this.parseNode(data));
                break;
            case '}':
                done = true;
                break;
        }
    }
    return node;
};


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
	const PLAYER_WIDTH = 618;
	const PLAYER_HEIGHT = 180;
	const MARGIN_TOP = 107;
    var _url = Script.resolvePath('html/walkToolsBVHPlayer.html');
    var _webView = new WebWindow('walkTools BVH Player', _url, PLAYER_WIDTH, PLAYER_HEIGHT, false);
	_webView.setPosition((_innerWidth / 2) - (PLAYER_WIDTH / 2), MARGIN_TOP);
    _webView.setVisible(_visible);

    // conversion properties
    var fileName = "Female_Walk_Looped.bvh"; //"Sintel-T-Stance-Test.bvh"; //"Sintel-2.2-character-female-walk.bvh"; //"Sintel-90-Deg-Test.bvh"; //"Sintel-Fly-Back-Test.bvh"; //"Sintel-Star-Open-Test.bvh"; //"Sintel-Knee-Yaw-Test.bvh"; //"Sintel-Foot-Roll-Test.bvh"; //"Sintel-Knee-Roll-Test.bvh"; //"Sintel-IK-Primary-Roll-Test-.bvh"; //"Sintel-Star-Jump-Test-.bvh"; //"Bangkok-Arm_dancehall01_looped.bvh"; //"Bangkok-Arm.bvh"; //"AnimationsFromOzanJuly2015_idle.bvh"; //"AnimationsFromOzanJuly2015_walk_forwards.bvh"; //"AnimationsFromOzanJuly2015_walk_backwards.bvh"; //"AnimationsFromOzanJuly2015_run.bvh"; //
	var _bvhParser = "murayama"; // or "jaanga""
    // translation scale is ratio of hips to feet (metres, in Interface) and hips to feet (units, source animation)
    var translationScale = 1.011 / 101.1; // i.e. hips to feet in Interface / Hips translation in MB (for Sintel)

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
			} else if (_bvhParser === "jaanga"){
				Bvh.parseData(responseText, translationScale);
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

    function bvhToXYZ(node, iKChain, frameNumber) {
        var rotationOrder = 'none';
		var rotation = {x:0, y:0, z:0};		
		var threshold = 180; // because of large pre-rotations...
		var subtractPreRotations = false;
		
		var yawModifer = 1; // zero often gives the best results :-(
		
		switch (rotationOrder) {
			
			case 'zxy':
                if (node.id === "Hips") {
                    rotation = Vec3.sum(rotation, {x:0, y:0, z: node.frames[frameNumber][3]});
                    rotation = Vec3.sum(rotation, {x: node.frames[frameNumber][4], y:0, z:0});
                    rotation = Vec3.sum(rotation, {x:0, y: yawModifer * node.frames[frameNumber][5], z:0});
                } else {
                    rotation = Vec3.sum(rotation, {x:0, y:0, z: node.frames[frameNumber][0]});
                    rotation = Vec3.sum(rotation, {x: node.frames[frameNumber][1], y:0, z:0});
                    rotation = Vec3.sum(rotation, {x:0, y: yawModifer * node.frames[frameNumber][2], z:0});
                }
				break;
			
			case 'xyz':
				if (node.id === "Hips") {
                    rotation = Vec3.sum(rotation, {x: node.frames[frameNumber][4], y:0, z:0});
					rotation = Vec3.sum(rotation, {x:0, y: node.frames[frameNumber][5], z:0});
					rotation = Vec3.sum(rotation, {x:0, y:0, z: node.frames[frameNumber][3]});
                } else {
                    rotation = Vec3.sum(rotation, {x: node.frames[frameNumber][1], y:0, z:0});
					rotation = Vec3.sum(rotation, {x:0, y: node.frames[frameNumber][2], z:0});
					rotation = Vec3.sum(rotation, {x:0, y:0, z: node.frames[frameNumber][0]});
				}
				break;	
			
			case 'yxz':
				if (node.id === "Hips") {
                    rotation = Vec3.sum(rotation, {x:0, y: node.frames[frameNumber][5], z:0});
					rotation = Vec3.sum(rotation, {x: node.frames[frameNumber][4], y:0, z:0});
					rotation = Vec3.sum(rotation, {x:0, y:0, z: node.frames[frameNumber][3]});
                } else {
                    rotation = Vec3.sum(rotation, {x:0, y: node.frames[frameNumber][2], z:0});
					rotation = Vec3.sum(rotation, {x: node.frames[frameNumber][1], y:0, z:0});
					rotation = Vec3.sum(rotation, {x:0, y:0, z: node.frames[frameNumber][0]});
				}
				break;
				
			case 'none':
				if (node.id === "Hips") {
                    rotation = {
						x: node.frames[frameNumber][4], 
						y: yawModifer * node.frames[frameNumber][5],
						z: node.frames[frameNumber][3]
					};	
                } else {
                    rotation = {
						x: node.frames[frameNumber][1], 
						y: yawModifer * node.frames[frameNumber][2],
						z: node.frames[frameNumber][0]
					};	
				}
				break;
		}
		if (node.id === 'LeftLeg') print ('Frame: '+frameNumber+': '+rotation.x.toFixed(2)+' '+rotation.y.toFixed(2)+' '+rotation.z.toFixed(2));
		return rotation;				
		/*


		switch (iKChain) {

            case "LeftArm":

                var xSign = 1;
                var ySign = 1;
                var zSign = 1;
                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0});
				if (subtractPreRotations) {
					rotation = Vec3.subtract(rotation, {x:0, y:walkAssets.mixamoPreRotations.joints[node.id].y, z:0});
					rotation = Vec3.subtract(rotation, {x:walkAssets.mixamoPreRotations.joints[node.id].x, y:0, z:0});
					rotation = Vec3.subtract(rotation, {x:0, y:0, z:walkAssets.mixamoPreRotations.joints[node.id].z});
				}
                if (rotation.z > threshold) {
					//rotation.z -= 360;
				}
				return rotation;

            case "RightArm":
                var xSign = 1;
                var ySign = 1;
               var zSign = 1;
                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0});
                if (subtractPreRotations) {
					rotation = Vec3.subtract(rotation, {x:0, y:walkAssets.mixamoPreRotations.joints[node.id].y, z:0});
					rotation = Vec3.subtract(rotation, {x:walkAssets.mixamoPreRotations.joints[node.id].x, y:0, z:0});
					rotation = Vec3.subtract(rotation, {x:0, y:0, z:walkAssets.mixamoPreRotations.joints[node.id].z});
				}
				if (rotation.z < -threshold) {
					//rotation.z += 360;
				}
				return rotation;

            case "LeftLeg":
                var xSign = 1;
                var ySign = 1;
                var zSign = 1;

                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0});
                if (subtractPreRotations) {
					rotation = Vec3.subtract(rotation, {x:0, y:walkAssets.mixamoPreRotations.joints[node.id].y, z:0});
					rotation = Vec3.subtract(rotation, {x:walkAssets.mixamoPreRotations.joints[node.id].x, y:0, z:0});
					rotation = Vec3.subtract(rotation, {x:0, y:0, z:walkAssets.mixamoPreRotations.joints[node.id].z});
				}

				if (rotation.z > threshold) {
					rotation.z -= 360;
				}

				if (node.id === "LeftUpLeg") {
					//rotation.y = 0;//-rotation.y;
					//rotation.z = 0;//-rotation.z;
				} else if (node.id === "LeftLeg") {
					//rotation.y = -rotation.y;
					//rotation.z = -rotation.z;
					//print ('Frame: '+frameNumber+' aaadjusted '+node.id+' rot is: x:'+rotation.x.toFixed(2)+' y:'+rotation.y.toFixed(2)+' z:'+rotation.z.toFixed(2));
				} else if (node.id === "LeftFoot") {
					//rotation.y = 0;//-rotation.y;
					//rotation.z = 0;//-rotation.z;
				} else  if (node.id === "LeftToeBase") {
					//rotation.y = 0;//-rotation.y;
					//rotation.z = 0;//-rotation.z;
				}
				//print ('adjusted left leg rot is: x:'+rotation.x.toFixed(1)+' y:'+rotation.y.toFixed(1)+' z:'+rotation.z.toFixed(1));
                return rotation;

            case "RightLeg":
                var xSign = 1;
                var ySign = 1;
                var zSign = 1;

                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0});
                if (subtractPreRotations) {
					rotation = Vec3.subtract(rotation, {x:0, y:walkAssets.mixamoPreRotations.joints[node.id].y, z:0});
					rotation = Vec3.subtract(rotation, {x:walkAssets.mixamoPreRotations.joints[node.id].x, y:0, z:0});
					rotation = Vec3.subtract(rotation, {x:0, y:0, z:walkAssets.mixamoPreRotations.joints[node.id].z});
				}

				if (rotation.z < -threshold) {
					rotation.z += 360;
				}

				if (node.id === "RightUpLeg") {
					//rotation.y = 0;//-rotation.y;
					//rotation.z = 0;//-rotation.z;
				} else if (node.id === "RightLeg") {
					//rotation.y = -rotation.y;
					//rotation.z = -rotation.z;
				} else if (node.id === "RightFoot") {
					//rotation.y = 0;//-rotation.y;
					//rotation.z = 0;//-rotation.z;
				} else  if (node.id === "RightToeBase") {
					//rotation.y = 0;//-rotation.y;
					//rotation.z = 0;//-rotation.z;
				}
                return rotation;

            case "Torso":
            case "Head":
            default:
                var xSign = 1;
                var ySign = 1;
                var zSign = 1;

                if (node.id === "Hips") {
                    rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][3]});
                    rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][4], y:0, z:0});
                    rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][5], z:0});
                } else {
                    rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                    rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                    rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0});
                }
                if (subtractPreRotations) {
					rotation = Vec3.subtract(rotation, walkAssets.mixamoPreRotations.joints[node.id]);
				}
                if (rotation.z > threshold) {
					rotation.z -= 360;
				}
				return rotation;
        }*/ 
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
            }
        }
    });

    const MILLISECONDS = 1000;
    Script.update.connect(function(deltaTime) {

        // preview raw bvh data
        if (_isLive) {

			if (_bvhParser === "murayama") {
				try {
					var timeNow = new Date().getTime();
					var timeSoFar = timeNow - _bvhStartTime;
					// seems to be a bug in parser - first frame is not available.
					_bvhFrameNumber = 1 + Math.floor(_frameTimeModifier * timeSoFar / bvhFile.frameTime / MILLISECONDS);

					if (_bvhFrameNumber >= bvhFile.numFrames) {
						_bvhStartTime = timeNow;
						_bvhFrameNumber = 1;
					}

					var node = bvhFile.of('Hips');
					node.at(_bvhFrameNumber);

					// do translation
					var hipsTranslations = {x: translationScale * node.positionX, y: translationScale * node.positionY, z: translationScale * node.positionZ};
					// ensure skeleton offsets are within the 1m limit
					hipsTranslations.x = hipsTranslations.x > 1 ? 1 : hipsTranslations.x;
					hipsTranslations.x = hipsTranslations.x < -1 ? -1 : hipsTranslations.x;
					hipsTranslations.y = hipsTranslations.y > 1 ? 1 : hipsTranslations.y;
					hipsTranslations.y = hipsTranslations.y < -1 ? -1 : hipsTranslations.y;
					hipsTranslations.z = hipsTranslations.z > 1 ? 1 : hipsTranslations.z;
					hipsTranslations.z = hipsTranslations.z < -1 ? -1 : hipsTranslations.z;
					MyAvatar.setSkeletonOffset(hipsTranslations);
					//MyAvatar.setSkeletonOffset({x:0, y:0.25, z:0});

					for (joint in walkAssets.animationReference.joints) {
						var node = bvhFile.of(joint);
						var iKChain = walkAssets.animationReference.joints[joint].IKChain;

						if (node) {
							node.at(_bvhFrameNumber);
							var rotation = bvhToXYZ(node, iKChain, _bvhFrameNumber);

							if (avatar.mixamoPreRotations) {
								rotation = Vec3.sum(rotation, walkAssets.mixamoPreRotations.joints[joint]);
							}

							if (node.id === walkTools.currentlySelectedJoint()) {
								walkToolsOscilloscope.updateScopeTrace(rotation.x, rotation.y, rotation.z);
								//print(node.id+' at frame '+_bvhFrameNumber+' channels: '+node.frames[_bvhFrameNumber]);
							}
							MyAvatar.setJointData(joint, Quat.fromVec3Degrees(rotation));
						} else {
							print('Warning: bvh player could not find '+joint+' in bvh file');
							//continue;
						}
					}
				} catch(e) {
					print('WalkToolsBVHPlayer error at frame number '+_bvhFrameNumber+': '+e.toString());
				}
			} else if (_bvhParser === "jaanga") {
				_bvhFrameNumber = ( _frameTimeModifier * (Date.now() - Bvh.startTime ) / Bvh.secsPerFrame / 1000) | 0;
				Bvh.animate(_bvhFrameNumber);
			} else {
				alert('Error: No BHV parser selected');
			}
        }
    });

    that.setVisible = function(visible) {
        _visible = visible;
        _webView.setVisible(_visible);
        if (_visible) {
            Window.setFocus();
            _webView.raise();
        }
    };
  /*
    that.bvhToXYZ = function(node, iKChain) {
        return bvhToXYZ(node, iKChain);
    };*/

    return that;
};

walkToolsBVHPlayer = WalkToolsBVHPlayer();