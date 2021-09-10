import findObjectStringLength from '../findObjectStringLength/findObjectStringLength';

/*
    Inputs:
        - The string to remove the data addition tags from
            
    Output:
        - If there is an error, the function will throw
        - This function will return a string of text, with the
            addition tags removed
*/

function removeDataAdditionTags(templateString)
{
    let errPreText = "ScriptKnapper encountered an issue when attempting to add data from a template to the data object: ";
    let braceIndex; //Index of the opening brace of the first found addition tag
    let objectLength; //The length of the substring that makes up this object
    
    while (templateString.includes("{+"))
    {
        braceIndex = templateString.indexOf("{+");
        
        objectLength = findObjectStringLength(
            templateString.substring(braceIndex, templateString.length),
            "{+",
            "+}"
        );
        if(objectLength < 0) //-1 means an error
        {
            throw new Error(errPreText + "Data addition tag was not properly closed.");
        }
        
        templateString = templateString.substring(0, braceIndex) + templateString.substring(braceIndex + objectLength);
    }
    
    return templateString;
}

export default removeDataAdditionTags;