//
//  walkTransitions.js
//
//  version 1.0
//
//  Created by David Wooldridge, December 2014
//
//  Stores and supplies parameters defining animation transition properties for the walk.js script v1.2
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

transitions = (function() {

    _transitionParameters = {

        lastAnimation: {

            "MaleIdle": {

                nextAnimation: {

                    "WalkBlend": {

                        // MaleIdleToWalkRP - lean forwards from upper torso
                        // MaleIdleToWalk2RP - arm swing early starter (matches walk)
                        // MaleIdleToWalk3RP - hips and left leg early starter (matches walk)
                        // MaleIdleToWalk4RP - bends the leading leg to allow the step to be cut short (matches walk)
                        duration: 1.25,
                        easingLower: {x:0.0, y:1.0},
                        easingUpper: {x:0.0, y:1.0},
                        actions: ["MaleIdleToWalk4RP"]//"MaleIdleToWalkRP", "MaleIdleToWalk2RP", "MaleIdleToWalk3RP", "MaleIdleToWalk4RP"]
                    },

                    "FlyBlend": {

                        duration: 0.55,
                        easingLower: {x:0.5, y:0.5},
                        easingUpper: {x:0.5, y:0.5},
                        //actions: ["MaleWalkToFlyRP"]
                    }
                }
            },

            "MaleHover": {

                nextAnimation: {

                    "MaleIdle": {

                        duration: 0.33,
                        easingLower: {x:0.5, y:0.5},
                        easingUpper: {x:0.5, y:0.5},
                        //actions: ["MaleHoverToIdleRP"]
                    }
                }
            },

            "WalkBlend": {

                nextAnimation: {

                    "MaleIdle": {

                        duration: 0.4,
                        easingLower: {x:0.35, y:0.0},
                        easingUpper: {x:0.0, y:1.0},
                        //actions: ["MaleWalkToIdleRP"]
                    },

                    "FlyBlend": {

                        duration: 0.55,
                        easingLower: {x:0.5, y:0.5},
                        easingUpper: {x:0.5, y:0.5},
                        //actions: ["MaleWalkToFlyRP"]
                    }
                }
            },
            "FlyBlend": {

                nextAnimation: {

                    "MaleHover": {

                        duration: 0.55,
                        easingLower: {x:0.5, y:0.5},
                        easingUpper: {x:0.5, y:0.5}
                    },

                    "WalkBlend": {

                        duration: 0.55,
                        easingLower: {x:0.5, y:0.5},
                        easingUpper: {x:0.5, y:0.5},
                        actions: ["MaleHoverToIdleRP"]//actions: ["MaleFlyToWalkRP"]//actions: ["MaleFlyToWalkRP"]
                    },

                    "MaleIdle": {

                        duration: 0.55,
                        easingLower: {x:0.5, y:0.5},
                        easingUpper: {x:0.5, y:0.5},
                        actions: ["MaleHoverToIdleRP"]//actions: ["MaleFlyToWalkRP"]//actions: ["MaleHoverToIdleRP"]
                    }
                }
            }
        }
    }

    return {

        // return appropriate transtion parameters (where set)
        getTransitionParameters: function(lastAnimation, nextAnimation, transitionParameters) {

            if(isDefined(lastAnimation) && isDefined(nextAnimation)) {

                for (animationLast in _transitionParameters.lastAnimation) {

                    if (animationLast === lastAnimation.name) {

                        for (animationNext in _transitionParameters.lastAnimation[animationLast].nextAnimation) {

                            if (animationNext === nextAnimation.name) {

                                if (isDefined(_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].duration)) {

                                     transitionParameters.duration =  _transitionParameters.lastAnimation[animationLast]
                                                                      .nextAnimation[animationNext].duration;
                                }
                                if (isDefined(_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].easingLower)) {

                                     transitionParameters.easingLower = _transitionParameters.lastAnimation[animationLast]
                                                                        .nextAnimation[animationNext].easingLower;
                                }
                                if (isDefined(_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].easingUpper)) {

                                     transitionParameters.easingUpper = _transitionParameters.lastAnimation[animationLast]
                                                                        .nextAnimation[animationNext].easingUpper;
                                }
                                if (isDefined(_transitionParameters.lastAnimation[animationLast]
                                              .nextAnimation[animationNext].actions)) {

                                     transitionParameters.actions = _transitionParameters.lastAnimation[animationLast]
                                                                    .nextAnimation[animationNext].actions;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

})(); // end reach poses object literal