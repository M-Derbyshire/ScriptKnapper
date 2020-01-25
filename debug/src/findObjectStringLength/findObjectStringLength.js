import isCharacterEscaped from '../isCharacterEscaped/isCharacterEscaped';

/*
    Inputs:
        - objectText: The string of text that will contain the 
                    object. This string should begin with the 
                    opening brace. The opening brace will have
                    already been checked to make sure it isn't
                    escaped, however any other opening brace
                    within the object will be checked here.
            
    Output:
        - This function will return the length of the substring
            that makes up this object (including the handlebar 
            braces).
        - If the object in the string is not complete, or it
            doesn't contain an object, this function will 
            return -1.
*/

function findObjectStringLength(objectText)
{
    if(objectText.length < 2 || objectText.charAt(0) !== "{")
    {
        return -1;
    }
    
    
    let layer = 0; // There may be objects in the object, so
                    // what "layer" are we on?
    let currentChar = "";
    let i = 0; // We want to use this later when returning
    while(i < objectText.length)
    {
        currentChar = objectText.charAt(i);
        
        if(currentChar == "{" && !isCharacterEscaped(objectText.substring(0, i + 1)))
        {
            layer++;
        }
        else if (currentChar == "}" && !isCharacterEscaped(objectText.substring(0, i + 1)))
        {
            layer--;
        }
        
        i++; //In the last iteration of the loop, this will become the length to return.
    }
    
    return (layer > 0) ? -1 : i;
}

export default findObjectStringLength;