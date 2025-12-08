/**
 * @name shell_sort
 * 
 * @file_name shell_sort.js
 * 
 * @author Isaac Klein
 * @course COMP 2631 - Information Structures
 * @instructor  Mia MacTavish
 * @modified dec 7, 2025
 * 
 * 
 * This script implements the classic Shell Sort algorithm,
 * and animates it using my Rainbow Animate library.
 * 
 */


// Change this to edit how long of an array you wish to animate
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
 * Shell Sort Steps:
 * 1. Starts with a large gap between compared elements (currently GAP_REDUCTION_PER_PASS = 2 )
 * 2. Sorts elements that are 'gap' positions apart
 * 3. Reduces the gap until it becomes 1
 * 4. When gap=1, it becomes a regular insertion sort on a (hopefully) nearly-sorted array
 * 
 * Implementation:
 * The sort algorithm NEEDS to be a function, so that it can be called from the 
 * Rainbow class.
 * 
 * @param currentArray - the current state of the array
 * @param state - object containing algorithm information that needs
 *                continuity between iterations (gapSize, currentIndex, passComplete)
 * @returns object with: 
 *      {
 *      newArray - the array resulting from 1 step of our algorithm
 * 
 *      isComplete - bool indicating whether the sort has finished (ends animation)
 * 
 *      state - an object that can contain whatever information needs to persist
 *              between algorithm iterations- Exclusively used by/for the calling
 *              function, and can be whatever you want.
 *      }
 */
function shellSortStep(currentArray, state) {

    /** Gap reduction factor - each pass reduces gap by this divisor */
    let GAP_REDUCTION_PER_PASS = 2;

    // Initialize state on first call
    if (state.gapSize == undefined) {
        // Start with gap = half the array length (standard shell sort)
        state.gapSize = Math.floor(currentArray.length / GAP_REDUCTION_PER_PASS);
        state.currentIndex = state.gapSize; // Start comparing from the first gap position
        state.passComplete = false; // Track if we've completed a full pass at current gap
        state.passHadChanges = false; // Track if current pass made any changes
    }
    
    // Create a copy of the current array to work with
    let newArray = [];
    for (let i = 0; i < currentArray.length; i = i + 1) {
        newArray.push(currentArray[i]);
    }
    
    // Perform one comparison/swap operation at the current gap size
    // This implements insertion sort for gap-separated elements
    if (state.currentIndex < currentArray.length) {
        // Compare element at currentIndex with elements 'gap' positions before it
        let temp = newArray[state.currentIndex];
        let j = state.currentIndex;
        
        // Shift elements that are greater than temp, moving backwards by gap
        while (j >= state.gapSize && newArray[j - state.gapSize] > temp) {
            newArray[j] = newArray[j - state.gapSize]; // Shift element forward
            j -=  state.gapSize; // Move backwards by gap positions
        }
        
        // Insert temp at its correct position within the gap-separated subsequence
        newArray[j] = temp;
        
        // Track if this step made any changes
        if (j != state.currentIndex) {
            state.passHadChanges = true;
        }
        
        // Move to next element for comparison
        state.currentIndex = state.currentIndex + 1;
        
        // Check if we've completed a full pass at this gap size
        if (state.currentIndex >= currentArray.length) {
            state.passComplete = true;
        }
    }
    
    // Check if sorting is complete (only check when a pass completes)
    let isComplete = false;
    if (state.passComplete && state.gapSize == 1 && !state.passHadChanges) {
        // We're done: completed a full pass at gap=1 with no changes
        isComplete = true;
    }
    
    // If we completed a pass, reduce gap and start new pass
    if (state.passComplete) {
        state.gapSize = Math.floor(state.gapSize / GAP_REDUCTION_PER_PASS);
        
        // Ensure gap doesn't go below 1
        if (state.gapSize < 1) {
            state.gapSize = 1;
        }
        
        // Reset for next pass
        state.currentIndex = state.gapSize;
        state.passComplete = false;
        state.passHadChanges = false; // Reset change tracker for new pass
    }
    
    return { newArray: newArray, isComplete: isComplete, state: state };
}