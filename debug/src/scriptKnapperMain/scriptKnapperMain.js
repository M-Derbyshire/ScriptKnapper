import populateTemplate from './../populateTemplate/populateTemplate';
import mergeObjects from './../mergeObjects/mergeObjects';
import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import replaceSubstrings from './../replaceSubstrings/replaceSubstrings';
import findObjectStringLength from './../findObjectStringLength/findObjectStringLength';
import checkForMarkupObjectError from './../checkForMarkupObjectError/checkForMarkupObjectError';

/*
    Inputs:
        - markupObjectsJSON: This is the JSON with the data to be
                    entered into the template.
        - templateObjectsJSON: This is the JSON which is used when
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
    let errPreText; //The first part of the string to feed into prepareErrorMessage()
    let errTemplateName = ""; //The current template name to feed into prepareErrorMessage()
    let errDataJSON = ""; // the current data object, in string form, to feed into prepareErrorMessage()
    
    // Try to parse the JSON data into objects, and make sure everything is correct
    let markupObjects, templateObjects;
    try
    {
        errPreText = "Encountered a problem parsing the provided template JSON: ";
        templateObjects = JSON.parse(templateObjectsJSON);
        
        errPreText = "Encountered a problem parsing the provided markup JSON: ";
        markupObjects = JSON.parse(markupObjectsJSON);
        
        
        //Start looping through the markup objects (and every data object with them)
        for(let markupIter = 0; markupIter < markupObjects.length; markupIter++)
        {
            // If there is an issue with this markup object, return the error
            let [markupHasError, markupCheckText] = checkForMarkupObjectError(markupObjects[markupIter], templateObjects);
            if(markupHasError)
            {
                return [
                    true,
                    markupCheckText
                ];
            }
            
            
            //Populate the template with the provided data, and add to the result
            //(for every passed data object).
            let templateObject = templateObjects.filter(template => (template.name === templateName))[0];
            errTemplateName = templateObject.name;
            
            for(let dataIter = 0; dataIter < markupObjects[markupIter].data.length; dataIter++)
            {
                errDataJSON = JSON.stringify([markupObjects[markupIter].data[dataIter]]);
                
                //Populate the template with the data values
                let [thisIterationResultIsError, thisIterationResultText] = populateTemplate(
                    markupObjects[markupIter].data[dataIter],
                    templateObject.name,
                    templateObject.template
                );
                
                if(thisIterationResultIsError)
                {
                    return [
                        true,
                        thisIterationResultText
                    ];
                }
                
                //Now we need to check if there's any embedded template calls,
                //and resolve them.
                let braceIndex;
                let objectLength;
                while(braceIndex = thisIterationResultText.indexOf("{{") > -1)
                {
                    errPreText = "Encountered a problem parsing call to embedded template: ";
                    
                    objectLength = findObjectStringLength(thisIterationResultText.substring(braceIndex));
                    if(objectLength === -1)
                    {
                        throw "Embedded template object is invalid or incomplete.";
                    }
                    else
                    {
                        // Bear in mind we don't want to include the outer braces (it's currently 
                        //double braces, and we want single)
                        [embeddedTemplateResultIsError, embeddedTemplateResultText] = scriptKnapperMain(
                            thisIterationResultText.substr(braceIndex + 1, objectLength - 2),
                            templateObjectsJSON
                        );
                        
                        if(embeddedTemplateResultIsError)
                        {
                            return [
                                true,
                                embeddedTemplateResultText
                            ];
                        }
                        else
                        {
                            thisIterationResultText += embeddedTemplateResultText;
                        }
                    }
                }
                
                //Finally, add to the result to be returned.
                resultText += thisIterationResultText;
            }
        }
    }
    catch(err)
    {
        return [
            true,
            prepareErrorMessage(errPreText + err, errTemplateName, errDataJSON)
        ];
    }
    
    
    
    //Now, finally, change any @ohb and @chd in the template into single braces
    if(!resultIsError)
    {
        resultText = replaceSubstrings(resultText, [
            { from: "@ohb", to: "{" },
            { from: "@chb", to: "}" }
        ]);
    }
    
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



    


    // ----------------------------------------------------------------------------------

    

    // --------------------------------------------------------------------------------------



}