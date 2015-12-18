//
//  walkToolsBVHConverter.js
//  version 1.0
//
//  Created by David Wooldridge, Summer 2015
//  Copyright © 2015 David Wooldridge
//
//  Logs debug messages. Avoids the clutter of the Interface log.
//
//  Editing tools available here: https://s3-us-west-2.amazonaws.com/davedub/high-fidelity/walkTools/walk.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// include Jaanga parser
Script.include("./walkTools/libraries/jaanga-bvh-parser-hifi-version.js");

// borrow a couple of classes from Three.js
// used for Euler rotations to Pitch / Yaw / Roll angles conversion
Script.include("./libraries/three.js/math/Quaternion.js");
Script.include("./libraries/three.js/math/Euler.js");
Script.include("./libraries/three.js/math/Vector3.js");

// include DSP.js for DFT
// modified line 298 from 'function DFT(_bufferSize, _sampleRate)' to 'DFT = function(_bufferSize, _sampleRate)'
Script.include("./walkTools/libraries/DSP.js");


walkToolsBVHConverter = function() {
    var that = {};
    
    // conversion properties - need setting for each conversion
    var _animationName = "Run";
    var _sampleRate = 60;
    var _bufferSize = 64;
    var _numFrames = 44;
    var _numHarmonics = 6; //  maximum theoretical is _bufferSize / 2;
    var _fingerHarmonics = 3; // there's not really any need for any more than this for walking etc
    var _frequency = 2 * Math.PI * _sampleRate / _numFrames; //_bufferSize;//136; //
    // translation scale is ratio of hips to feet (metres, in Interface) and hips to feet (units, source animation)
    var _translationScale = 1.0 / 93.80; //101.1; // i.e. hips to feet in Interface / Hips translation in MB (for std anims)

    var _bvhFrameNumber = 0;
    var _bvhStartTime = 0;

    // convert Euler rotations to angles using Three.js objects
    function eulerRotationsToAngles(rotations, rotationOrder) {
        
        var euler = new THREE.Euler(
            filter.degToRad(rotations.x),
            filter.degToRad(rotations.y),
            filter.degToRad(rotations.z),
            rotationOrder);
            
        //var angles = euler.toVector3();
        //return {
        //    x: filter.radToDeg(angles.x),
        //    y: filter.radToDeg(angles.y),
        //    z: filter.radToDeg(angles.z)
        //};
        
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

    function doDFT(waveform, harmonicFile, prefix, numHarmonics) {
        try {
            var transform = new DFT(_bufferSize, _sampleRate);
            var magnitudes = [];
            var phaseAngles = [];
            const DP = 16;
            transform.forward(waveform);
            for(var n = 0; n < numHarmonics ; n++) {
                var phaseAngle = Math.atan2(transform.imag[n], transform.real[n]);

                if (isNaN(transform.spectrum[n])) {
                    magnitudes[n] = 0;
                    phaseAngles[n] = 0;
                } else if (!isNaN(phaseAngle)) {
                    magnitudes[n] = (transform.spectrum[n] / transform.peak).toFixed(DP);
                    phaseAngles[n] = phaseAngle.toFixed(DP);
                } else {
                    print('Warning: dropped a phase angle at n = '+n);
                    magnitudes[n] = 0;
                    phaseAngles[n] = 0;
                }
            }
            harmonicFile.exportData += '\"' + prefix + 'Harmonics"\: {';
            harmonicFile.exportData += '\"numHarmonics"\: '+numHarmonics+',';
            harmonicFile.exportData += '\"magnitudes"\: [';
            for (var n = 0; n < numHarmonics; n++) {
                harmonicFile.exportData += magnitudes[n]
                if (n < numHarmonics - 1) {
                    harmonicFile.exportData += ',';
                }
            }
            harmonicFile.exportData += '], \"phaseAngles\": [';
            for (var n = 0; n < numHarmonics; n++) {
                harmonicFile.exportData += phaseAngles[n];
                if (n < numHarmonics - 1) {
                    harmonicFile.exportData += ',';
                }
            }
            harmonicFile.exportData += ']},';

            return transform.peak;
        } catch(e) {
            print('Error performing DFT: '+e.toString());
        }
        return null;
    }
    
    function convertJoint(joint, harmonicFile) {

        harmonicFile.jointsSection[joint] = {};

        // get rotation values
        var xRotation = [];
        var yRotation = [];
        var zRotation = [];
        Bvh.getChannels(joint, xRotation, yRotation, zRotation, false);
        
        // convert Euler rotations to pitch / yaw / roll angles  
        for (i in xRotation) {
            var rotation = eulerRotationsToAngles({x: xRotation[i], y: yRotation[i], z: zRotation[i]}, "ZXY");
            xRotation[i] = rotation.x ; yRotation[i] = rotation.y ; zRotation[i] = rotation.z;
        }
        
        // calculate average, min and max values
        var xRotationMean = 0;
        var yRotationMean = 0;
        var zRotationMean = 0;
        var xMax = -Infinity;
        var xMin = Infinity;
        var yMax = -Infinity;
        var yMin = Infinity;
        var zMax = -Infinity;
        var zMin = Infinity;
        
        for (i in xRotation) {
            var x = Number(xRotation[i]);
            xRotationMean += x;
            xMax = x > xMax ? x : xMax;
            xMin = x < xMin ? x : xMin;
            var y = Number(yRotation[i]);
            yRotationMean += y;
            yMax = y > yMax ? y : yMax;
            yMin = y < yMin ? y : yMin;
            var z = Number(zRotation[i]);
            zRotationMean += z;
            zMax = z > zMax ? z : zMax;
            zMin = z < zMin ? z : zMin;
        }
        xRotationMean /= Bvh.numFrames;
        yRotationMean /= Bvh.numFrames;
        zRotationMean /= Bvh.numFrames;
       
        // do we need to apply an unroll filter? Hopefully not, as this unroll filter is very crude
        // Due to Euler rotation properties, when a rotation angle cross over the 180 degree value, it becomes -179
        // these discontinuities play havoc with the DFT result, so we try to unroll them
        var xRange = xMax - xMin;
        var yRange = yMax - yMin;
        var zRange = zMax - zMin;
        
        if (xRange > HALF_CYCLE || yRange > HALF_CYCLE || zRange > HALF_CYCLE) {
            if (xRotationMean > 0) {
                for (i in xRotation) {
                    xRotation[i] -= xRotation[i] > xRotationMean ? HALF_CYCLE : 0;
                }
            } else {
                for (i in xRotation) {
                    xRotation[i] += xRotation[i] < xRotationMean ? HALF_CYCLE : 0;
                }
            }
            if (yRotationMean > 0) {
                for (i in yRotation) {
                    yRotation[i] -= yRotation[i] > yRotationMean ? HALF_CYCLE : 0;
                }
            } else {
                for (i in yRotation) {
                    yRotation[i] += yRotation[i] < yRotationMean ? HALF_CYCLE : 0;
                }
            }
            if (zRotationMean > 0) {
                for (i in zRotation) {
                    zRotation[i] -= zRotation[i] > zRotationMean ? HALF_CYCLE : 0;
                }
            } else {
                for (i in zRotation) {
                    zRotation[i] += zRotation[i] < zRotationMean ? HALF_CYCLE : 0;
                }
            }            
            
            // need to re-calculate means
            xRotationMean = 0;
            yRotationMean = 0;
            zRotationMean = 0;            
            for (i in xRotation) {
                xRotationMean += Number(xRotation[i]);
                yRotationMean += Number(yRotation[i]);
                zRotationMean += Number(zRotation[i]);
            }
            xRotationMean /= Bvh.numFrames;
            yRotationMean /= Bvh.numFrames;
            zRotationMean /= -Bvh.numFrames; // this is a hack and needs further investigation
        }
 /**/
        // get Hips translations
        if (joint === "Hips") {
            var xTranslation = [];
            var yTranslation = [];
            var zTranslation = [];

            Bvh.getChannels(joint, xTranslation, yTranslation, zTranslation, true);
            
            for (i = 0; i < Bvh.numFrames ; i++) {
                xTranslation[i] *= _translationScale;
                yTranslation[i] *= _translationScale;
                zTranslation[i] *= _translationScale;
            }            
        }

        // set the offsets for this joint
        harmonicFile.jointsSection[joint]["pitchOffset"] = Number(xRotationMean);
        harmonicFile.jointsSection[joint]["yawOffset"] = Number(yRotationMean);
        harmonicFile.jointsSection[joint]["rollOffset"] = Number(zRotationMean);

        // remove 'DC offset'
        for (i = 0; i < Bvh.numFrames ; i++) {
            xRotation[i] -= xRotationMean;
            yRotation[i] -= yRotationMean;
            zRotation[i] -= zRotationMean;
        }

        // calculate harmonics
        var isFingerJoint = (walkAssets.animationReference.joints[joint].IKParent === "RightHand" ||
                             walkAssets.animationReference.joints[joint].IKParent === "LeftHand");
        var numHarmonics = isFingerJoint ? _fingerHarmonics : _numHarmonics;
        harmonicFile.exportData += '\"' + joint + '"\:{';
        harmonicFile.jointsSection[joint]["pitch"] = 
            doDFT(xRotation, harmonicFile, "pitch", numHarmonics);
        harmonicFile.jointsSection[joint]["yaw"] = 
            doDFT(yRotation, harmonicFile, "yaw", numHarmonics);
        harmonicFile.jointsSection[joint]["roll"] = 
            doDFT(zRotation, harmonicFile, "roll", numHarmonics);

        if (joint === "Hips") {
            harmonicFile.jointsSection[joint]["sway"] = 
                doDFT(xTranslation, harmonicFile, "sway", _numHarmonics);
            harmonicFile.jointsSection[joint]["bob"] = 
                doDFT(yTranslation, harmonicFile, "bob", _numHarmonics);
            harmonicFile.jointsSection[joint]["thrust"] =
                doDFT(zTranslation, harmonicFile, "thrust", _numHarmonics);
        }

        // remove trailing comma at end and close section
        harmonicFile.exportData = harmonicFile.exportData.substring(0, harmonicFile.exportData.length-1);
        harmonicFile.exportData += '},';

        print(joint+' conversion complete.');
    }

    that.exportJaanga = function(rawBVHData, _translationScale) {
        try {
            Bvh.parseData(rawBVHData, _translationScale);
            print('BVH converter has loaded '+Bvh.numFrames+' animation frames using the Jaanga parser.');
            print('Converting ' + _animationName + ' using sample rate of ' + _sampleRate + '. Scaling by ' + _translationScale + '.');
            print('Calculating ' + _numHarmonics + ' harmonics per body joint and ' + _fingerHarmonics + ' harmonics per finger joint.');
            print('Starting conversion:');   

            const OFFSET_DP = 5;
            const OSCILLATION_DP = 4;

            var x = [];
            var y = [];
            var z = [];

            var harmonicFile = {};
            harmonicFile.jointsSection = {};
            harmonicFile.exportData = '{';
            harmonicFile.exportData += '\"name\": \"' + _animationName + '\",';
            harmonicFile.exportData += '\"calibration\": {\"frequency"\:'+_frequency+',\"strideLength"\:0.85,\"strideMaxAt"\:75},';
            harmonicFile.exportData += '\"harmonics\": {';

            for (joint in walkAssets.animationReference.joints) {
                convertJoint(joint, harmonicFile);
            }  
            // remove trailing comma at end of section
            harmonicFile.exportData = harmonicFile.exportData.substring(0, harmonicFile.exportData.length-1);

            // add the now complete joints section to the exported data
            harmonicFile.exportData += '},\"joints\": {';
            for (joint in harmonicFile.jointsSection) {
                harmonicFile.exportData += '\"' + joint + '\":{';
                harmonicFile.exportData += '\"pitch\":'+ 
                    Number(harmonicFile.jointsSection[joint]["pitch"]).toFixed(OSCILLATION_DP)  + ',';
                harmonicFile.exportData += '\"yaw\":'+ 
                    Number(harmonicFile.jointsSection[joint]["yaw"]).toFixed(OSCILLATION_DP)  + ',';
                harmonicFile.exportData += '\"roll\":'+ 
                    Number(harmonicFile.jointsSection[joint]["roll"]).toFixed(OSCILLATION_DP)  + ',';
                harmonicFile.exportData += '\"pitchPhase\":0,';
                harmonicFile.exportData += '\"yawPhase\":0,';
                harmonicFile.exportData += '\"rollPhase\":0,';
                harmonicFile.exportData += '\"pitchOffset\":'+ 
                    Number(harmonicFile.jointsSection[joint]["pitchOffset"]).toFixed(OFFSET_DP)  + ',';
                harmonicFile.exportData += '\"yawOffset\":'+ 
                    Number(harmonicFile.jointsSection[joint]["yawOffset"]).toFixed(OFFSET_DP)  + ',';
                harmonicFile.exportData += '\"rollOffset\":'+ 
                    Number(harmonicFile.jointsSection[joint]["rollOffset"]).toFixed(OFFSET_DP);
                if (joint === "Hips") {
                    harmonicFile.exportData += ',';
                    harmonicFile.exportData += '\"sway\":'+ 
                        Number(harmonicFile.jointsSection[joint]["sway"]).toFixed(OSCILLATION_DP)  + ',';
                    harmonicFile.exportData += '\"bob\":'+ 
                        Number(harmonicFile.jointsSection[joint]["bob"]).toFixed(OSCILLATION_DP)  + ',';
                    harmonicFile.exportData += '\"thrust\":'+ 
                        Number(harmonicFile.jointsSection[joint]["thrust"]).toFixed(OSCILLATION_DP)  + ',';
                    harmonicFile.exportData += '\"swayPhase\":0,';
                    harmonicFile.exportData += '\"bobPhase\":0,';
                    harmonicFile.exportData += '\"thrustPhase\":0,';
                    harmonicFile.exportData += '\"swayOffset\":'+ 
                        Number(harmonicFile.jointsSection[joint]["swayOffset"]).toFixed(OFFSET_DP)  + ',';
                    harmonicFile.exportData += '\"bobOffset\":'+ 
                        Number(harmonicFile.jointsSection[joint]["bobOffset"]).toFixed(OFFSET_DP)  + ',';
                    harmonicFile.exportData += '\"thrustOffset\":'+ 
                        Number(harmonicFile.jointsSection[joint]["thrustOffset"]).toFixed(OFFSET_DP);
                }
                harmonicFile.exportData += '},';
            }
            // remove trailing comma at end of section
            harmonicFile.exportData = harmonicFile.exportData.substring(0, harmonicFile.exportData.length-1);

            // close off
            harmonicFile.exportData += '}}';

            // dump to Interface log
            print('\n'); print('\n'); print('\n'); print('\n'); print('\n');
            print('Keyframe to harmonic animation conversion complete:\n\n'+harmonicFile.exportData);
            print('\n'); print('\n'); print('\n'); print('\n'); print('\n');
            
            // dump to walkTools log
            walkToolsLog.clearLog();
            walkToolsLog.setVisible(true);
            walkTools.toLog(harmonicFile.exportData, false);
        } catch(e) {
            print('Error converting BVH to harmonic procedural: '+e.toString());
        }
    }
    return that;
};

walkToolsBVHConverter = walkToolsBVHConverter();