//
// BVH loader adapted from http://jaanga.github.io/cookbook/bvh-reader/readme-reader.html by Jaanga
// 
// Adapted for HiFi JS: David Wooldridge, August 2015
//

Bvh = {};
Bvh.numJoints = 0;
Bvh.nodes = [];

Bvh.parseData = function (data, _translationScale) {
    var _this = Bvh;
    _this.data = data.split(/\s+/g);
    _this.channels = [];
	_this._translationScale = _translationScale;
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


// convert Euler rotations to angles using Three.js objects
Bvh.eulerRotationsToAngles = function(rotations, rotationOrder) {
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

// args: jointName, then references to values arrays, translation = false
Bvh.getChannels = function(jointName, x, y, z, translation) {
    
    if (translation === undefined) {
        translation = false;
    }    
    for (var frameNumber = 0; frameNumber < this.numFrames; frameNumber++) {        
        var n = frameNumber % this.numFrames * this.channels.length;
        
        for (var i = 0, len = this.channels.length; i < len; i++) {
            var channel = this.channels[i];
            
            if (channel.node.name === jointName) {

                switch (channel.prop) {
                    case 'Xrotation':
                        if (!translation) {
                            x.push(this.data[n]);
                        }
                        break;
                    case 'Yrotation':
                        if (!translation) {
                            y.push(this.data[n]);
                        }
                        break;
                    case 'Zrotation':
                        if (!translation) {
                            z.push(this.data[n]);
                        }
                        break;
                    case 'Xposition':
                        if (translation) {
                            x.push(this.data[n]);
                        }
                        break;
                    case 'Yposition':
                        if (translation) {
                            y.push(this.data[n]);
                        }
                        break;
                    case 'Zposition':
                        if (translation) {
                            z.push(this.data[n]);
                        }
                        break;
                    default:
                        print('Warning: missing or unrecognised channel property in walkTools bvh importer: '+ch.prop);
                        break;
                }
            }
            n++;
        }
    }
}    

Bvh.animate = function(frame, preRotations) {
	// use the standard walk.js animation buffer to store keyframe values as offset parameters for each frame
    var buffer = walkAssets.createAnimationBuffer("bvhData");
    var ch, frame, n;
    n = frame % this.numFrames * this.channels.length;
    
    try {
        for (var i = 0, len = this.channels.length; i < len; i++) {

            ch = this.channels[i];
            
            if (buffer.joints[ch.node.name]) {
                
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
            }
            n++;
        }
    } catch (e) {
        print('Error on joint '+ch.node.name);
        print('Error: '+e.toString());
    }
    
    //print('Buffer name is '+buffer.name+' and has '+buffer.joints.length+' joints');

    // the buffer's offsets have been filled for this frame, time to render
	for (joint in buffer.joints) {
		var rotation = {x: 0, y: 0, z: 0};
		var iKChain = walkAssets.animationReference.joints[joint].IKChain;

		// deal with Hips translation first
		if (joint === "Hips") {
            var hipsTranslations = {
                x: this._translationScale * buffer.joints["Hips"].swayOffset,
                y: this._translationScale * buffer.joints["Hips"].bobOffset,
                z: this._translationScale * buffer.joints["Hips"].thrustOffset
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
		rotation =
        {
            x: buffer.joints[joint].pitchOffset,
            y: buffer.joints[joint].yawOffset,
            z: buffer.joints[joint].rollOffset
        };
		
		if (preRotations) {		
			rotation = Vec3.subtract(rotation, preRotations.joints[joint]);
		}
        
        rotation = this.eulerRotationsToAngles(rotation, "ZXY");
        
        //print ('Setting '+rotation.x.toFixed(1)+', '+rotation.y.toFixed(1)+', '+rotation.z.toFixed(1)+' on joint '+joint);

        if (joint === walkTools.currentlySelectedJoint()) {
			walkToolsOscilloscope.updateScopeData(
				{
					title: 'Jaanga BVH data',
					metaDataLabel: "",
					metaData: "",
					joint: joint,
					iKChain: walkAssets.animationReference.joints[joint].IKChain,
					ch1: rotation.x,
					ch2: rotation.y,
					ch3: rotation.z
				}
			);            
        }
        MyAvatar.setJointRotation(joint, Quat.fromPitchYawRollDegrees(rotation.x, rotation.y, rotation.z));
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