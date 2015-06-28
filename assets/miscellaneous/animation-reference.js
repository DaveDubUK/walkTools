//
//  dd-animation-reference.js
//
//  Created by David Wooldridge, Autumn 2014
//
//  Procedural animation joints reference datafile - use with walk.js version 1.2
//
//  Provides joint names and associated IK chains
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

AnimationReference = function(filter) {

    this.joints = {

        "Hips":{
            "name":"Hips",
            "IKChain":"Torso"
        },
        "LeftUpLeg":{
            "name":"LeftUpLeg",
            "IKChain":"LeftLeg",
            "pairing": "RightUpLeg"
        },
        "LeftLeg":{
            "name":"LeftLeg",
            "IKChain":"LeftLeg",
            "pairing": "RightLeg"
        },
        "LeftFoot":{
            "name":"LeftFoot",
            "IKChain":"LeftLeg",
            "pairing": "RightFoot"
        },
        "LeftToeBase":{
            "name":"LeftToeBase",
            "IKChain":"LeftLeg",
            "pairing": "RightToeBase"
        },
        "RightUpLeg":{
            "name":"RightUpLeg",
            "IKChain":"RightLeg",
            "pairing": "LeftUpLeg"
        },
        "RightLeg":{
            "name":"RightLeg",
            "IKChain":"RightLeg",
            "pairing": "LeftLeg"
        },
        "RightFoot":{
            "name":"RightFoot",
            "IKChain":"RightLeg",
            "pairing": "LeftFoot"
        },
        "RightToeBase":{
            "name":"RightToeBase",
            "IKChain":"RightLeg",
            "pairing": "LeftToeBase"
        },
        "Spine":{
            "name":"Spine",
            "IKChain":"Torso"
        },
        "Spine1":{
            "name":"Spine1",
            "IKChain":"Torso"
        },
        "Spine2":{
            "name":"Spine2",
            "IKChain":"Torso"
        },
        "LeftShoulder":{
            "name":"LeftShoulder",
            "IKChain":"LeftArm",
            "pairing": "RightShoulder"
        },
        "LeftArm":{
            "name":"LeftArm",
            "IKChain":"LeftArm",
            "pairing": "RightArm"
        },
        "LeftForeArm":{
            "name":"LeftForeArm",
            "IKChain":"LeftArm",
            "pairing": "RightForeArm"
        },
        "LeftHand":{
            "name":"LeftHand",
            "IKChain":"LeftArm",
            "pairing": "RightHand"
        },
        "RightShoulder":{
            "name":"RightShoulder",
            "IKChain":"RightArm",
            "pairing": "LeftShoulder"
        },
        "RightArm":{
            "name":"RightArm",
            "IKChain":"RightArm",
            "pairing": "LeftArm"
        },
        "RightForeArm":{
            "name":"RightForeArm",
            "IKChain":"RightArm",
            "pairing": "LeftForeArm"
        },
        "RightHand":{
            "name":"RightHand",
            "IKChain":"RightArm",
            "pairing": "LeftHand"
        },
        "Neck":{
            "name":"Neck",
            "IKChain":"Head"
        },
        "Head":{
            "name":"Head",
            "IKChain":"Head"
        }
    };

    this.leftHand = {

        "LeftHandPinky1":{
            "name": "LeftHandPinky1",
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky1"
        },
        "LeftHandPinky2":{
            "name": "LeftHandPinky2",
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky2"
        },
        "LeftHandPinky3":{
            "name": "LeftHandPinky3",
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky3"
        },
        "LeftHandPinky4":{
            "name": "LeftHandPinky4",
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky4"
        },
        "LeftHandRing1":{
            "name": "LeftHandRing1",
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing1"
        },
        "LeftHandRing2":{
            "name": "LeftHandRing2",
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing2"
        },
        "LeftHandRing3":{
            "name": "LeftHandRing3",
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing3"
        },
        "LeftHandRing4":{
            "name": "LeftHandRing4",
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing4"
        },
        "LeftHandMiddle1":{
            "name": "LeftHandMiddle1",
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle1"
        },
        "LeftHandMiddle2":{
            "name": "LeftHandMiddle2",
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle2"
        },
        "LeftHandMiddle3":{
            "name": "LeftHandMiddle3",
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle3"
        },
        "LeftHandMiddle4":{
            "name": "LeftHandMiddle4",
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle4"
        },
        "LeftHandIndex1":{
            "name": "LeftHandIndex1",
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex1"
        },
        "LeftHandIndex2":{
            "name": "LeftHandIndex2",
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex2"
        },
        "LeftHandIndex3":{
            "name": "LeftHandIndex3",
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex3"
        },
        "LeftHandIndex4":{
            "name": "LeftHandIndex4",
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex4"
        },
        "LeftHandThumb1":{
            "name": "LeftHandThumb1",
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb1"
        },
        "LeftHandThumb2":{
            "name": "LeftHandThumb2",
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb2"
        },
        "LeftHandThumb3":{
            "name": "LeftHandThumb3",
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb3"
        },
        "LeftHandThumb4":{
            "name": "LeftHandThumb4",
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb4"
        }
    };

    this.rightHand = {

        "RightHandPinky1":{
            "name": "RightHandPinky1",
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky1"
        },
        "RightHandPinky2":{
            "name": "RightHandPinky2",
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky2"
        },
        "RightHandPinky3":{
            "name": "RightHandPinky3",
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky3"
        },
        "RightHandPinky4":{
            "name": "RightHandPinky4",
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky4"
        },
        "RightHandRing1":{
            "name": "RightHandRing1",
            "IKChain":"RightHandRing",
            "pairing": "LeftHandRing1"
        },
        "RightHandRing2":{
            "name": "RightHandRing2",
            "IKChain":"RightHandRing",
            "pairing": "LeftHandRing2"
        },
        "RightHandRing3":{
            "name": "RightHandRing3",
            "IKChain":"RightHandRing",
            "pairing": "RightHandRing3"
        },
        "RightHandRing4":{
            "name": "RightHandRing4",
            "IKChain":"RightHandRing",
            "pairing": "LeftHandRing4"
        },
        "RightHandMiddle1":{
            "name": "RightHandMiddle1",
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle1"
        },
        "RightHandMiddle2":{
            "name": "RightHandMiddle2",
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle2"
        },
        "RightHandMiddle3":{
            "name": "RightHandMiddle3",
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle3"
        },
        "RightHandMiddle4":{
            "name": "RightHandMiddle4",
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle4"
        },
        "RightHandIndex1":{
            "name": "RightHandIndex1",
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex1"
        },
        "RightHandIndex2":{
            "name": "RightHandIndex2",
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex2"
        },
        "RightHandIndex3":{
            "name": "RightHandIndex3",
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex3"
        },
        "RightHandIndex4":{
            "name": "RightHandIndex4",
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex4"
        },
        "RightHandThumb1":{
            "name": "RightHandThumb1",
            "IKChain":"RightHandThumb",
            "pairing": "LeftHandThumb1"
        },
        "RightHandThumb2":{
            "name": "RightHandThumb2",
            "IKChain":"RightHandThumb",
            "pairing": "LeftHandThumb2"
        },
        "RightHandThumb3":{
            "name": "RightHandThumb3",
            "IKChain":"RightHandThumb",
            "pairing": "LeftHandThumb3"
        },
        "RightHandThumb4":{
            "name": "RightHandThumb4",
            "IKChain":"LeftHandThumb",
            "pairing": "LeftHandThumb4"
        }
    };
}