/*
    Inputs:
        - fullText: The string of text that holds the substring
                    that will be replaced.
        - newTextSegment: The text that will be inserted into the
                    string.
        - startIndex: The starting index of the substring that was
                    being searched through.
        - braceIndex: The index (in the substring, not the full 
                    string) of the opening brace.
    Output:
        - This function will return an array for the caller to
            destructure.
        - The first element in the array is the new resultText,
            with the replacement made.
        - The second element is the new start index (which is
            the index after the inserted text)
*/

function replaceObjectByIndex(fullText, newTextSegment, startIndex, braceIndex, objectLength)
{
    let realBraceIndex = startIndex + braceIndex;
    let resultText = fullText.substring(0, realBraceIndex) + newTextSegment + fullText.substring(realBraceIndex + objectLength);
    startIndex = realBraceIndex + newTextSegment.length; 
    return [
        resultText,
        startIndex
    ];
}

export default replaceObjectByIndex;