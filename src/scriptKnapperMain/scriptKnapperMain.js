import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import resolveAllMarkupObjects from '../resolveAllMarkupObjects/resolveAllMarkupObjects';
import replaceTagStringSubstitutions from '../replaceTagStringSubstitutions/replaceTagStringSubstitutions';

/*
    Inputs:
        - markupObjectsJSON: This is the JSON with the data to be
                    entered into the template.
        - templateObjectsJSON: This is the JSON with the different
                    templates.
            
    Output:
        - This function will throw if there is an error.
        - This function will return a string. This will be
            the generated code/script.
*/
function scriptKnapperMain(markupObjectsJSON, templateObjectsJSON)
{
    let resultText = "";
    let errPreText; //The first part of the string to feed into prepareErrorMessage()
    
    // Try to parse the JSON data into objects
    let markupObjects, templateObjects;
    try
    {
        errPreText = "Encountered a problem parsing the provided template JSON: ";
        templateObjects = JSON.parse(templateObjectsJSON);
        
        errPreText = "Encountered a problem parsing the provided markup JSON: ";
        markupObjects = JSON.parse(markupObjectsJSON);
    }
    catch(err)
    {
        throw new Error(prepareErrorMessage(
			errPreText + err, 
			"No template name is available for this error.", 
			"No data JSON is available for this error."
		));
    }
	
	//Go through the markup objects (and every data object within them).
	//Each markup object contains a template name, and an array of data objects
	//(which are the data to feed into the templates). Each data object is actually
	//another call to the template, so multiple data objects generate the template
	//multiple times.
	let resolveMarkupText = resolveAllMarkupObjects(markupObjects, templateObjects);
    
    
    
    //Now, finally, change any tag string substitions in the result text into the correct tag string.
    resultText = replaceTagStringSubstitutions(resolveMarkupText);
    
    
    return resultText;
}

export default scriptKnapperMain;