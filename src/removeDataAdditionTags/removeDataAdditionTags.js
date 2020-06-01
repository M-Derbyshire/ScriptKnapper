import findObjectStringLength from '../findObjectStringLength/findObjectStringLength';

/*
    Inputs:
        - The string to remove the data addition tags from
            
    Output:
        - If there is an error, the function will return an array. The first index will be true,
            to say there has been an error, and the second will be the error text.
        - If there is not an error, the function will return an array. The first index will be false,
            to say there hasn't been an error, and the second will be a string of text, with the
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
            return [true, errPreText + "Data addition tag was not properly closed."];
        }
        
        templateString = templateString.substring(0, braceIndex) + templateString.substring(braceIndex + objectLength);
    }
    
    return [false, templateString];
}

export default removeDataAdditionTags;