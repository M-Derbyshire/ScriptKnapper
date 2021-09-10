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
		- This function will throw if there is an error.
        - This function will return a string. This will be
            the result code after it has been generated (the 
            result for all of the data objects for this template 
            call)
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
            let dataObjectAdditionResult = addDataObjectAdditionsFromTemplate(
                markupObject.data[dataIter],
                templateObject.template
            );
            
            markupObject.data[dataIter] = dataObjectAdditionResult;
            
            //Now remove the data addition tags from the template string.
            //(DON'T REPLACE the templateObject.template here, as it affects later calls to the template!)
            let additionTagsRemovalResult = removeDataAdditionTags(templateObject.template);
            
            
            
            
            //Populate the template with the data values
            let thisIterationResultText = populateTemplateWithGivenData(
                markupObject.data[dataIter],
                templateObject.name,
                additionTagsRemovalResult
            );
            
            
            
            
            //Now we need to check if there's any embedded template calls, and resolve them.
            errPreText = "Encountered a problem parsing a call to an embedded template: ";
            
            const innerTemplateResolveResultText = resolveInnerTemplateCalls(
                thisIterationResultText,
                markupObject.data[dataIter], //We only want the current data object here
                allTemplateObjects //all the templates
            );
            
            
            //Finally, add to the result to be returned.
            resultText += innerTemplateResolveResultText;
        }
    }
    catch(err)
    {
        throw Error(prepareErrorMessage(errPreText + err, templateObject.name, errDataJSON));
    }
    
    
    
    return resultText;
}

export default feedDataObjectsIntoTemplate;