/*
    Inputs:
        - text: The string that will be checked for an escaped character
            The character will be the last character in the string.
            
    Output:
        - This function will return a boolean.
        - The boolean will be true if the last character of the provided
            string is escaped.
        - Otherwise, the boolean will be false.
*/

function isCharacterEscaped(text)
{
    let escaped = false;
    
    for(let i = text.length - 2; i >= 0; i--)
    {
        if(text.charAt(i) == "\\")
        {
            escaped = !escaped;
        }
        else
        {
            break;
        }
    }
    
    return escaped;
}

export default isCharacterEscaped;