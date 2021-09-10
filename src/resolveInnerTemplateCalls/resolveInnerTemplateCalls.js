import findObjectStringLength from '../findObjectStringLength/findObjectStringLength';
import mergeObjects from '../mergeObjects/mergeObjects';
import prepareErrorMessage from '../prepareErrorMessage/prepareErrorMessage';
import resolveAllMarkupObjects from '../resolveAllMarkupObjects/resolveAllMarkupObjects';

/*
    Inputs:
        - thisIterationResultText: The text that may contain inner-template
            calls.
        - dataObject: This is the data object for the current data iteration.
        - templateObjects: This is the array of template objects.
            
    Output:
        - This function will throw if there is an error.
        - This function will return a string. This will be
            the given text, with inner-templates resolved.
*/

function resolveInnerTemplateCalls(thisIterationResultText, dataObject, templateObjects)
{
    let braceIndex; //The starting position of the next unresolved template call.
    let objectLength; //The character length of the template call
    let errPreText = "Error handling embedded template call: "; //The first part of the string to feed into prepareErrorMessage()
    
    while((braceIndex = thisIterationResultText.indexOf("{{:")) > -1)
    {
        objectLength = findObjectStringLength(thisIterationResultText.substring(braceIndex), "{{:", ":}}");
        if(objectLength === -1)
        {
            throw new Error(prepareErrorMessage(
				errPreText + "Embedded template object is invalid or incomplete.", 
				"Unable to determine the template called within an embedded template call.",
				JSON.stringify(dataObject)
			));
        }
        else
        {
            let innerMarkupObject; //The template call object in the string
            try
            {
                // Bear in mind, we don't want to include the outer braces (it's currently 
                //double braces, then a colon. We just want single braces)
                innerMarkupObject = JSON.parse(
                    "{" + thisIterationResultText.substring(braceIndex + 3, braceIndex + objectLength - 3) + "}"
                );
            }
            catch(err)
            {
                throw new Error(prepareErrorMessage(
					errPreText + "Embedded template object is invalid.", 
					"Unable to determine the template called within an embedded template call.",
					JSON.stringify(dataObject)
				));
            }
            
            //Merge any data objects in the template call with the current data object
            let mergedDataObject = { template: innerMarkupObject.template, data: [] };
            for(let i = 0; i < innerMarkupObject.data.length; i++)
            {
                mergedDataObject.data[i] = mergeObjects([
                    innerMarkupObject.data[i], 
                    dataObject
                ]);
            }
            
            //Now feed the data and template objects back through this process,
            //to be treated like a regular template call.
            let embeddedTemplateResultText = resolveAllMarkupObjects(
                [mergedDataObject], 
                templateObjects
            );
            
			
			
			// Replace the template call with its result
			thisIterationResultText = 
				thisIterationResultText.substring(0, braceIndex) + 
				embeddedTemplateResultText +
				thisIterationResultText.substring(braceIndex + objectLength);
        }
    }
    
    
    return thisIterationResultText;
}

export default resolveInnerTemplateCalls;