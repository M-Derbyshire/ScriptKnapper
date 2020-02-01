import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';

/*
    Inputs:
        - markupObject: The markup object to be checked for errors
        - templateObjects: An array of template objects.
            
    Output:
        - This function will return an array with 2 values,
            to be destructured by the caller.
        - The first value will be a boolean, which is true
            if there was an error, or otherwise false. 
        - The second value will be a string. This will be
            an error if there was a problem, or otherwise a 
            blank string.
*/
function checkForMarkupObjectError(markupObject, templateObjects)
{
    let errPreText = "Encountered a problem parsing the provided markup JSON: ";
    
    try
    {
        // Firstly, get the template string, or deal with the called template not existing
        let templateText;
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
        
        //Next, is the data property an array?
        if(!Array.isArray(markupObject.data))
        {
            throw "The provided data to the " + markupObject.template + " template is not in an array.";
        }
    }
    catch(err)
    {
        return [
            true,
            prepareErrorMessage(errPreText + err)
        ];
    }
    
    return [false, ""];
}

export default checkForMarkupObjectError;