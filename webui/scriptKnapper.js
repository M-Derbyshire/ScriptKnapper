/*

ScriptKnapper version: 3.0.0


The entry point for UIs to use is scriptKnapperMain():

You may also want to make use of the prepareTemplateString() and buildTemplateJSON() functions in your project's build scripts. These should help when converting your templates into the correct JSON format.
-----------------------------------------------------------

scriptKnapperMain() details:

Inputs:
    - markupObjectsJSON: This is the JSON with the data to be entered into the template.
    - templateObjectsJSON: This is the JSON with the different templates.
            
Output:
    - This function will return an array with 2 values, to be destructured by the caller.
    - The first value will be a boolean, which is true if there was an error, or otherwise false. 
    - The second value will be a string. This will be the generated code/script, or an error if there was a problem during the process.

-----------------------------------------------------------

prepareTemplateString() details:

Inputs:
    - passedTemplateString: The string to be changed.
    - whitespaceChange: How should the whitespace (not including space characters) in the string be handled? There are 4 options:
        "none": Whitespace will not be changed.
        "remove": Whitespace will just be removed.
        "spaceReplace": Whitespace will be replaced with space characters.
        "escapeCodeReplace": Whitespace will be replaced with escape codes.
    - escapeDoubleQuotes: A boolean value. Should double-quote characters be escaped?
    - replaceTags: A boolean value. Should ScriptKnapper tags be replaced with their respective replacement strings?
            
Output:
    - This function will return a string, that has been changed based on the input settings.

-----------------------------------------------------------

buildTemplateJSON() details:

Inputs:
    - templates: An array of objects. Each object will have 2 properties: a "templateName" and a "template" (which is the text of the template).
    - templatesAlreadyPrepared: A boolean value. Has the template text already been prepared?
        
Output:
    - This function will return a JSON string, which will contain all of the given templates, in the structure required by scriptKnapperMain(). If templatesAlreadyPrepared is false, double quote characters will be escaped, and whitespace characters (such as tabs and new-lines, but not spaces) will be replaced with escape codes.

-----------------------------------------------------------

Changes in this build:
 - Added the prepareTemplateString() and buildTemplateJSON() functions. prepareTemplateString() can be used to prepare template text. buildTemplateJSON() takes an array of objects (each with a template name, and template text) and then generates the template JSON from that.

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







function buildTemplateJSON(templates, templatesAlreadyPrepared = false)
{
	let result = "[";
	
	templates.forEach(template => {
		
		let templateText = template.template;
		
		if(!templatesAlreadyPrepared)
		{
			templateText = replaceSubstrings(
				templateText,
				[
					{ from: "\t", to: String.raw`\t` },
					{ from: "\v", to: String.raw`\v` },
					{ from: "\r", to: String.raw`\r` },
					{ from: "\n", to: String.raw`\n` },
					{ from: '"', to: String.raw`\"` }
				]
			);
		}
		
		
		if(result.charAt(result.length - 1) === "}") result += ",";
		
		result += '\n\t{ "name": "' + template.templateName + '", "template": "' + templateText + '" }';
	});
	
	return result + "\n]";
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
        resultObject = {
            ...objects[objIter],
            ...resultObject
        };
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







function prepareTemplateString(passedTemplateString, whitespaceChange = "none", 
    escapeDoubleQuotes = false, replaceTags = false)
{
    let replacementOptions = []; 
    
    
    if(whitespaceChange !== "none")
    {
        if(whitespaceChange === "remove")
        {
            replacementOptions.push(
                { from: "\t", to: "" },
                { from: "\v", to: "" },
                { from: "\r", to: "" },
                { from: "\n", to: "" },
            );
        } 
        else if(whitespaceChange === "spaceReplace")
        {
            replacementOptions.push(
                { from: "\t", to: " " },
                { from: "\v", to: " " },
                { from: "\r", to: " " },
                { from: "\n", to: " " },
            );
        }
        else if(whitespaceChange === "escapeCodeReplace")
        {
            replacementOptions.push(
                { from: "\t", to: String.raw`\t` },
                { from: "\v", to: String.raw`\v` },
                { from: "\r", to: String.raw`\r` },
                { from: "\n", to: String.raw`\n` },
            );
        }
    }
    
    
    if(escapeDoubleQuotes)
    {
        replacementOptions.push(
            { from: '"', to: String.raw`\"` }
        );
    }
    
    if(replaceTags)
    {
        
        
        replacementOptions.push(
            { from: "{{:", to: "@odhb:" },
            { from: ":}}", to: "@cdhb:" },
            { from: "{:", to: "@ohb:" },
            { from: ":}", to: "@chb:" },
            { from: "{+", to: "@ohb+" },
            { from: "+}", to: "@chb+" }
        );
    }
    
    
    return replaceSubstrings(passedTemplateString, replacementOptions);
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




exports.scriptKnapperMain = scriptKnapperMain;
exports.prepareTemplateString = prepareTemplateString;
exports.buildTemplateJSON = buildTemplateJSON;