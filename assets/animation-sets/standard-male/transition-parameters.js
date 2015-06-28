//
//  transitions.js
//
//  version 1.0
//
//  Created by David Wooldridge, December 2014
//
//  Stores and supplies parameters defining animation transition properties for the walk.js script v1.2+
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

transitionParameterData = (function() {

    _transitionParameters = {
        lastAnimation: {
            "MaleIdle": {
                nextAnimation: {
                    "WalkBlend": {
                        // Reach Pose Descriptions:
                        //  - MaleIdleToWalkRP  - lean forwards from upper torso
                        //  - MaleIdleToWalk2RP - arm swing early starter (matches walk)
                        //  - MaleIdleToWalk3RP - hips and left leg early starter (matches walk)
                        //  - MaleIdleToWalk4RP - bends the leading leg to allow the first step to be cut short more cleanly
                        duration: 1.25,
                        easingLower: {x:0.0, y:1.0},
                        easingUpper: {x:0.0, y:1.0},
                        reachPoses: ["MaleIdleToWalkRP", "MaleIdleToWalk2RP", "MaleIdleToWalk3RP", "MaleIdleToWalk4RP"]
                    },

                    "FlyBlend": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},  
                        easingUpper: {x:0.23, y:0.92}
                    },

                    "MaleHover": {
                        duration: 0.5,
                        easingLower: {x:0.74, y:0.10},  
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },

            "MaleHover": {
                nextAnimation: {
                    "MaleIdle": {
                        duration: 0.33,
                        easingLower: {x:0.74, y:0.10},  
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },

            "WalkBlend": {
                nextAnimation: {
                    "MaleIdle": {
                        duration: 0.35,
                        easingLower: {x:0.25, y:0.0},
                        easingUpper: {x:0.0, y:1.0}
                    },

                    "FlyBlend": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},  
                        easingUpper: {x:0.23, y:0.92}
                    }
                }
            },
            "FlyBlend": {
                nextAnimation: {
                    "MaleHover": {
                        duration: 0.55,
                        easingLower: {x:0.74, y:0.10},  
                        easingUpper: {x:0.23, y:0.92}
                    },

                    "WalkBlend": {
                        duration: 0.5,
                        easingLower: {x:0.5, y:0.0},
                        easingUpper: {x:0.2, y:1.0},
                        reachPoses: ["MaleFlyToWalkRP"]
                    },

                    "MaleIdle": {
                        duration: 0.35,
                        easingLower: {x:0.3, y:0.0},
                        easingUpper: {x:0.0, y:1.0},
                        reachPoses: ["MaleHoverToIdleRP"]
                    }
                }
            }
        }
    }

    return {

        // populate transitionParameters with specified transition parameters (where set)
        fetch: function(lastAnimation, nextAnimation, transitionParameters) {
            if (lastAnimation && nextAnimation) {
                for (animationLast in _transitionParameters.lastAnimation) {
                    if (animationLast === lastAnimation.name) {
                        for (animationNext in _transitionParameters.lastAnimation[animationLast].nextAnimation) {
                            if (animationNext === nextAnimation.name) {
                                if (_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].duration) {
                                     transitionParameters.duration =  _transitionParameters.lastAnimation[animationLast]
                                                                      .nextAnimation[animationNext].duration;
                                }
                                if (_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].easingLower) {
                                     transitionParameters.easingLower = _transitionParameters.lastAnimation[animationLast]
                                                                        .nextAnimation[animationNext].easingLower;
                                }
                                if (_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].easingUpper) {
                                     transitionParameters.easingUpper = _transitionParameters.lastAnimation[animationLast]
                                                                        .nextAnimation[animationNext].easingUpper;
                                }
                                if (_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].reachPoses) {
                                     transitionParameters.reachPoses = _transitionParameters.lastAnimation[animationLast]
                                                                    .nextAnimation[animationNext].reachPoses;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})(); // end walk transitions object literal