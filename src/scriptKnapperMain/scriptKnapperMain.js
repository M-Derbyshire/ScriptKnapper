import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import replaceSubstrings from './../replaceSubstrings/replaceSubstrings';
import resolveAllMarkupObjects from '../resolveAllMarkupObjects/resolveAllMarkupObjects';

/*
    Inputs:
        - markupObjectsJSON: This is the JSON with the data to be
                    entered into the template.
        - templateObjectsJSON: This is the JSON with the different
                    templates.
            
    Output:
        - This function will return an array with 2 values,
            to be destructured by the caller.
        - The first value will be a boolean, which is true
            if there was an error, or otherwise false. 
        - The second value will be a string. This will be
            the generated code/script, or an error if 
            there was a problem during the process.
*/
function scriptKnapperMain(markupObjectsJSON, templateObjectsJSON)
{
    let resultText = "";
    let errPreText; //The first part of the string to feed into prepareErrorMessage()
    
    // Try to parse the JSON data into objects, and make sure everything is correct
    let markupObjects, templateObjects;
    try
    {
        errPreText = "111 Encountered a problem parsing the provided template JSON: ";
        templateObjects = JSON.parse(templateObjectsJSON);
        
        errPreText = "Encountered a problem parsing the provided markup JSON: ";
        markupObjects = JSON.parse(markupObjectsJSON);
        
        //Go through the markup objects (and every data object within them).
        //Each markup object contains a template name, and an array of data objects
        //(which are the data to feed into the templates). Each data object is actually
        //another call to the template, so multiple data objects generate the template
        //multiple times.
        let [resolveMarkupIsError, resolveMarkupText] = resolveAllMarkupObjects(markupObjects, templateObjects);
        if(resolveMarkupIsError) return [true, resolveMarkupText];
        
        resultText = resolveMarkupText;
    }
    catch(err)
    {
        return [
            true,
            prepareErrorMessage(
                errPreText + err, 
                "No template name is available for this error.", 
                "No data JSON is available for this error."
            )
        ];
    }
    
    
    
    //Now, finally, change any tag string replacements in the template into the correct tag string.
    resultText = replaceSubstrings(resultText, [
        { from: "@ohb:", to: "{:" },
        { from: "@chb:", to: ":}" },
        { from: "@odhb:", to: "{{:" },
        { from: "@cdhb:", to: ":}}" },
        { from: "@ohb+", to: "{+" },
        { from: "@chb+", to: "+}" },
    ]);
    
    
    return [false, resultText];
}

export default scriptKnapperMain;