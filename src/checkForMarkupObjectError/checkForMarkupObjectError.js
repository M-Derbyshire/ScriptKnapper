import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';

/*
    Inputs:
        - markupObject: The markup object to be checked for errors
        - templateObjects: An array of template objects.
            
    Output:
        - This function will return a string. This will be
            an error if there was an error with the object, or otherwise a 
            blank string.
*/
function checkForMarkupObjectError(markupObject, templateObjects)
{
    let errPreText = "Encountered a problem parsing the provided markup JSON: ";
    
    try
    {
        // Does the markupObject have a "template" property?
        if(!markupObject.hasOwnProperty("template"))
			throw "The given template call has not been given a template property.";
        
        // If the called template doesn't exist, or if we have more then one of them
        let templateName = markupObject.template;
        let templatesMatchingName = templateObjects.filter(template => (template.name === templateName));
        if(templatesMatchingName.length === 0)
        {
            throw "The given template name (" + templateName + ") is not recognised.";
        }
        else if (templatesMatchingName.length > 1)
        {
            throw "The given template name (" + templateName + ") has more than one match.";
        }
        
        //Next, if given a data property, is it an array?
        if(markupObject.hasOwnProperty("data") && !Array.isArray(markupObject.data))
        {
            throw "The provided data to the " + markupObject.template + " template is not in an array.";
        }
    }
    catch(err)
    {
        return prepareErrorMessage(errPreText + err);
    }
    
    return "";
}

export default checkForMarkupObjectError;