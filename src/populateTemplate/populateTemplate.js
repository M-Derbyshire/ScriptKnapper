import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import findObjectStringLength from './../findObjectStringLength/findObjectStringLength';

/*
    Inputs:
        - dataObject: This is the object with the data to be
                    entered into the template.
        - templateName: This is string, which is used when
                    generating errors.
        - template: This is a string, which is the template 
                    to use.
            
    Output:
        - This function will return an array with 2 values,
            to be destructured by the caller.
        - The first value will be a boolean, which is true
            if there was an error, or otherwise false. 
        - The second value will be a string. This will be
            the template after it has been populated with
            the given data, or an error if there was a 
            problem populating the tmplate.
*/

function populateTemplate(dataObject, templateName, template)
{
    let resultText = template;
    let resultIsError = false;
    let errPreText; //The first part of the string to feed into prepareErrorMessage()
    let braceIndex; //The index of the first brace in the substring that is being searched 
                    //for braces
    let searchStartIndex = 0; //The index to start the search from (this is moved after every
                              //template replacement, to stop the function trying to resolve 
                              //templates that are fed into this template).
    
    //Go through the template, looking for things to replace, and determine what 
    //property from the dataObject to replace them with.
    while (resultText.substring(searchStartIndex).includes("{:"))
    {
        //This will find the index of the {: in the context of the whole template string, but
        //it will ignore any braces before the searchStartIndex (meaning we can skip over 
        //inner-template calls).
        braceIndex = searchStartIndex + resultText.substring(searchStartIndex).indexOf("{:");
        
        try
        {
            errPreText = "ScriptKnapper encountered an issue when attempting to resolve a call to the requested data: ";
            
            //If this is surrounded by {: and :}, then this should be a property in the 
            //dataObject. If by {{: and :}}, then this is a template call, and we need to
            //move the searchStartIndex to the index after this, and then move on.
            let objectLength;
            if(resultText.charAt(braceIndex - 1) === "{") //Is this a double brace (template call)?
            {
                objectLength = findObjectStringLength(resultText.substring(braceIndex));
                
                if(objectLength === -1)
                {
                    throw "Encountered an incorrectly formatted call to a template.";
                }
                else
                {
                    searchStartIndex = braceIndex + objectLength;
                }
            }
            else
            {
                objectLength = findObjectStringLength(resultText.substring(braceIndex));
                
                if(objectLength === -1)
                {
                    throw "Encountered an incomplete call to a data property.";
                }
                
                //We want to get the property name, but ignore any whitespace around it
                let propertyName = resultText.substring(braceIndex + 2, braceIndex + objectLength - 2).trim();
                
                if(dataObject.hasOwnProperty(propertyName))
                {
                    if(typeof dataObject[propertyName] === "string")
                    {
                        // Now replace the substring with the property's value
                        resultText = resultText.substring(0, braceIndex) + dataObject[propertyName] + resultText.substring(braceIndex + objectLength);
                    }
                    else
                    {
                        throw "Encountered a call to a property (" + propertyName + ") that did not contain a string.";
                    }
                }
                else
                {
                    throw "Encountered a call to a property (" + propertyName + ") that hasn't been passed to the template.";
                }
            }
        }
        catch(err)
        {
            resultText = prepareErrorMessage(errPreText + err, templateName, JSON.stringify(dataObject));
            resultIsError = true;
            break;
        }
    }
    
    return [resultIsError, resultText];
}

export default populateTemplate;