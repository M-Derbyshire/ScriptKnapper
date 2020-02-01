import populateTemplate from './../populateTemplate/populateTemplate';
import mergeObjects from './../mergeObjects/mergeObjects';
import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import replaceSubstrings from './../replaceSubstrings/replaceSubstrings';
import findObjectStringLength from './../findObjectStringLength/findObjectStringLength';

/*
    Inputs:
        - markupObjectsJSON: This is the JSON with the data to be
                    entered into the template.
        - templateObjectJSON: This is the JSON which is used when
                    generating errors.
            
    Output:
        - This function will return an array with 2 values,
            to be destructured by the caller.
        - The first value will be a boolean, which is true
            if there was an error, or otherwise false. 
        - The second value will be a string. This will be
            the result code after it has been generated, 
            or an error if there was a problem during the
            process.
*/
function scriptKnapperMain(markupObjectsJSON, templateObjectsJSON)
{
    let resultIsError = false;
    let resultText = "";
    
    
    
    
    return [resultIsError, resultText];
}

export default scriptKnapperMain;










function codeToBeUsedMaybe()
{
    //------------- Is this a double brace? If so, we need to parse to an object and pass that ---------
    //------------- to the dataHandlerFunc.

    if((resultText.length - 1 > braceIndex) && (resultText.charAt(braceIndex + 1) === "{"))
    {
        errPreText = "ScriptKnapper encountered an issue when attempting to resolve a template call within another template: ";
        
        objectLength = findObjectStringLength(resultText.substring(braceIndex));
        if(objectLength === -1)
        {
            throw "Encountered an incomplete or incorrectly shaped object.";
        }
        
        //The object is within a second pair of braces, so we don't want to include those.
        let innerDataObject = JSON.parse([resultText.substr(braceIndex + 1, objectLength - 2)]);
        
        //We want to pass any data in this template down so the inner template can access it.
        //But, if the data for the inner template already contains a property with the same name as a
        //property in the current template's data, then leave the inner template's data intact -- don't 
        //replace it.
        let mergedDataObject = [];
        for(let i = 0; i < innerDataObject.data.length; i++)
        {
            mergedDataObject[i] = mergeObjects([innerDataObject.data[i], dataObject]);
        }
        
        [innerResultError, newTextSegment] = dataHandlerFunc([
            {
                template: innerDataObject.template,
                data: mergedDataObject
            }
        ], templateObjects, true);
        
        if(innerResultError)
        {
            throw newTextSegment; //This will contain the error here.
        }
    }
    // ---------------------------------------------------------------------------------



    //Now, change any @ohb and @chd in the template into single braces
    if(!resultIsError)
    {
        resultText = replaceSubstrings(resultText, [
            { from: "@ohb", to: "{" },
            { from: "@chb", to: "}" }
        ]);
    }


    // ----------------------------------------------------------------------------------

    // Firstly, get the template object, or deal with the templateName being incorrect
    let templatesMatchingName = templateObjects.filter(template => (template.name === templateName));
    if(templatesMatchingName.length === 0)
    {
        return [
            true,
            prepareErrorMessage(
                    "The given template name (" + templateName + ") is not recognised."
                )
        ];
    }
    else if (templatesMatchingName.length > 1)
    {
        return [
            true,
            prepareErrorMessage(
                    "The given template name (" + templateName + ") has more than one match."
                )
        ];
    }

    // --------------------------------------------------------------------------------------



}