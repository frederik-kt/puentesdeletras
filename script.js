fs = require('fs');

const frase = "naturallanguagetestactionsconstrainfeatureautomation";
//const frase = "littletestxyz";
console.log("trying to solve for a " + frase.length + " letter sentence...");

const emptyChar = " "

// horizontal connection - = 1
// vertical connection | = 2
// connection / = 3
// connection \ = 4

function sleep(ms) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms) {
            break;
        }
    }
}

const countDifferentLetters = letters => {
    let letterArray = new Array();
    for (let i = 0; i < letters.length; i++) {
        if (!letterArray.includes(letters[i])) {
            letterArray.push(letters[i]);
        }
    }
    for (let i = 0; i < letterArray.length; i++) {
        letterArray[i] = new Array([letterArray[i], 0]);
    }
    return letterArray;
}

const findLetterInArray = (letter, letterArray) => {
    let index = 0;
    while (letterArray[index][0][0] != letter) {
        index++;
    }
    return index;
}

const findField = (fieldArray, currentRow, currentCol, originRow, originCol) => {
    let scoreArray = new Array(fieldArray.length);
    for (let index = 0; index < fieldArray.length; index++) {
        let score = 0;
        const fieldRow = fieldArray[index][0][0];
        const fieldCol = fieldArray[index][0][1];
        if ((fieldRow > currentRow && fieldRow <= originRow) || (fieldRow < currentRow && fieldRow >= originRow)) {
            score++;
        }
        if ((fieldCol > currentCol && fieldCol <= originCol) || (fieldCol < currentCol && fieldCol >= originCol)) {
            score++;
        }
        scoreArray[index] = score;
    }
    // randomly choose one of the fields with a highest score
    const indexOfFirstMaxValue = scoreArray.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    let indicesOfMaxValue = [];
    let i = -1;
    while ((i = scoreArray.indexOf(scoreArray[indexOfFirstMaxValue], i+1)) != -1) {
        indicesOfMaxValue.push(i);
    }
    const chosenIndexOfMaxValue = indicesOfMaxValue[Math.floor(Math.random()*indicesOfMaxValue.length)];

    return fieldArray[chosenIndexOfMaxValue];
}

const drawGrid = mat => {
    const rows = mat.length;
    let gridString = "";
    for (let row = 0; row < rows; row++) {
        // 1 = -  2 = |   3 = /    4 = \
        let col = ""
        mat[row].forEach(entry => {
            switch (entry) {
                case 1:
                    col += "--";
                    break;
                case 2:
                    col += "|";
                    break;
                case 3:
                    col += "/";
                    break;
                case 4:
                    col += "\\";
                    break;
                default:
                    col += entry;
                    break;
            }
            col += "\t";
        });
        gridString += col + "\n";
    }
    return gridString;
}

// function must only be used after you made sure the points are actually part of the matrix
// row1 and col1 are refering to the "original" cell from where the connection starts
const checkConnection = (mat, row1, col1, row2, col2) => {
    // return 0 for "fields are too far apart for a connection"
    if (Math.abs(row1-row2)>2 || Math.abs(col1-col2)>2) {
        return 0;
    }

    // in case of a double letter return 4
    if (row1 === row2 && col1 === col2) {
        return 4;
    } else {
        // field that must be checked for connection
        let rowConn = 0;
        let colConn = 0;
        if (row1 === row2) {
            rowConn = row1;
        } else if (row1 === (row2-2)) {
            rowConn = row2-1;
        } else if (row1 === (row2+2)) {
            rowConn = row2+1;
        } else {
            return console.error("rows in checkConnection don't fit");
        }

        if (col1 === col2) {
            colConn = col1;
        } else if (col1 === (col2-2)) {
            colConn = col2-1;
        } else if (col1 === (col2+2)) {
            colConn = col2+1;
        } else {
            return console.error("columns in checkConnection don't fit");
        }

        // one more sanity check
        if (mat[rowConn] && mat[rowConn][colConn]) {
            if (mat[rowConn][colConn] === emptyChar) {
                // return 3 for "no connection yet"
                return 3;
            } else {
                // connection exists, now check whether it is in the correct direction in respect to row1/col1
                if (rowConn === row1 && mat[rowConn][colConn] === 1) {
                    // connection is in same row and horizontal connection exists
                    // return 1 for "connection exists"
                    return 1;
                } else if (colConn === col1 && mat[rowConn][colConn] === 2) {
                    // connection is in same column and vertical connection exists
                    // return 1 for "connection exists"
                    return 1;
                } else if (((rowConn > row1 && colConn < col1) || (rowConn < row1 && colConn > col1)) && mat[rowConn][colConn] === 3) {
                    // / connection exists
                    return 1;
                } else if (((rowConn > row1 && colConn > col1) || (rowConn < row1 && colConn < col1)) && mat[rowConn][colConn] === 4) {
                    // \ connection exists
                    return 1;
                } else {
                    // return 2 for "wrong connection exists"
                    return 2;
                }
            }
        } else {
            console.error("error in checkConnection")
        }
    }
}

const createConnection = (mat, row1, col1, row2, col2) => {
    // return error for "fields are too far apart for a connection"
    if (Math.abs(row1-row2)>2 || Math.abs(col1-col2)>2) {
        return console.error("fields too far apart");
    }

    // in case of a double letter don't create anything
    if (row1 === row2 && col1 === col2) {
        return;
    } else {
        // field that will receive a new connection
        let rowConn = 0;
        let colConn = 0;
        if (row1 === row2) {
            rowConn = row1;
        } else if (row1 === (row2-2)) {
            rowConn = row2-1;
        } else if (row1 === (row2+2)) {
            rowConn = row2+1;
        } else {
            return console.error("rows in createConnection don't fit");
        }

        if (col1 === col2) {
            colConn = col1;
        } else if (col1 === (col2-2)) {
            colConn = col2-1;
        } else if (col1 === (col2+2)) {
            colConn = col2+1;
        } else {
            return console.error("columns in createConnection don't fit");
        }

        // one more sanity check
        if (mat[rowConn] && mat[rowConn][colConn]) {
                // connection exists, now check whether it is in the correct direction in respect to row1/col1
            if (rowConn === row1) {
                // connection is in same row
                mat[rowConn][colConn] = 1;
                return;
            } else if (colConn === col1) {
                // connection is in same column
                mat[rowConn][colConn] = 2;
                return;
            } else if ((rowConn > row1 && colConn < col1) || (rowConn < row1 && colConn > col1)) {
                // / connection created
                mat[rowConn][colConn] = 3;
                return;
            } else if ((rowConn > row1 && colConn > col1) || (rowConn < row1 && colConn < col1)) {
                // \ connection created
                mat[rowConn][colConn] = 4;
                return;
            } else {
                // return error for "wrong connection exists"
                console.error("you are trying to create a new connection at a point that already has another connection")
            }
        } else {
            console.error("error in createConnection")
        }
    }
}

// e.g. 0->0; 1->2; 2->4 row-index of 1 goes to position 2 in the grid as there are connections inbetween
const gridIndexToMatrixPosition = index => {
    return index*2;
}

// determine size of grid
let letterArray = countDifferentLetters(frase);
const noDifferentLetters = letterArray.length;
const maxFields = (noDifferentLetters*2)+2 // Each letter can appear 2 times + 2 letters that appear 3 times
let gridHeight = 1;
let gridWidth = 1;

while (gridHeight*gridWidth < maxFields) {
    if (gridHeight === gridWidth) {
        gridWidth++;
    } else {
        gridHeight++;
    }
}

// add one more line and column to check if that facilitates finding a solution
gridWidth = gridWidth + 3;
gridHeight = gridHeight + 3;

let grid = new Array(gridHeight + (gridHeight-1)); // # of rows + puentes inbetween
for (let i = 0; i < grid.length; i++) {
    grid[i] = new Array(gridWidth + (gridWidth-1)); // each row gets gridWidth fields + gridWidth-1 connections
}

let solutionFound = false;
let maxStringIndex = 0;
let iteration = 0;
while (!solutionFound) {
    iteration++;
    if (iteration%100000 === 0) {
        console.log(iteration);
    }

    // reset counting of letters placed
    letterArray.forEach(letter => {
        letter[0][1] = 0;
    });

    // first letter is placed randomly
    const startRowMin = gridHeight / 4;
    const startRowMax = gridHeight / 2 + startRowMin;
    const startRow = Math.floor(Math.random() * (startRowMax - startRowMin + 1) + startRowMin);
    const startRowMatrix = gridIndexToMatrixPosition(startRow);
    const startColMin = gridWidth / 4;
    const startColMax = gridWidth / 2 + startColMin;
    const startCol = Math.floor(Math.random() * (startColMax - startColMin + 1) + startColMin);
    const startColMatrix = gridIndexToMatrixPosition(startCol);

    let stringIndex = 0;
    
    grid[startRowMatrix][startColMatrix] = frase[stringIndex];
    // update letterArray
    let letterIndexInLetterArray = findLetterInArray(frase[stringIndex], letterArray);
    letterArray[letterIndexInLetterArray][0][1] = letterArray[letterIndexInLetterArray][0][1] + 1;

    // fill all other fields with emptyChar
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            if (!(row === startRowMatrix && col === startColMatrix)) {
                grid[row][col] = emptyChar;
            }
        }
    }

    let currentRow = startRow;
    let currentRowMatrix = gridIndexToMatrixPosition(currentRow);
    let currentCol = startCol;
    let currentColMatrix = gridIndexToMatrixPosition(currentCol);
    

    for (stringIndex = 1; stringIndex < frase.length+1; stringIndex++) {

        // check if we reached the end of frase, in that case we found a solution
        if (stringIndex === frase.length) {
            solutionFound = true;

            let outputString = "Solution found in iteration " + iteration + "\n";
            outputString += "Startposition: " + startRowMatrix + ";" + startColMatrix + "\n";
            outputString += "reached letter " + stringIndex + " of " + frase.length + "\n";
            outputString += frase.substring(0, stringIndex) + "\n";
            outputString += drawGrid(grid);
            console.log(outputString);
            fs.writeFileSync('bestGrids.txt', outputString, function (err) {
                if (err) return console.log(err);
            });

            break;
        } 

        const currentLetter = frase[stringIndex];
        let emptyNeighborFields = new Array();
        let letterFoundFields = new Array();
    
        // list of neighbouring fields with contents
        for (let row = currentRow-1; row <= currentRow+1; row++) {
            for (let col = currentCol-1; col <= currentCol+1; col++) {
                const rowInMatrix = gridIndexToMatrixPosition(row);
                const colInMatrix = gridIndexToMatrixPosition(col);
                // only go on if a value exists for that field (not out of bounds)
                if (grid[rowInMatrix] && grid[rowInMatrix][colInMatrix]) {
                    const letterFound = grid[rowInMatrix][colInMatrix];
                    if (letterFound === currentLetter) {
                        const connectionCheck = checkConnection(grid, currentRowMatrix, currentColMatrix, rowInMatrix, colInMatrix);
                        // check if there is already a connection inbetween those fields or an empty field
                        if (connectionCheck === 1 || connectionCheck === 3 || connectionCheck === 4) {
                            letterFoundFields.push(new Array([row, col]));
                        }
                        // else there is a wrong connection and we do nothing with that field
                    } else if (letterFound === emptyChar) {
                        // check if there is already some connection blocking the creation of a new connection to that neighbouring field
                        // do not have to check whether it is the correct connection because there will never be connections created that have an empty field on one side
                        const connectionCheck = checkConnection(grid, currentRowMatrix, currentColMatrix, rowInMatrix, colInMatrix);
                        if (!(connectionCheck === 2)) {
                            // finally check whether that letter was alredy used 2 times (3 times exception), in that case we cannot add another one and cannot use that field
                            letterIndexInLetterArray = findLetterInArray(currentLetter, letterArray);
                            let noOfThreesInLetterArray = 0;
                            letterArray.forEach(letter => {
                                if (letter[0][1] === 3) {
                                    noOfThreesInLetterArray++;
                                }
                            });
                            if (!(letterArray[letterIndexInLetterArray][0][1] > 1) || (letterArray[letterIndexInLetterArray][0][1] === 2 && noOfThreesInLetterArray < 2)) {
                                emptyNeighborFields.push(new Array([row, col]));
                            }
                        }
                        
                    }
                }
            }
        }

        // letterFoundFields and emptyNeighborFields are now filled

        // if we found that letter already we will use that field and not fill up a new field
        if (letterFoundFields.length > 0) {
            // choose random entry
            //const newField = letterFoundFields[Math.floor(Math.random() * letterFoundFields.length)];

            //choose the field that goes into the direction of start
            const newField = findField(letterFoundFields, currentRow, currentCol, startRow, startCol);

            // write connection into grid
            createConnection(grid, currentRowMatrix, currentColMatrix, gridIndexToMatrixPosition(newField[0][0]), gridIndexToMatrixPosition(newField[0][1]));

            // update currentField
            currentRow = newField[0][0];
            currentRowMatrix = gridIndexToMatrixPosition(currentRow);
            currentCol = newField[0][1];
            currentColMatrix = gridIndexToMatrixPosition(currentCol);

        } else if (emptyNeighborFields.length > 0) {
            // choose random entry
            //const newField = emptyNeighborFields[Math.floor(Math.random() * emptyNeighborFields.length)];

            //choose the field that goes into the direction of start
            const newField = findField(emptyNeighborFields, currentRow, currentCol, startRow, startCol);

            // write connection into grid
            createConnection(grid, currentRowMatrix, currentColMatrix, gridIndexToMatrixPosition(newField[0][0]), gridIndexToMatrixPosition(newField[0][1]));

            // update currentField
            currentRow = newField[0][0];
            currentRowMatrix = gridIndexToMatrixPosition(currentRow);
            currentCol = newField[0][1];
            currentColMatrix = gridIndexToMatrixPosition(currentCol);
            grid[currentRowMatrix][currentColMatrix] = currentLetter;

            // update letterArray
            letterIndexInLetterArray = findLetterInArray(currentLetter, letterArray);
            letterArray[letterIndexInLetterArray][0][1] = letterArray[letterIndexInLetterArray][0][1] + 1;
        } else {
            // no where left to go, break the for-loop and start in while again with a new start position

            // update maxStringIndex
            if (stringIndex > maxStringIndex) {
                maxStringIndex = stringIndex;

                // new maxStringIndex reached, let's actually save the grid we found here
                if (stringIndex > frase.length-6) {
                    let outputString = "Good aproximation found in iteration " + iteration + "\n";
                    outputString += "Startposition: " + startRowMatrix + ";" + startColMatrix + "\n";
                    outputString += "reached stringIndex " + stringIndex + " of " + frase.length + "\n";
                    outputString += frase.substring(0, stringIndex) + "\n";
                    outputString += drawGrid(grid);
                    console.log(outputString);
                    fs.writeFileSync('bestGrids.txt', outputString, function (err) {
                        if (err) return console.log(err);
                    });
                }
            }

            
            
            break;
        }
    }
}



