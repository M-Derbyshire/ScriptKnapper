/*
    Inputs:
        - objectText: The string of text that will contain the 
                    object. This string should begin with the 
                    opening brace.
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
        
        if(currentChar == "{")
        {
            layer++;
        }
        else if (currentChar == "}")
        {
            layer--;
            
            if(layer === 0)
            {
                return i + 1; // This is now the length to return
            }
        }
        
        i++;
    }
    
    return -1; //If we are here, then layer must be greater than 0
}

export default findObjectStringLength;