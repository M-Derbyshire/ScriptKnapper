import prepareErrorMessage from './../prepareErrorMessage/prepareErrorMessage';
import findObjectStringLength from './../findObjectStringLength/findObjectStringLength';
import replaceSubstrings from './../replaceSubstrings/replaceSubstrings';
import mergeObjects from './../mergeObjects/mergeObjects';

/*
    Inputs:
        - dataObject: This is the object with the data to be
                    entered into the template.
        - templateName: This is the name of the template to
                    use.
        - templateObjects: The function requires the full 
                    list of templates, as it may need to pass 
                    more data to another template, within the 
                    current one.
        - dataHandlerFunc: This is the function that handles
                    the full array of data. It felt best to
                    pass this here for the sake of decoupling.
                    I didn't just want to call the function,
                    without it being passed in.
            
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

function populateTemplate(dataObject, templateName, templateObjects, dataHandlerFunc)
{
    // Firstly, get the template object, or deal with the templateName being incorrect
    let templatesMatchingName = templateObjects.filter(template => (template.name === templateName));
    if(templatesMatchingName.length === 0)
    {
        return [
            true,
            prepareErrorMessage(
                    "The given template name (" + templateName + ") is not recognised."
                )
        ];
    }
    else if (templatesMatchingName.length > 1)
    {
        return [
            true,
            prepareErrorMessage(
                    "The given template name (" + templateName + ") has more than one match."
                )
        ];
    }
    
    
    let resultText = templatesMatchingName[0].template;
    let resultIsError = false;
    let errPreText; //The first part of the string to feed into prepareErrorMessage()
    let braceIndex; //The index of the first brace in the string that is being searched 
                    //for braces
    let objectLength; //Length of the object string that is being worked with
    let propertyName; //The name of the dataObject property that will replace property call
    let innerResultError = false; // The error esult of a call to another template
    let newTextSegment; // The text that will replace a property/template call
    
    while ((braceIndex = resultText.indexOf("{")) > -1)
    {
        //Go through the template, looking for things to replace, and determine what 
        //property from the dataObject to replace them with. If there are double braces
        //("{{"), then this is another template; if it is just single braces, then the
        //text between the braces will be the key for the property in the dataObject.
        
        try
        {
            //------------- Is this a double brace? If so, we need to parse to an object and pass that ---------
            //------------- to the dataHandlerFunc.
            
            errPreText = "ScriptKnapper encountered an issue when attempting to resolve a template call within another template: ";
            
            if((resultText.length - 1 > braceIndex) && (resultText.charAt(braceIndex + 1) === "{"))
            {
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
                console.log(mergedDataObject);
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
            else
            {
                //----------------- If this is surrounded by single braces, then this should be a property in the 
                //------------------dataObject 
                
                errPreText = "ScriptKnapper encountered an issue when attempting to resolve a call to the requested data: ";
                
                objectLength = findObjectStringLength(resultText.substring(braceIndex));
                if(objectLength === -1)
                {
                    throw "Encountered an incomplete call to a data property.";
                }
                
                propertyName = resultText.substring(braceIndex + 1, braceIndex + objectLength - 1).trim();
                
                if(dataObject.hasOwnProperty(propertyName))
                {
                    if(typeof dataObject[propertyName] === "string")
                    {
                        newTextSegment = dataObject[propertyName];
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
            if(!innerResultError)
            {
                resultText = prepareErrorMessage(errPreText + err, templateName, JSON.stringify(dataObject));
            }
            else
            {
                resultText = err;
            }
            
            resultIsError = true;
            break;
        }
        
        // Now replace the substring with the property/template value
        resultText = resultText.substring(0, braceIndex) + newTextSegment + resultText.substring(braceIndex + objectLength);
    }
    
    //Now, change any @ohb and @chd in the template into single braces
    if(!resultIsError)
    {
        resultText = replaceSubstrings(resultText, [
            { from: "@ohb", to: "{" },
            { from: "@chb", to: "}" }
        ]);
    }
    
    return [resultIsError, resultText];
}

export default populateTemplate;