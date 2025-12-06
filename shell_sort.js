
// Uses my Rainbow_animate library to animate the 'Shell Sort'
// algorithm.

// Configuration
let ARRAY_SIZE = 40;

// Initialize and start animation
let values = Rainbow.generateRandomValues(ARRAY_SIZE);
let animation = new Rainbow(values, shellSortStep);
animation.startAnimation();




/**
 * Shell Sort step function. 
 * Performs 1 step of the shell sort algorithm and returns
 * the resulting array (with a bit of extra information).
 * 
 * The sort algorithm NEEDS to be a function, so that it can be called from the 
 * Rainbow class.
 * 
 * @param currentArray - the current state of the array
 * @param state - object containing algorithm any information that needs
 * continuity between iterations (gapSize in shell sorts case)
 * @returns object with: 
 * 
 *      newArray - the array resulting from 1 step of our algorithm
 * 
 *      isComplete, - bool indicating whether the sort has finished (ends animation)
 * 
 *      state - an object that can contain whatever information needs to persist
 *              between algorithm iterations- Exclusively used by/for the calling
 *              function, and can be whatever you want.
 */
function shellSortStep(currentArray, state) {

    /** The next gap size /= GAP_REDUCTION_PER_STEP */
    let GAP_REDUCTION_PER_STEP = 1.2;

    // Initialize gap size on first call
    if (state.gapSize == undefined) {
        state.gapSize = Math.floor(currentArray.length / 2);
    }
    
    // Ensure minimum gap size of 1
    if (state.gapSize < 1) {
        state.gapSize = 1;
    }
    
    // Perform one pass with current gap size
    let newArray = [];
    for (let i = 0; i < currentArray.length; i = i + 1) {
        newArray.push(currentArray[i]);
    }
    
    let hasChanges = false;
    for (let i = 0; i + state.gapSize < currentArray.length; i = i + 1) {
        if (newArray[i] > newArray[i + state.gapSize]) {
            // Swap elements
            let temp = newArray[i];
            newArray[i] = newArray[i + state.gapSize];
            newArray[i + state.gapSize] = temp;
            hasChanges = true;
        }
    }
    
    // If no changes occurred, sorting is complete
    let isComplete = !hasChanges;
    
    // Reduce gap size for next iteration
    if (hasChanges) {
        state.gapSize = Math.floor(state.gapSize / GAP_REDUCTION_PER_STEP);
    }
    
    return { newArray: newArray, isComplete: isComplete, state: state };
}