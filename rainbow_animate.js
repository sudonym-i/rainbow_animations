/**
 * @name Rainbow
 * 
 * @file_name rainbow_animate.js
 * 
 * @author Isaac Klein
 * @course COMP 2631 - Information Structures
 * @instructor  Mia MacTavish
 * @modified dec 7, 2025
 * 
 * @credit article at https://bost.ocks.org/mike/algorithms/ for the inspiration of this project
 * 
 * Usage:
 * 
 * Proper usage requirews the following:
 * 
 * 
 * 
 * -- OPTIONAL, use Rainnbow to generate a random array of numbers --
 *                                                                  |
 * let values = Rainbow.generateRandomValues(<ARRAY_SIZE>);         |
 *                                                                  |
 * ------------------------------------------------------------------
 * 
 * 
 * 
 * -- Create a Rainbow object ---------------------------------------
 *          passing the array to be animated (<ARRAY_OF_NUMBERS>)   |
 *          And your algorithm set function (<STEP_FUNCTION>)       |
 *                                                                  |
 * let animation = new Rainbow(<ARRAY_OF_NUMBERS>, <STEP_FUNCTION>);|  <--\
 *                                                                  |     |
 * ------------------------------------------------------------------     |
 *                                                                        |
 *                                                                        |
 *                                                                        |
 * -- Trigger the animation -----------------------------------------     |
 * animation.startAnimation();                                      |     |
 *                                                                  |     |
 * ------------------------------------------------------------------     |
 *                                                                        |
 * ALGORITHM <STEP_FUNCTION> REQUIREMENTS     <---------------------------/
 * 
 * When you write the step function for this library, it must follow
 * these requirements:
 *      1 - It must take <CURRENT_ARRAY> as an argument.
 *          This will be the state of the array prior to the step 
 *          your function will perform. This array will be passed to 
 *          your function, and will be either
 *              - the starting array
 *              or
 *              - the output from the last call of your step algorithm
 * 
 *      2 - It must take a <STATE> onject.
 *          This object can be anything you like (or nothing). This onject
 *          will contain any information you need to keep continuity of for
 *          your algorithm. It will contain:
 *              - 'undefined' if it is the first time your algorithm has stepped
 *              or
 *              - The attributes passed by the last run of your step algorithm
 * 
 *          An example of what this would be used for is in the shellSortStep() function,
 *          which needs to keep track of 'state.gapSize' between calls.
 * 
 * 
 *      3 - It must return an object with  { newArray, isComplete, state }, where:
 * 
 *              'newArray' is the array that resulted from 1 step of your algorithm 
 *              (you can think of it as the 'result' of performing 1 step)
 * 
 *              'isComplete' is a boolean, TRUE if your function has determined that the 
 *              algorithm is over, FALSE if the algorithm ought ot keep going.
 * 
 *              'state' is the object we mentioned before, with all the information
 *              that the next call of your step function will require.
 * 
 * 
 * 
 * EXAMPLE USAGE:
 * 
 * let values = Rainbow.generateRandomValues(ARRAY_SIZE);
 * let animation = new Rainbow(values, shellSortStep);
 * animation.startAnimation();
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * Restrictions:
 *  - The input array MUST have only unique values
 * 
 *  - This class is initialized with an array of values you wish to graph.
 *    the algorithm graphed may NOT change the length of the array
 * 
 * 
 * 
 */
class Rainbow {

    /**
     * Const parameters for the Rainbow class- changes to these influence
     * how the class draws the animations.
     * DEFAULTS:
     */
    CANVAS_ID             = "canvas"          // ID of the canvas you wish for this class to animate on
    TEXT_STYLE            = "10px monospace"
    TEXT_COLOR            = "white"
    NODE_SPACING          = 14;               // x axis spacing between lines
    INITIAL_Y_POSITION    = 20;               // Start a bit down from the top of the canvas for visibility
    ANIMATION_SPEED       = 20;               // frames between sort steps (also affects straight line height)
    LINE_INCREMENT        = 1;                // Probably shouldn't touch this... changes how far down we 
    STRAIGHT_LENGTH       = 2;                // the length of the straight sections between swaps = 1 / STRAIGHT_LENGTH 
                                              //  go per step (how long the line draws are)
    SWAP_INCREMENT        = 33;               // how tall the swap animations are- poorly named, change later
    SWAP_ANIMATION_FRAMES = this.ANIMATION_SPEED * 3;  // Number of frames to animate a swap
    START_TEXT_Y_POS      = 15;               // space from top of the canvas
    END_TEXT_Y_POS        = 15;               // space from end of lines to the numbers printed below
    LINECAP_STYLE         ='round';
    LINE_WIDTH            = 5;
    COLOR_SATURATION      = 45;
    COLOR_LIGHTNESS       = 60;
    SPECTRUM              = 340;              // 0 - 360 degrees on the color wheel
                                              // NOTE: full 360 will bring both ends to about the same color


    /**
     * This method takes the initial array and a step function that defines the sorting algorithm.
     * The algorithm graphed may NOT change the array size.
     *
     * @param numArray, array of numbers to be animated
     * @param setpFunction a function that defines 1 step in the sorting
     * algorithm that the calling scope wishes to animate
     * 
     */
    constructor(numArray, stepFunction) {
        // setup canvas and draw tool
        let canvas = document.getElementById(this.CANVAS_ID);  
        this.ctx = canvas.getContext("2d"); 
        this.writeNumbers(numArray, this.START_TEXT_Y_POS);     // the little numbers above the lines
        
        this.nodes = this.createNodes(numArray);    // create a node for each item in the array
        this.values = this.copyArray(numArray);     // Store current array state
        
        this.frameCounter = 1;              // This is used to swap every x frames (starts at 1 so we dont swap immediately,
                                            // as the swap logic uses % )

        this.stepFunction = stepFunction;   // User-provided algorithm step function
        this.algorithmState = {};           // State object passed to/from step function
        this.isSwapping = false;           // bool to specify whether or not we are swapping
        this.swapFrameCounter = 0;         // count frames we have been swapping for
        this.isComplete = false;           // bool for whether or not we are done the swap
    }




    /**
     * 
     * This is a helper function for the calling scope of
     * my library to make it easy to start with a random array.
     * 
     * @param count, the number of random numbers desire (length) 
     * @returns an array of random *floating point* numbers
     */

    static generateRandomValues(count) {
        let values = [];
        for (let i = 0; i < count; i++) {
            let randomValue = Math.random() * 100;
            values.push(randomValue);
        }
        return values;
}




    /**
     * 
     * Helper function that draws the number values of the
     * colored lines to the canvas. NOTE: this function will
     * also convert floating point numbers to ints (floor)
     * before printing to the screen, in order to make the numbers
     * readable.
     * 
     * @param array, the numbers to be printed (in order) 
     * @param y value that the numbers should be printed at
     */
    writeNumbers(array, y){
        this.ctx.font = this.TEXT_STYLE;
        this.ctx.fillStyle = this.TEXT_COLOR;
        for(let i = 0; i < array.length; i++){
            this.ctx.fillText(Math.floor(array[i]), (i + 0.66) * this.NODE_SPACING, y);
        }
    }




    
    /**
     * Helper method to create a copy of an array
     * @param array, array to be copied
     * @returns a reference to the new 'copy' array
     */
    copyArray(array) {
        let copy = [];
        for (let i = 0; i < array.length; i++) {
            copy.push(array[i]);
        }
        return copy;
    }




    
    /**
     * Creates a node for each value in the array
     * @param numArray is array of numbers we want to graph
     * @returns nodes, an array of Node objects, all of which will be
     * a ctx line being drawn on the canvas (you can think of them as my 
     * 'pencils' drawing down the screen)
     */
    createNodes(numArray) {
        let nodes = [];
        for (let i = 0; i < numArray.length; i++) {
            let value = numArray[i];
            let xPosition = (i + 1) * this.NODE_SPACING;            // this is the translation formula from index to x coordinate 
                                                                    // (+1 so that we draw inside the canvas)
            let node = new Node(xPosition, this.INITIAL_Y_POSITION, value, this.ctx, 
                this.LINECAP_STYLE, this.LINE_WIDTH, this.COLOR_SATURATION, this.COLOR_LIGHTNESS, this.SPECTRUM);

            nodes.push(node);
        }
        return nodes;
    }





    /**
     * Heper function that finds the index of a value in an array
     * 
     * @param array that we want to find the index from
     * 
     * @param value the value of the node we want to find the index of
     * 
     */
    findValueIndex(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return i;
            }
        }
        return -1;
    }



    
    /**
     * Main animation loop - called every frame
     */
    animate() {
        if (this.isComplete) {
            // Animation is complete - stop requesting new frames
            return;
        }
        
        if (this.isSwapping) {
            // Currently animating a swap - continue the animation
            this.continueSwapAnimation();
        } else {
            this.frameCounter++;
            if (this.frameCounter % this.ANIMATION_SPEED != 0) {
                // Most frames: just draw straight lines moving down
                this.drawStraightLines();
            } else {
                // Every Nth frame: perform a sort step and start swap animation
                this.performSortStep();
            }
        }
        
        let self = this;        // need to make a copy.
        requestAnimationFrame(function() { self.animate(); });
    }
    /**
     * Visualizes the swap operation by setting up animation data for each node
     * 
     * @param newArray is the resulting array we got AFTER performing 
     * one step of the algorithm we wish to illustrate (our end point).
     * 
     */
    visualizeSwap(newArray) {
        for (let i = 0; i < newArray.length; i++) {
            if (this.values[i] != newArray[i]) {
                // Value at position i has changed - find where it came from  >:)
                // Find where newArray[i] is inside the this.values array
                let oldIndex = this.findValueIndex(this.values, newArray[i]);
                let oldX = (oldIndex + 1) * this.NODE_SPACING;
                let newX = (i + 1) * this.NODE_SPACING;
                let oldValue = this.values[oldIndex];
                
                // Set up swap animation data
                this.nodes[i].setupSwapAnimation(oldX, newX, oldValue, this.SWAP_INCREMENT);
                this.nodes[i].value = newArray[i];
            } else {
                // No swap occurred - set up straight line animation
                this.nodes[i].setupStraightAnimation(this.SWAP_INCREMENT);
            }
        }
        this.values = this.copyArray(newArray);
        this.isSwapping = true;
        this.swapFrameCounter = 0;
    }



    
    /**
     * Continues the swap animation for one frame
     */
    continueSwapAnimation() {
        this.swapFrameCounter++;
        let progress = this.swapFrameCounter / this.SWAP_ANIMATION_FRAMES;
        
        if (progress >= 1.0) {
            // Animation complete
            this.isSwapping = false;
            this.swapFrameCounter = 0;
        }
        
        // Draw each node's current swap animation frame
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].drawSwapFrame(progress);
        }
    }




    
    /**
     * Starts the animation loop.
     * Needs to be seperate because the this.animate() 
     * function is recursive
     */
    startAnimation() {
        this.animate();
    }




    
    /**
     * Draws all nodes moving straight down.
     * (the breaks between swaps).
     */
    drawStraightLines() {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].drawIncremental(this.LINE_INCREMENT / this.STRAIGHT_LENGTH);
        }
    }




    
    /**
     * Performs one step of the algorithm using the user-provided step function
     * and visualizes the changes
     */
    performSortStep() {
        // Call user's step function with current array and state
        let result = this.stepFunction(this.values, this.algorithmState);
        
        // Update algorithm state
        this.algorithmState = result.state;
        
        // Check if sorting is complete
        if (result.isComplete) {
            this.isComplete = true;
            this.writeNumbers(this.values, this.nodes[0].y + this.END_TEXT_Y_POS);
            return;
        }
        
        // Check if any values changed
        let hasChanges = false;
        for (let i = 0; i < result.newArray.length; i++) {
            if (result.newArray[i] != this.values[i]) {
                hasChanges = true;
                break;
            }
        }
        
        if (hasChanges == false) {
            // No changes but not complete - continue to next step
            return;
        }
        
        // Visualize the changes
        this.visualizeSwap(result.newArray);
    }
}/**
 * Node class - Represents a single animated line in the visualization
 */




    
class Node {
    // Visual configuration




    
    constructor(xPosition, yPosition, value, canvasContext, 
        cap_style, line_width, saturation, lightness, spectrum) {
        this.x = xPosition;
        this.y = yPosition;
        this.value = parseInt(value);
        this.ctx = canvasContext;
        this.LINECAP_STYLE = cap_style;
        this.LINE_WIDTH = line_width;
        this.COLOR_SATURATION = saturation;
        this.COLOR_LIGHTNESS = lightness;
        this.SPECTRUM = spectrum;
        
        // Animation state for swaps
        this.animationData = null;
    }




    
    /**
     * Calculates HSL color based on node value
     * Values 0-100 map to hue 0-360 (full color spectrum)
     */
    getColor(value) {
        let hue = (value / 100) * this.SPECTRUM;
        return "hsl(" + hue + ", " 
        + this.COLOR_SATURATION + "%, " 
        + this.COLOR_LIGHTNESS + "%)";
    }




    
    /**
     * Draws a straight vertical line segment incrementally (for normal movement)
     */
    drawIncremental(yIncrement) {
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.strokeStyle = this.getColor(this.value);
        this.ctx.lineCap = this.LINECAP_STYLE;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.y = this.y + yIncrement;
        this.ctx.lineTo(this.x, this.y);
        this.ctx.stroke();
    }




    
    /**
     * Sets up animation data for a swap operation
     */
    setupSwapAnimation(oldX, newX, oldValue, yIncrement) {
        this.animationData = {
            type: 'swap',
            oldX: oldX,
            newX: newX,
            oldValue: oldValue,
            startY: this.y,
            yIncrement: yIncrement
        };
    }




    
    /**
     * Sets up animation data for a straight line (no swap)
     */
    setupStraightAnimation(yIncrement) {
        this.animationData = {
            type: 'straight',
            startY: this.y,
            yIncrement: yIncrement
        };
    }




    
    /**
     * Draws a segment of the swap line from start to current progress
     */
    drawSwapSegment(progress) {
        let oldX = this.animationData.oldX;
        let newX = this.animationData.newX;
        let oldValue = this.animationData.oldValue;
        let startY = this.animationData.startY;
        let yIncrement = this.animationData.yIncrement;
        let endY = startY + yIncrement;
        
        // Calculate current position based on progress (linear interpolation)
        let currentX = oldX + (newX - oldX) * progress;
        let currentY = startY + yIncrement * progress;
        
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.strokeStyle = this.getColor(oldValue);
        this.ctx.lineCap = this.LINECAP_STYLE;
        this.ctx.lineJoin = 'round';
        
        // Draw straight line from start to current progress
        this.ctx.beginPath();
        this.ctx.moveTo(oldX, startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
    }




    
    /**
     * Draws a segment of a straight line from lastProgress to current progress
     * @param progress, the change in y value we want to draw
     */
    drawStraightSegment(progress) {
        let startY = this.animationData.startY;
        let yIncrement = this.animationData.yIncrement;
        
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.strokeStyle = this.getColor(this.value);
        this.ctx.lineCap = this.LINECAP_STYLE;
        
        let y1 = startY + yIncrement * progress;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, startY);
        this.ctx.lineTo(this.x, y1);
        this.ctx.stroke();
    }




    
    /**
     * Draws one frame of the current animation based on progress (0 to 1)
     */
    drawSwapFrame(progress) {
        if (this.animationData == null) {
            return;
        }

        if (this.animationData.type == 'swap') {
            this.drawSwapSegment(progress);
        } else {
            this.drawStraightSegment(progress);
        }
        
        // Update position when animation completes
        if (progress >= 1.0) {
            this.y = this.animationData.startY + this.animationData.yIncrement;
            this.animationData = null;
        }
    }
}
