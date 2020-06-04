/*

ScriptKnapper version: 2.0


The entry point for UIs to use is scriptKnapperMain():

scriptKnapperMain Inputs:
 - markupObjectsJSON: This is the JSON with the data to be entered into the templates.
 - templateObjectsJSON: This is the JSON containing all of the template objects.

scriptKnapperMain Output:
 - This function will return an array with 2 values, to be destructured by the caller.
 - The first value will be a boolean, which is true if there was an error, or otherwise false. 
 - The second value will be a string. This will be the result code after it has been generated, or an error if there was a problem during the process.

-----------------------------------------------------------

Changes in this build:
 - Changed the templating syntax to use tags that will be otherwise unlikely to occur in the user's scripts. Didn't want to make such a drastic change, but felt it was best as the project is in such an early stage, and the change does make the most sense.
 - The replaceSubstrings() function can now accept values that contain Regex special characters.
 - Major refactor of scriptKnapperMain(), which was a bloated function.
 - If calling a template that doesn't require any data, the user no longer needs to pass in an empty array -- or any data property at all.
 - findObjectStringLength() now takes in the opening and closing brace strings as parameters, to ensure that any handlebar braces used within any data values will not confuse the function.

-----------------------------------------------------------

You can download the development source code for this library from GitHub:

https://github.com/M-Derbyshire/ScriptKnapper

-----------------------------------------------------------

*/



function addDataObjectAdditionsFromTemplate(dataObject, template)
{
     
    let errPreText= "ScriptKnapper encountered an issue when attempting to add data from a template to the data object: ";
    let braceIndex; 
    
    
    let currentlyUnsearchedString = template;
    
    while (currentlyUnsearchedString.includes("{+"))
    {
        braceIndex = currentlyUnsearchedString.indexOf("{+");
        
        let objectLength = findObjectStringLength(
            currentlyUnsearchedString.substring(braceIndex, currentlyUnsearchedString.length),
            "{+",
            "+}"
        );
        if(objectLength < 0) 
        {
            return [true, errPreText + "Data addition tag was not properly closed."];
        }
        
        
        
        
        let newData;
        try
        {
            
            newData = JSON.parse("{" + currentlyUnsearchedString.substring(braceIndex + 2, braceIndex + objectLength - 2) + "}");
        }
        catch(err)
        {
            return [true, errPreText + err];
        }
        
        
        
        dataObject = mergeObjects([newData, dataObject]);
        
        
        
        currentlyUnsearchedString = currentlyUnsearchedString.substring(braceIndex + objectLength, currentlyUnsearchedString.length);
    }
    
    return [false, dataObject];
}






function checkForMarkupObjectError(markupObject, templateObjects)
{
    let errPreText = "Encountered a problem parsing the provided markup JSON: ";
    
    try
    {
        
        if(!markupObject.hasOwnProperty("template")) { throw "The given template call has not been given a template property."; }
        
        
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
        
        
        if(markupObject.hasOwnProperty("data") && !Array.isArray(markupObject.data))
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






function feedDataObjectsIntoTemplate(templateObject, markupObject, allTemplateObjects)
{
    let resultText = "";
    let errDataJSON = "No data JSON is available for this exception."; 
    let errPreText = "Error when attempting to feed data into a template: "; 
    
    try 
    {
        for(let dataIter = 0; dataIter < markupObject.data.length; dataIter++)
        {
            errDataJSON = JSON.stringify([markupObject.data[dataIter]]);
            
            
            let [dataObjectAdditionIsError, dataObjectAdditionResult] = addDataObjectAdditionsFromTemplate(
                markupObject.data[dataIter],
                templateObject.template
            );
            if(dataObjectAdditionIsError) return [true, dataObjectAdditionResult];
            
            markupObject.data[dataIter] = dataObjectAdditionResult;
            
            
            
            
            let [additionTagsRemovalIsError, additionTagsRemovalResult] = removeDataAdditionTags(templateObject.template);
            if(additionTagsRemovalIsError) return [true, additionTagsRemovalResult];
            
            
            
            
            
            let [thisIterationResultIsError, thisIterationResultText] = populateTemplateWithGivenData(
                markupObject.data[dataIter],
                templateObject.name,
                additionTagsRemovalResult
            );
            if(thisIterationResultIsError) return [true, thisIterationResultText];
            
            
            
            
            
            errPreText = "Encountered a problem parsing a call to an embedded template: ";
            
            const [innerTemplateResolveIsError, innerTemplateResolveResultText] = resolveInnerTemplateCalls(
                thisIterationResultText,
                markupObject.data[dataIter], 
                allTemplateObjects 
            );
            if(innerTemplateResolveIsError) return [true, innerTemplateResolveResultText];
            
            
            
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






function findObjectStringLength(objectText, startBraceString = "{", endBraceString = "}")
{
    if(!objectText.startsWith(startBraceString)) return -1;
    
    
    let layer = 0; 
                    
    let i = 0; 
    
    while(i < objectText.length)
    {
        if(objectText.substr(i, startBraceString.length) == startBraceString)
        {
            layer++;
        }
        else if (objectText.substr(i, endBraceString.length) == endBraceString)
        {
            layer--;
            
            if(layer === 0)
            {
                return i + endBraceString.length; 
            }
        }
        
        i++;
    }
    
    return -1; 
}






function mergeObjects(objects)
{
    let resultObject = {};
    
    for(let objIter = 0; objIter < objects.length; objIter++)
    {
        for(let prop in objects[objIter])
        {
            if(!resultObject.hasOwnProperty(prop))
            {
                resultObject[prop] = objects[objIter][prop];
            }
        }
    }
    
    return resultObject;
}







function populateTemplateWithGivenData(dataObject, templateName, template)
{
    let resultText = template;
    let resultIsError = false;
    let errPreText; 
    let braceIndex; 
                    
    let searchStartIndex = 0; 
                              
                              
    
    
    
    while (resultText.substring(searchStartIndex).includes("{:"))
    {
        
        
        
        braceIndex = searchStartIndex + resultText.substring(searchStartIndex).indexOf("{:");
        
        try
        {
            errPreText = "ScriptKnapper encountered an issue when attempting to resolve a call to the requested data: ";
            
            
            
            
            let objectLength;
            if(resultText.charAt(braceIndex - 1) === "{") 
            {
                objectLength = findObjectStringLength(resultText.substring(braceIndex - 1), "{{:", ":}}");
                
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
                objectLength = findObjectStringLength(resultText.substring(braceIndex), "{:", ":}");
                
                if(objectLength === -1)
                {
                    throw "Encountered an incomplete call to a data property.";
                }
                
                
                let propertyName = resultText.substring(braceIndex + 2, braceIndex + objectLength - 2).trim();
                
                if(dataObject.hasOwnProperty(propertyName))
                {
                    if(typeof dataObject[propertyName] === "string")
                    {
                        
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





function prepareErrorMessage(message, templateName = "", dataJSONString = "")
{
    let result = "TRANSPILATION ERROR\n\nError while transpiling script from provided JSON:\n\n";
    result += message + "\n\n";
    
    if(templateName !== "")
    {
        result += "Error occurred in the following template: " + templateName;
        
        
        
        
        result += (dataJSONString === "") ? "\n\n" : "\n";
    }
    
    if(dataJSONString !== "")
    {
        result += "Error occurred with the following markup data: " + dataJSONString;
        result += "\n\n";
    }
    
    result += "Please correct these issues with the provided JSON, and then try again.";
    
    return result;
}







function removeDataAdditionTags(templateString)
{
    let errPreText = "ScriptKnapper encountered an issue when attempting to add data from a template to the data object: ";
    let braceIndex; 
    let objectLength; 
    
    while (templateString.includes("{+"))
    {
        braceIndex = templateString.indexOf("{+");
        
        objectLength = findObjectStringLength(
            templateString.substring(braceIndex, templateString.length),
            "{+",
            "+}"
        );
        if(objectLength < 0) 
        {
            return [true, errPreText + "Data addition tag was not properly closed."];
        }
        
        templateString = templateString.substring(0, braceIndex) + templateString.substring(braceIndex + objectLength);
    }
    
    return [false, templateString];
}






function replaceSubstrings(text, replacements)
{
    
    let fromRegEx;
    
    
    for(let i = 0; i < replacements.length; i++)
    {
        
        const specialCharsEscaped = replacements[i].from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        fromRegEx = new RegExp(specialCharsEscaped, 'gi');
        text = text.replace(fromRegEx, replacements[i].to);
    }
    
    return text;
}






function replaceTagStringSubstitutions(text)
{
    return replaceSubstrings(text, [
        { from: "@ohb:", to: "{:" },
        { from: "@chb:", to: ":}" },
        { from: "@odhb:", to: "{{:" },
        { from: "@cdhb:", to: ":}}" },
        { from: "@ohb+", to: "{+" },
        { from: "@chb+", to: "+}" },
    ]);
}






function resolveAllMarkupObjects(markupObjects, templateObjects)
{
    let resultText = "";
    let errTemplateName = ""; 
    let errDataObject; 
    let templateObject; 
    let matchingTemplateObjects; 
                                 
    
    try
    {
        for(let markupIter = 0; markupIter < markupObjects.length; markupIter++)
        {
            
            let [markupHasError, markupCheckText] = checkForMarkupObjectError(markupObjects[markupIter], templateObjects);
            if(markupHasError) return [true, markupCheckText];
            
            
            
            
            
            templateObject = templateObjects.filter(template => (template.name === markupObjects[markupIter].template))[0];
            
            
            errTemplateName = templateObject.name;
            errDataObject = markupObjects[markupIter].data;
            
            
            
            
            
            
            if(!markupObjects[markupIter].hasOwnProperty("data") || markupObjects[markupIter].data.length === 0)
            {
                markupObjects[markupIter].data = [{}];
            }
            
            let [dataObjectsResultIsError, dataObjectsResultText] = feedDataObjectsIntoTemplate(
                templateObject, 
                markupObjects[markupIter], 
                templateObjects
            );
            if(dataObjectsResultIsError) return [true, dataObjectsResultText];
            
            
            resultText += dataObjectsResultText;
        }
    }
    catch(err)
    {
        const errPreText = "Error when generating a markup object's instructions: "
        
        return [
            true,
            prepareErrorMessage(
                errPreText + err, 
                errTemplateName,
                JSON.stringify(errDataObject)
            )
        ];
    }
    
    return [false, resultText];
}







function resolveInnerTemplateCalls(thisIterationResultText, dataObject, templateObjects)
{
    let braceIndex; 
    let objectLength; 
    let errPreText = "Error handling embedded template call: "; 
    
    while((braceIndex = thisIterationResultText.indexOf("{{:")) > -1)
    {
        objectLength = findObjectStringLength(thisIterationResultText.substring(braceIndex), "{{:", ":}}");
        if(objectLength === -1)
        {
            return [
                true,
                prepareErrorMessage(
                    errPreText + "Embedded template object is invalid or incomplete.", 
                    "Unable to determine the template called within an embedded template call.",
                    JSON.stringify(dataObject)
                )
            ];
        }
        else
        {
            let innerMarkupObject; 
            try
            {
                
                
                innerMarkupObject = JSON.parse(
                    "{" + thisIterationResultText.substring(braceIndex + 3, braceIndex + objectLength - 3) + "}"
                );
            }
            catch(err)
            {
                return [
                    true,
                    prepareErrorMessage(
                        errPreText + "Embedded template object is invalid.", 
                        "Unable to determine the template called within an embedded template call.",
                        JSON.stringify(dataObject)
                    )
                ];
            }
            
            
            let mergedDataObject = { template: innerMarkupObject.template, data: [] };
            for(let i = 0; i < innerMarkupObject.data.length; i++)
            {
                mergedDataObject.data[i] = mergeObjects([
                    innerMarkupObject.data[i], 
                    dataObject
                ]);
            }
            
            
            
            let [embeddedTemplateResultIsError, embeddedTemplateResultText] = resolveAllMarkupObjects(
                [mergedDataObject], 
                templateObjects
            );
            
            if(embeddedTemplateResultIsError)
            {
                return [
                    true,
                    embeddedTemplateResultText
                ];
            }
            else
            {
                
                thisIterationResultText = 
                    thisIterationResultText.substring(0, braceIndex) + 
                    embeddedTemplateResultText +
                    thisIterationResultText.substring(braceIndex + objectLength);
            }
        }
    }
    
    
    return [
        false,
        thisIterationResultText
    ];
}






function scriptKnapperMain(markupObjectsJSON, templateObjectsJSON)
{
    let resultText = "";
    let errPreText; 
    
    
    let markupObjects, templateObjects;
    try
    {
        errPreText = "Encountered a problem parsing the provided template JSON: ";
        templateObjects = JSON.parse(templateObjectsJSON);
        
        errPreText = "Encountered a problem parsing the provided markup JSON: ";
        markupObjects = JSON.parse(markupObjectsJSON);
        
        
        
        
        
        
        let [resolveMarkupIsError, resolveMarkupText] = resolveAllMarkupObjects(markupObjects, templateObjects);
        if(resolveMarkupIsError) return [true, resolveMarkupText];
        
        resultText = resolveMarkupText;
    }
    catch(err)
    {
        return [
            true,
            prepareErrorMessage(
                errPreText + err, 
                "No template name is available for this error.", 
                "No data JSON is available for this error."
            )
        ];
    }
    
    
    
    
    resultText = replaceTagStringSubstitutions(resultText);
    
    
    return [false, resultText];
}



