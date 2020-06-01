/*
    Inputs:
        - objectText: The string of text that will contain the 
                    object. This string should begin with the 
                    opening brace.
        - startBraceString: The string that represents an opening brace.
        - endBraceString: The string that represents a closing brace.
    Output:
        - This function will return the length of the substring
            that makes up this object (including the braces).
        - If the object in the string is not complete, the string
            doesn't start with the opening brace, or the string
            doesn't contain an object at all, this function will 
            return -1.
*/

function findObjectStringLength(objectText, startBraceString = "{", endBraceString = "}")
{
    if(!objectText.startsWith(startBraceString)) return -1;
    
    
    let layer = 0; // There may be objects within the object (such as inner-template calls), 
                    //so what "layer" are we on?
    let i = 0; // We want to use this later when returning
    
    while(i < objectText.length)
    {
        if(objectText.substr(i, startBraceString.length) == startBraceString)
        {
            layer++;
        }
        else if (objectText.substr(i, endBraceString.length) == endBraceString)
        {
            layer--;
            
            if(layer === 0)
            {
                return i + endBraceString.length; // This is now the length to return
            }
        }
        
        i++;
    }
    
    return -1; //If we are here, the object has no closing brace
}

export default findObjectStringLength;