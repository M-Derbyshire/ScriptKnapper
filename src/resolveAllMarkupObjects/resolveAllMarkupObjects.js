import checkForMarkupObjectError from '../checkForMarkupObjectError/checkForMarkupObjectError';
import feedDataObjectsIntoTemplate from '../feedDataObjectsIntoTemplate/feedDataObjectsIntoTemplate';
import prepareErrorMessage from '../prepareErrorMessage/prepareErrorMessage';

/*
    Inputs:
        - markupObjects: This is an array of the markup objects 
                    to be acted on. Each markup object contains 
                    a template name, and an array of data objects
                    (which are the data to feed into the templates).
        - templateObjects: This is an array of template objects.
            
    Output:
        - This function will throw if there is an error.
        - This function will return a string. This will be
            the generated code/script.
*/
function resolveAllMarkupObjects(markupObjects, templateObjects)
{
    let resultText = "";
    let errTemplateName = ""; //The current template name to feed into prepareErrorMessage()
    let errDataObject; // the current data object to feed into prepareErrorMessage()
    let templateObject; //The template object for each markup object
    let matchingTemplateObjects; //The template objects that match the template name in the markup object 
                                 //(Should only ever be one).
    
    try
    {
        for(let markupIter = 0; markupIter < markupObjects.length; markupIter++)
        {
            //Check for any errors in the markup object (will return an empty string if not)
            let markupCheckText = checkForMarkupObjectError(markupObjects[markupIter], templateObjects);
            if(markupCheckText !== "") throw markupCheckText;
            
            
            //Get the correct template object for this markup object
            //(checkForMarkupObjectError() has already confirmed this template exists)
            templateObject = templateObjects.filter(template => (template.name === markupObjects[markupIter].template))[0];
            
            //Update the objects that will be fed into prepareErrorMessage()
            errTemplateName = templateObject.name;
            errDataObject = markupObjects[markupIter].data;
            
            
            
            //Populate the template with the provided data, and add to the result
            //(for every passed data object). If no data is given, just run once 
            //with an empty data object
            if(!markupObjects[markupIter].hasOwnProperty("data") || markupObjects[markupIter].data.length === 0)
            {
                markupObjects[markupIter].data = [{}];
            }
            
            let dataObjectsResultText = feedDataObjectsIntoTemplate(
                templateObject, 
                markupObjects[markupIter], 
                templateObjects
            );
            
            
            resultText += dataObjectsResultText;
        }
    }
    catch(err)
    {
        const errPreText = "Error when resolving a markup object: "
        
        throw new Error(prepareErrorMessage(
                errPreText + err, 
                errTemplateName,
                JSON.stringify(errDataObject)
            ));
    }
    
    return resultText;
}

export default resolveAllMarkupObjects;