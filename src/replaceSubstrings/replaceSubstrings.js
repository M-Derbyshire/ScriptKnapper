/*
    Inputs:
        - text: The string that needs characters/substrings
            replacing.
        - replacements: An array of objects that define
            what needs to be replaced, and what to replace 
            them with. Each object will have a "from" property
            (the substring to search for) and a "to" property
            (the substring to replace the "from" with).
            
    Output:
        - This function will return a string.
        - The string will be the contents of
            the "text" parameter, except with
            the requested replacements made.
*/

function replaceSubstrings(text, replacements)
{
    //Using RegEx means all matches are changed, and can be case-insensitive.
    let fromRegEx;
    
    // This seems to be a collection, so .foreach just won't work.
    for(let i = 0; i < replacements.length; i++)
    {
        //We need to replace any regex special characters with escaped versions
        const specialCharsEscaped = replacements[i].from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        fromRegEx = new RegExp(specialCharsEscaped, 'gi');
        text = text.replace(fromRegEx, replacements[i].to);
    }
    
    return text;
}

export default replaceSubstrings;