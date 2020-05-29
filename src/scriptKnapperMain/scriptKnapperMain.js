import populateTemplate from './../populateTemplate/populateTemplate';
import mergeObjects from './../mergeObjects/mergeObjects';
import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import replaceSubstrings from './../replaceSubstrings/replaceSubstrings';
import findObjectStringLength from './../findObjectStringLength/findObjectStringLength';
import checkForMarkupObjectError from './../checkForMarkupObjectError/checkForMarkupObjectError';
import addDataObjectAdditionsFromTemplate from '../addDataObjectAdditionsFromTemplate/addDataObjectAdditionsFromTemplate';
import removeDataAdditionTags from '../removeDataAdditionTags/removeDataAdditionTags';
import resolveInnerTemplateCalls from '../resolveInnerTemplateCalls/resolveInnerTemplateCalls';

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
        //Each markup object contains a template name, and an array of data objects
        //(which are the data to feed into the templates). Each data object is actually
        //another call to the template, so multiple data objects generate multiple
        //versions of the template.
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
            let templateObject = templateObjects.filter(template => (template.name === markupObjects[markupIter].template))[0];
            errTemplateName = templateObject.name;
            if(!markupObjects[markupIter].hasOwnProperty("data") || markupObjects[markupIter].data.length === 0) //If no data given, just run once with an empty data object
            {
                markupObjects[markupIter].data = [{}];
            }
            
            for(let dataIter = 0; dataIter < markupObjects[markupIter].data.length; dataIter++)
            {
                errDataJSON = JSON.stringify([markupObjects[markupIter].data[dataIter]]);
                
                //Add any data addition calls from the template to the data-object
                let [dataObjectAdditionIsError, dataObjectAdditionResult] = addDataObjectAdditionsFromTemplate(
                    markupObjects[markupIter].data[dataIter],
                    templateObject.template
                );
                
                if(dataObjectAdditionIsError)
                {
                    return [true, dataObjectAdditionResult];
                }
                markupObjects[markupIter].data[dataIter] = dataObjectAdditionResult;
                
                //Now remove the tags from the template
                let [additionTagsRemovalIsError, additionTagsRemovalResult] = removeDataAdditionTags(templateObject.template);
                
                if(additionTagsRemovalIsError) 
                {
                    //This shouldn't error if the additions didn't, but will check just in case of unforseen bugs
                    return [true, additionTagsRemovalResult];
                }
                templateObject.template = additionTagsRemovalResult;
                
                
                
                
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
                errPreText = "Encountered a problem parsing call to embedded template: ";
                
                const [innerTemplateResolveIsError, innerTemplateResolveResultText] = resolveInnerTemplateCalls(
                    thisIterationResultText,
                    markupObjects[markupIter].data[dataIter], //We only want the current data object here
                    templateObjects //all the templates
                );
                
                if(innerTemplateResolveIsError)
                {
                    return [
                        true,
                        innerTemplateResolveResultText
                    ];
                }
                thisIterationResultText = innerTemplateResolveResultText;
                
                
                
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
    //(If this is not an inner template call)
    if(!resultIsError)
    {
        resultText = replaceSubstrings(resultText, [
            { from: "@ohb:", to: "{:" },
            { from: "@chb:", to: ":}" },
            { from: "@odhb:", to: "{{:" },
            { from: "@cdhb:", to: ":}}" },
            { from: "@ohb+", to: "{+" },
            { from: "@chb+", to: "+}" },
        ]);
    }
    
    return [resultIsError, resultText];
}

export default scriptKnapperMain;
