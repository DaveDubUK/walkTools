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
            "IKChain":"Torso"
        },
        "LeftUpLeg":{
            "IKChain":"LeftLeg",
            "pairing": "RightUpLeg"
        },
        "LeftLeg":{
            "IKChain":"LeftLeg",
            "pairing": "RightLeg"
        },
        "LeftFoot":{
            "IKChain":"LeftLeg",
            "pairing": "RightFoot"
        },
        "LeftToeBase":{
            "IKChain":"LeftLeg",
            "pairing": "RightToeBase"
        },
        "RightUpLeg":{
            "IKChain":"RightLeg",
            "pairing": "LeftUpLeg"
        },
        "RightLeg":{
            "IKChain":"RightLeg",
            "pairing": "LeftLeg"
        },
        "RightFoot":{
            "IKChain":"RightLeg",
            "pairing": "LeftFoot"
        },
        "RightToeBase":{
            "IKChain":"RightLeg",
            "pairing": "LeftToeBase"
        },
        "Spine":{
            "IKChain":"Torso"
        },
        "Spine1":{
            "IKChain":"Torso"
        },
        "Spine2":{
            "IKChain":"Torso"
        },
        "LeftShoulder":{
            "IKChain":"LeftArm",
            "pairing": "RightShoulder"
        },
        "LeftArm":{
            "IKChain":"LeftArm",
            "pairing": "RightArm"
        },
        "LeftForeArm":{
            "IKChain":"LeftArm",
            "pairing": "RightForeArm"
        },
        "LeftHand":{
            "IKChain":"LeftArm",
            "pairing": "RightHand"
        },
        "RightShoulder":{
            "IKChain":"RightArm",
            "pairing": "LeftShoulder"
        },
        "RightArm":{
            "IKChain":"RightArm",
            "pairing": "LeftArm"
        },
        "RightForeArm":{
            "IKChain":"RightArm",
            "pairing": "LeftForeArm"
        },
        "RightHand":{
            "IKChain":"RightArm",
            "pairing": "LeftHand"
        },
        "Neck":{
            "IKChain":"Torso"
        },
        "Head":{
            "IKChain":"Torso"
        }
    };

    this.leftHand = {

        "LeftHandPinky1":{
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky1"
        },
        "LeftHandPinky2":{
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky2"
        },
        "LeftHandPinky3":{
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky3"
        },
        "LeftHandPinky4":{
            "IKChain":"LeftHandPinky",
            "pairing": "RightHandPinky4"
        },
        "LeftHandRing1":{
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing1"
        },
        "LeftHandRing2":{
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing2"
        },
        "LeftHandRing3":{
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing3"
        },
        "LeftHandRing4":{
            "IKChain":"LeftHandRing",
            "pairing": "RightHandRing4"
        },
        "LeftHandMiddle1":{
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle1"
        },
        "LeftHandMiddle2":{
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle2"
        },
        "LeftHandMiddle3":{
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle3"
        },
        "LeftHandMiddle4":{
            "IKChain":"LeftHandMiddle",
            "pairing": "RightHandMiddle4"
        },
        "LeftHandIndex1":{
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex1"
        },
        "LeftHandIndex2":{
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex2"
        },
        "LeftHandIndex3":{
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex3"
        },
        "LeftHandIndex4":{
            "IKChain":"LeftHandIndex",
            "pairing": "RightHandIndex4"
        },
        "LeftHandThumb1":{
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb1"
        },
        "LeftHandThumb2":{
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb2"
        },
        "LeftHandThumb3":{
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb3"
        },
        "LeftHandThumb4":{
            "IKChain":"LeftHandThumb",
            "pairing": "RightHandThumb4"
        }
    };

    this.rightHand = {

        "RightHandPinky1":{
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky1"
        },
        "RightHandPinky2":{
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky2"
        },
        "RightHandPinky3":{
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky3"
        },
        "RightHandPinky4":{
            "IKChain":"RightHandPinky",
            "pairing": "LeftHandPinky4"
        },
        "RightHandRing1":{
            "IKChain":"RightHandRing",
            "pairing": "LeftHandRing1"
        },
        "RightHandRing2":{
            "IKChain":"RightHandRing",
            "pairing": "LeftHandRing2"
        },
        "RightHandRing3":{
            "IKChain":"RightHandRing",
            "pairing": "RightHandRing3"
        },
        "RightHandRing4":{
            "IKChain":"RightHandRing",
            "pairing": "LeftHandRing4"
        },
        "RightHandMiddle1":{
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle1"
        },
        "RightHandMiddle2":{
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle2"
        },
        "RightHandMiddle3":{
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle3"
        },
        "RightHandMiddle4":{
            "IKChain":"RightHandMiddle",
            "pairing": "LeftHandMiddle4"
        },
        "RightHandIndex1":{
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex1"
        },
        "RightHandIndex2":{
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex2"
        },
        "RightHandIndex3":{
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex3"
        },
        "RightHandIndex4":{
            "IKChain":"RightHandIndex",
            "pairing": "LeftHandIndex4"
        },
        "RightHandThumb1":{
            "IKChain":"RightHandThumb",
            "pairing": "LeftHandThumb1"
        },
        "RightHandThumb2":{
            "IKChain":"RightHandThumb",
            "pairing": "LeftHandThumb2"
        },
        "RightHandThumb3":{
            "IKChain":"RightHandThumb",
            "pairing": "LeftHandThumb3"
        },
        "LeftHandThumb4":{
            "IKChain":"LeftHandThumb",
            "pairing": "LeftHandThumb4"
        }
    };
}