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

// bvh parser code pasted from https://github.com/hitsujiwool/bvh
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


WalkToolsBVHPlayer = function() {
    var that = {};

    var _visible = false;
    var _isLive = false;
    var _bvhFrameNumber = 0;
    var _bvhStartTime = 0;
    var _frameTimeModifier = 1;
    var _lastURL = "";

    // web window
    var _url = Script.resolvePath('html/walkToolsBVHPlayer.html');
    var _webView = new WebWindow('walkTools BVH Loader', _url, 618, 110, false);
    _webView.setVisible(_visible);

    function loadBVHFile(fileURL) {
        
        print('Downloading bvh file: '+fileURL);
        var _XMLHttpRequest = new XMLHttpRequest();
        _XMLHttpRequest.open("GET", fileURL, false);
        _XMLHttpRequest.send();

        if (_XMLHttpRequest.status == 200) {
            var responseText = _XMLHttpRequest.responseText;
            var lines = responseText.replace("\r", '').split("\n");
            bvhFile = new BVH((new Parser(lines)).parse());
            _bvhStartTime = new Date().getTime();
            _webView.eventBridge.emitScriptEvent(JSON.stringify({
                type: "bvhPlayerEvent",
                action: "bvhFileLoaded"
            }));
            print('BVH file loaded '+bvhFile.numFrames+' frames.');
            
            // dump the motion data to confirm BVH parser fidelity
            /*for (frame = 1 ; frame < bvhFile.numFrames ; frame++) {
                var motionDataLine = '';
                var node = bvhFile.of('Hips');
                node.at(frame);
                // first three values are the Hips offset
                motionDataLine += node.positionX.toString()+' '+node.positionY.toString()+' '+node.positionZ.toString()+' ';
                for (joint in walkAssets.animationReference.joints) {
                    node = bvhFile.of(joint);
                    node.at(frame);
                    motionDataLine += node.rotationZ.toString()+' '+node.rotationX.toString()+' '+node.rotationY.toString()+' ';
                }
                print(motionDataLine);
            }*/

            // turn off walk.js animation and walkTools before setting live
            motion.isLive = false;
            if (walkTools) {
                walkTools.enableWalkTools(false);
            }
            _isLive = true;
            print('Animation is now live');
            
        } else {
            print("Error loading bvh file. Status: " + _XMLHttpRequest.status +
                  " Status Text: " + _XMLHttpRequest.statusText + 
                  " Error Code: " + _XMLHttpRequest.errorCode);
        }
    }
    
    function bvhToXYZ(node, iKChain, frameNumber) {
        // the inexplicable mapping part, the product of 'trial and error' engineering :-(
        var rotation = {x:0, y:0, z:0};      
        switch (iKChain) {
     
            case "LeftArm":
                var xSign = 1;
                var ySign = 1;
                var zSign = 1;
                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0}); 
                //rotation = Vec3.subtract(rotation, walkAssets.mixamoPreRotations.joints[node.id]);
                return rotation;
                
            case "RightArm":
                var xSign = 1;
                var ySign = 1;
                var zSign = 1;                
                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0}); 
                //rotation = Vec3.subtract(rotation, walkAssets.mixamoPreRotations.joints[node.id]);
                return rotation;
                
            case "LeftLeg":
                var xSign = 1;
                var ySign = -1;
                var zSign = 1;
                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0}); 
                //rotation = Vec3.subtract(rotation, walkAssets.mixamoPreRotations.joints[node.id]);
                return rotation;
                
            case "RightLeg":
                var xSign = 1;
                var ySign = -1;
                var zSign = 1;
                rotation = Vec3.sum(rotation, {x:0, y:0, z:zSign * node.frames[frameNumber][0]});
                rotation = Vec3.sum(rotation, {x:xSign * node.frames[frameNumber][1], y:0, z:0});
                rotation = Vec3.sum(rotation, {x:0, y:ySign * node.frames[frameNumber][2], z:0});   
                //rotation = Vec3.subtract(rotation, walkAssets.mixamoPreRotations.joints[node.id]);
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
                //rotation = Vec3.subtract(rotation, walkAssets.mixamoPreRotations.joints[node.id]);
                return rotation;
        }
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
                    _frameTimeModifier -= 0.1;
                    if (_frameTimeModifier < 0.1) {
                        _frameTimeModifier = 0.1;
                    }                    
                    return;
                    
                case "playBVHSlower":
                    _frameTimeModifier += 0.1;
                    if (_frameTimeModifier > 10) {
                        _frameTimeModifier = 10;
                    }
                    return;    
                                        
                case "stop":
                    _isLive = false;
                    motion.isLive = true;
                    if (walkTools) {
                        walkTools.enableWalkTools(true);
                    }
                    return;  
            }
        }
    });
    
    const MILLISECONDS = 1000;
    Script.update.connect(function(deltaTime) {
        
        // preview raw bvh data
        if (_isLive) {
            try {
                var timeNow = new Date().getTime();
                var timeSoFar = timeNow - _bvhStartTime;
                _bvhFrameNumber = 1 + Math.floor(timeSoFar / bvhFile.frameTime / MILLISECONDS);

                if (_bvhFrameNumber >= bvhFile.numFrames) {
                    _bvhStartTime = timeNow;
                    _bvhFrameNumber = 1;
                }
                //print('getting data for frame number '+_bvhFrameNumber);

                var node = bvhFile.of('Hips');
                node.at(_bvhFrameNumber);

                // do translation
                var translationScale = 1.011 / 93.4400; //32.35; // i.e. hips to feet in Interface / Hips translation in MB for Sintel
                var hipsTranslations = {x: translationScale * node.positionX, y: translationScale * node.positionY, z: translationScale * node.positionZ};
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
                        print('could not find '+joint+' in bvh file');
                        continue;
                    }
                }
            } catch(e) {
                print('WalkToolsBVHPlayer error at frame number '+_bvhFrameNumber+': '+e.toString());
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