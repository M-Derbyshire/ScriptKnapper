/*
    ScriptKnapper: Build 1.1.
    
    The entry point for UIs to use is scriptKnapperMain(). See the comments for
    this function below to understand what it needs, and what will be returned.
    
    Changes in this build:
    - Fixed bug that was causing some parameters to not be resolved if more
        than one template call followed it.
*/

// scriptKnapperMain ---------------------------------------------------------------------

/*
    Inputs:
        - markupObjectsJSON: This is the JSON with the data to be
                    entered into the template.
        - templateObjectsJSON: This is the JSON which is used when
                    generating errors.
        - isInnerTemplate: A boolean value. Is this call for a
                    template within a template?
            
    Output:
        - This function will return an array with 2 values,
            to be destructured by the caller.
        - The first value will be a boolean, which is true
            if there was an error, or otherwise false. 
        - The second value will be a string. This will be
            the result code after it has been generated, 
            or an error if there was a problem during the
            process.
*/
function scriptKnapperMain(markupObjectsJSON, templateObjectsJSON, isInnerTemplate = false)
{
    let resultIsError = false;
    let resultText = "";
    let errPreText; //The first part of the string to feed into prepareErrorMessage()
    let errTemplateName = ""; //The current template name to feed into prepareErrorMessage()
    let errDataJSON = ""; // the current data object, in string form, to feed into prepareErrorMessage()
    
    // Try to parse the JSON data into objects, and make sure everything is correct
    let markupObjects, templateObjects;
    try
    {
        errPreText = "Encountered a problem parsing the provided template JSON: ";
        templateObjects = JSON.parse(templateObjectsJSON);
        
        errPreText = "Encountered a problem parsing the provided markup JSON: ";
        markupObjects = JSON.parse(markupObjectsJSON);
        
        //Start looping through the markup objects (and every data object with them)
        //Each markup object contains a template name, and an array of data objects
        //(which are the data to feed into the templates). Each data object is actually
        //another call to the template, so multiple data objects generate multiple
        //versions of the template.
        for(let markupIter = 0; markupIter < markupObjects.length; markupIter++)
        {
            // If there is an issue with this markup object, return the error
            let [markupHasError, markupCheckText] = checkForMarkupObjectError(markupObjects[markupIter], templateObjects);
            if(markupHasError)
            {
                return [
                    true,
                    markupCheckText
                ];
            }
            
            
            //Populate the template with the provided data, and add to the result
            //(for every passed data object).
            let templateObject = templateObjects.filter(template => (template.name === markupObjects[markupIter].template))[0];
            errTemplateName = templateObject.name;
            if(markupObjects[markupIter].data.length === 0) //If no data given, just run once with an empty data object
            {
                markupObjects[markupIter].data = [{}];
            }
            
            for(let dataIter = 0; dataIter < markupObjects[markupIter].data.length; dataIter++)
            {
                errDataJSON = JSON.stringify([markupObjects[markupIter].data[dataIter]]);
                
                //Populate the template with the data values
                let [thisIterationResultIsError, thisIterationResultText] = populateTemplate(
                    markupObjects[markupIter].data[dataIter],
                    templateObject.name,
                    templateObject.template
                );
                
                if(thisIterationResultIsError)
                {
                    return [
                        true,
                        thisIterationResultText
                    ];
                }
                
                //Now we need to check if there's any embedded template calls,
                //and resolve them.
                let braceIndex;
                let objectLength;
                while((braceIndex = thisIterationResultText.indexOf("{{")) > -1)
                {
                    errPreText = "Encountered a problem parsing call to embedded template: ";
                    
                    objectLength = findObjectStringLength(thisIterationResultText.substring(braceIndex));
                    if(objectLength === -1)
                    {
                        throw "Embedded template object is invalid or incomplete.";
                    }
                    else
                    {
                        // Bear in mind we don't want to include the first outer braces (it's currently 
                        //double braces, and we want single)
                        let innerMarkupObject = JSON.parse(thisIterationResultText.substr(braceIndex + 1, objectLength - 2));
                        
                        //merge this with the current data object
                        let mergedDataObject = { template: innerMarkupObject.template, data: [] };
                        for(let i = 0; i < innerMarkupObject.data.length; i++)
                        {
                            mergedDataObject.data[i] = mergeObjects([
                                innerMarkupObject.data[i], 
                                markupObjects[markupIter].data[dataIter]
                            ]);
                        }
                        
                        let [embeddedTemplateResultIsError, embeddedTemplateResultText] = scriptKnapperMain(
                            JSON.stringify([mergedDataObject]),
                            templateObjectsJSON,
                            true
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
                            // Replace the template call with its result
                            thisIterationResultText = 
                                thisIterationResultText.substring(0, braceIndex) + 
                                embeddedTemplateResultText +
                                thisIterationResultText.substring(braceIndex + objectLength);
                        }
                    }
                }
                
                //Finally, add to the result to be returned.
                resultText += thisIterationResultText;
            }
        }
    }
    catch(err)
    {
        return [
            true,
            prepareErrorMessage(errPreText + err, errTemplateName, errDataJSON)
        ];
    }
    
    
    
    //Now, finally, change any @ohb and @chd in the template into single braces
    //(If this is not an inner template call)
    if(!resultIsError && !isInnerTemplate)
    {
        resultText = replaceSubstrings(resultText, [
            { from: "@ohb", to: "{" },
            { from: "@chb", to: "}" }
        ]);
    }
    
    return [resultIsError, resultText];
}

// populateTemplate ---------------------------------------------------------------------

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
    while (resultText.substring(searchStartIndex).includes("{"))
    {
        //This will find the index of the brace in the context of the whole template string, but
        //it will ignore any braces before the searchStartIndex
        braceIndex = searchStartIndex + resultText.substring(searchStartIndex).indexOf("{");
        
        try
        {
            errPreText = "ScriptKnapper encountered an issue when attempting to resolve a call to the requested data: ";
            
            //If this is surrounded by single braces, then this should be a property in the 
            //dataObject. If by double braces, then this is a template call, and we need to
            //move the searchStartIndex to the index after this, and then move on.
            let objectLength;
            if(resultText.charAt(braceIndex + 1) === "{") //Is this a double brace (template call)?
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
                let propertyName = resultText.substring(braceIndex + 1, braceIndex + objectLength - 1).trim();
                
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

// checkForMarkupObjectError ---------------------------------------------------------------------

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
        // Does the markupObject have both a "data" and "template" property?
        if(!markupObject.hasOwnProperty("data")) { throw "The given template call has not been given a data property."; }
        if(!markupObject.hasOwnProperty("template")) { throw "The given template call has not been given a template property."; }
        
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

// findObjectStringLength ---------------------------------------------------------------------

/*
    Inputs:
        - objectText: The string of text that will contain the 
                    object. This string should begin with the 
                    opening brace.
    Output:
        - This function will return the length of the substring
            that makes up this object (including the handlebar 
            braces).
        - If the object in the string is not complete, or it
            doesn't contain an object, this function will 
            return -1.
*/

function findObjectStringLength(objectText)
{
    if(objectText.length < 2 || objectText.charAt(0) !== "{")
    {
        return -1;
    }
    
    
    let layer = 0; // There may be objects in the object, so
                    // what "layer" are we on?
    let currentChar = "";
    let i = 0; // We want to use this later when returning
    
    while(i < objectText.length)
    {
        currentChar = objectText.charAt(i);
        
        if(currentChar == "{")
        {
            layer++;
        }
        else if (currentChar == "}")
        {
            layer--;
            
            if(layer === 0)
            {
                return i + 1; // This is now the length to return
            }
        }
        
        i++;
    }
    
    return -1; //If we are here, then layer must be greater than 0
}

// mergeObjects ---------------------------------------------------------------------

/*
    Inputs:
        - objects: An array of objects to merge. The objects are
            prioritised based on their order in the array. So 
            if the first and second objects both have a property
            with the same name, the value in the first object will
            be passed into the new object for that property.
            
    Output:
        - This function will return an object, that is a merge of 
            the provided objects.
    
*/

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

// prepareErrorMessage ---------------------------------------------------------------------

/*
    Inputs:
        - message: A message to be included in the error.
        - templateName (optional): If this error occurred while working on a 
            template, the template name can be passed here, so the error
            can include it.
        - dataJSONString (optional): The JSON object (parsed to string), that
            contains the data that was being used to populate the template,
            so the error can include it.
            
    Output:
        - This function will return a string.
        - The string will contain the provided message within it.
        - If the templateName was provided, the string will reference this.
        - If the dataJSONString was provided, the string will reference this.
    
*/
function prepareErrorMessage(message, templateName = "", dataJSONString = "")
{
    let result = "TRANSPILATION ERROR\n\nError while transpiling script from provided JSON:\n\n";
    result += message + "\n\n";
    
    if(templateName !== "")
    {
        result += "Error occurred in the following template: " + templateName;
        
        //Only want one line break if dataJSONString has been provided as well,
        //but need to bear in mind that dataJSONString may have been provided
        //without templateName
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

// replaceSubstrings ---------------------------------------------------------------------

/*
    Inputs:
        - text: The string that needs characters/substrings
            replacing.
        - replacements: An array of objects that define
            what needs to be replaced, and what to replace 
            them with. Each object will have a "from" property
            (the substring to search for) and a "to" property
            (the substring to replace the "from" with).
            
    Output:
        - This function will return a string.
        - The string will be the contents of
            the "text" parameter, except with
            the requested replacements made.
*/

function replaceSubstrings(text, replacements)
{
    //Using RegEx means all matches are changed, and can be case-insensitive.
    let fromRegEx;
    
    // This seems to be a collection, so .foreach just won't work.
    for(let i = 0; i < replacements.length; i++)
    {
        fromRegEx = new RegExp(replacements[i].from, 'gi');
        text = text.replace(fromRegEx, replacements[i].to);
    }
    
    return text;
}