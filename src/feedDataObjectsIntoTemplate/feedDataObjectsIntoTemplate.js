import addDataObjectAdditionsFromTemplate from '../addDataObjectAdditionsFromTemplate/addDataObjectAdditionsFromTemplate';
import removeDataAdditionTags from '../removeDataAdditionTags/removeDataAdditionTags';
import populateTemplateWithGivenData from '../populateTemplateWithGivenData/populateTemplateWithGivenData';
import resolveInnerTemplateCalls from '../resolveInnerTemplateCalls/resolveInnerTemplateCalls';
import prepareErrorMessage from '../prepareErrorMessage/prepareErrorMessage';

/*
    Inputs:
        - templateObject: This is the object with the 
                    template name, and the template itself.
        - markupObject: This is an array of data objects,
                    to be fed into the template, one by one.
        - allTemplateObjects: This is an array of all of the
                    template objects (This is needed when
                    calling resolveInnerTemplateCalls()).
            
    Output:
        - This function will return an array with 2 values,
            to be destructured by the caller.
        - The first value will be a boolean, which is true
            if there was an error, or otherwise false. 
        - The second value will be a string. This will be
            the result code after it has been generated (the 
            result for all of the data objects for this template 
            call), or it will be an error if there was a problem 
            during the process.
*/
function feedDataObjectsIntoTemplate(templateObject, markupObject, allTemplateObjects)
{
    let resultText = "";
    let errDataJSON = "No data JSON is available for this exception."; //the JSON string of the current data object, to be passed to prepareErrorMessage()
    let errPreText = "Error when attempting to feed data into a template: "; //Used when calling prepareErrorMessage()
    
    try //no uncaught exceptions should be thrown here, but just in case
    {
        for(let dataIter = 0; dataIter < markupObject.data.length; dataIter++)
        {
            errDataJSON = JSON.stringify([markupObject.data[dataIter]]);
            
            //Add any data addition calls from the template to the data-object
            let [dataObjectAdditionIsError, dataObjectAdditionResult] = addDataObjectAdditionsFromTemplate(
                markupObject.data[dataIter],
                templateObject.template
            );
            if(dataObjectAdditionIsError) return [true, dataObjectAdditionResult];
            
            markupObject.data[dataIter] = dataObjectAdditionResult;
            
            //Now remove the data addition tags from the template.
            //This shouldn't error if the adding the additions didn't, but will check just in case of unforseen bugs
            let [additionTagsRemovalIsError, additionTagsRemovalResult] = removeDataAdditionTags(templateObject.template);
            if(additionTagsRemovalIsError) return [true, additionTagsRemovalResult];
            
            templateObject.template = additionTagsRemovalResult;
            
            
            
            
            //Populate the template with the data values
            let [thisIterationResultIsError, thisIterationResultText] = populateTemplateWithGivenData(
                markupObject.data[dataIter],
                templateObject.name,
                templateObject.template
            );
            if(thisIterationResultIsError) return [true, thisIterationResultText];
            
            
            
            
            //Now we need to check if there's any embedded template calls, and resolve them.
            errPreText = "Encountered a problem parsing a call to an embedded template: ";
            
            const [innerTemplateResolveIsError, innerTemplateResolveResultText] = resolveInnerTemplateCalls(
                thisIterationResultText,
                markupObject.data[dataIter], //We only want the current data object here
                allTemplateObjects //all the templates
            );
            if(innerTemplateResolveIsError) return [true, innerTemplateResolveResultText];
            
            
            //Finally, add to the result to be returned.
            resultText += innerTemplateResolveResultText;
        }
    }
    catch(err)
    {
        return [
            true,
            prepareErrorMessage(errPreText + err, templateObject.name, errDataJSON)
        ];
    }
    
    
    
    return [false, resultText];
}

export default feedDataObjectsIntoTemplate;