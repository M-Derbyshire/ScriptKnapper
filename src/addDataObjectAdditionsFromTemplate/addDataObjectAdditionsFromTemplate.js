import mergeObjects from '../mergeObjects/mergeObjects';
import findObjectStringLength from '../findObjectStringLength/findObjectStringLength';

/*
    Inputs:
        - The current data object, as a single object.
        - The current template, as a string.
            
    Output:
        - If there is an error, the function will return an array. The first index will be true,
            to say there has been an error, and the second will be the error text.
        - If there is not an error, the function will return an array. The first index will be false,
            to say there hasn't been an error, and the second will be the new version of the data 
            object, with the added properties.
*/

function addDataObjectAdditionsFromTemplate(dataObject, template)
{
     //The first part of the string to feed into prepareErrorMessage()
    let errPreText= "ScriptKnapper encountered an issue when attempting to add data from a template to the data object: ";
    let braceIndex; //The index of the first brace in the substring that is being searched for braces
    
    //Will be cut down (from the front onwards) to avoid re-adding already added data
    let currentlyUnsearchedString = template;
    
    while (currentlyUnsearchedString.includes("{+"))
    {
        braceIndex = currentlyUnsearchedString.indexOf("{+");
        
        let objectLength = findObjectStringLength(
            currentlyUnsearchedString.substring(braceIndex, currentlyUnsearchedString.length),
            "{+",
            "+}"
        );
        if(objectLength < 0) //-1 means an error
        {
            return [true, errPreText + "Data addition tag was not properly closed."];
        }
        
        
        
        //Now try to turn the tag's contents into a parsable object
        let newData;
        try
        {
            //The current tag has the '+' characters, so don't include them
            newData = JSON.parse("{" + currentlyUnsearchedString.substring(braceIndex + 2, braceIndex + objectLength - 2) + "}");
        }
        catch(err)
        {
            return [true, errPreText + err];
        }
        
        
        //Now just add the data to the data object (the new values are priority if that property already exists)
        dataObject = mergeObjects([newData, dataObject]);
        
        
        //Finally, cut down the string so we don't try to re-add this tag.
        currentlyUnsearchedString = currentlyUnsearchedString.substring(braceIndex + objectLength, currentlyUnsearchedString.length);
    }
    
    return [false, dataObject];
}

export default addDataObjectAdditionsFromTemplate;