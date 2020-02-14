// The onClick method for the transpile button.
// This will call the necessary function in the function
// library, then put the generated script into the output
// textarea.
function transpileClickAction()
{
    let skMain = scriptKnapperMain; //In the scriptKnapper library
    
    let templateInput = document.getElementById("templateInput");
    let markupInput = document.getElementById("markupInput");
    let scriptOutput = document.getElementById("scriptOutput");
    let scriptResultContainer = document.getElementById("scriptResultContainer");
    
    //The background colors to set the scriptResultContainer element
    //to (depending on whether or not an error was returned).
    let errorColor = "#FF0000";
    let successColor = "#00FF00";
    let darkTextColor = "#0C114A"; // Text colour to be used in result container
                                    //because the background becomes darker.
    
    //Now set the output text and background color
    let [resultIsError, resultText] = skMain(markupInput.value, templateInput.value);
    
    scriptOutput.value = resultText;
    scriptResultContainer.style.backgroundColor = (resultIsError) ? errorColor : successColor;
    scriptResultContainer.style.color = darkTextColor;
}










// The onClick method for the Prepare a String tool's button.
// This will use the replaceSubstrings function in the
// library to make the requested changes to the provided
// string.
function prepareStringClickAction()
{
    let skReplaceSubStrings = replaceSubstrings; //In the scriptKnapper library
    let stringInput = document.getElementById("prepareStringInput");
    let stringOutput = document.getElementById("prepareStringOutput");
    
    
    let whitespaceDropdown = document.getElementById("prepareStringWhitespaceDropdown");
    let escapeDoubleQuotes = document.getElementById("prepareStringEscapeDoubleQuotes");
    let replaceHandlebars = document.getElementById("prepareStringReplaceHandlebars");
    
    let replacementOptions = [];
    
    //Add options to be given to the skReplaceSubStrings function
    if(whitespaceDropdown.options[whitespaceDropdown.selectedIndex].value === "removeReplace")
    {
        replacementOptions.push(
            { from: "\t", to: "" },
            { from: "\v", to: "" },
            { from: "\r", to: "" },
            { from: "\n", to: "" },
        );
    }
    
    if(whitespaceDropdown.options[whitespaceDropdown.selectedIndex].value === "spaceReplace")
    {
        replacementOptions.push(
            { from: "\t", to: " " },
            { from: "\v", to: " " },
            { from: "\r", to: " " },
            { from: "\n", to: " " },
        );
    }
    
    if(whitespaceDropdown.options[whitespaceDropdown.selectedIndex].value === "escapeCodeReplace")
    {
        replacementOptions.push(
            { from: "\t", to: String.raw`\t` },
            { from: "\v", to: String.raw`\v` },
            { from: "\r", to: String.raw`\r` },
            { from: "\n", to: String.raw`\n` },
        );
    }
    
    if(escapeDoubleQuotes.checked)
    {
        replacementOptions.push(
            { from: '"', to: String.raw`\"` }
        );
    }
    
    if(replaceHandlebars.checked)
    {
        replacementOptions.push(
            { from: "{", to: "@ohb" },
            { from: "}", to: "@chb" }
        );
    }
    
    //Now run the string through the skReplaceSubStrings function,
    //and output to the prepareStringOutput textarea
    stringOutput.value = skReplaceSubStrings(stringInput.value, replacementOptions);
}







// The onClick method for the Template JSON Builder's button.
// This will change the template into a template object, and
// add it to the array in the output textbox (the array will
// be added as well if it isn't already there)
function buildTemplateJSONClickAction()
{
    let skReplaceSubStrings = replaceSubstrings; //In the scriptKnapper library
    let skObjectStringLength  = findObjectStringLength; //In the scriptKnapper library
    
    let templateName = document.getElementById("buildTemplateNameInput").value;
    document.getElementById("buildTemplateNameInput").value = "Template Name"; // Reset this now
    let newTemplate = document.getElementById("buildTemplateJSONInput").value;
    document.getElementById("buildTemplateJSONInput").value = "";
    let outputBox = document.getElementById("buildTemplateJSONOutput");
    let outputJSON = outputBox.value;
    
    
    
    //First, if the array isn't set up in the output box, add the opening brace (closing comes later)
    if(outputJSON.charAt(0) !== "[" || outputJSON.substring(outputJSON.length - 1) !== "]")
    {
        outputJSON = "[\n";
    }
    else 
    {
        //If the array is there, remove the closing brace (we'll add it again later, after the new template).
        //We also want to add a comma to the last template object
        outputJSON = outputJSON.substring(0, outputJSON.length - 2);
        outputJSON = outputJSON.substring(0, outputJSON.lastIndexOf("}") + 1)
            + ","
            + outputJSON.substring(outputJSON.lastIndexOf("}") + 1)
            + "\n";
    }
    
    
    
    // Now replace all the whiteSpace, and escape any double-quotes
    newTemplate = skReplaceSubStrings(
        newTemplate,
        [
            { from: "\t", to: String.raw`\t` },
            { from: "\v", to: String.raw`\v` },
            { from: "\r", to: String.raw`\r` },
            { from: "\n", to: String.raw`\n` },
            { from: '"', to: String.raw`\"` }
        ]
    );
    
    
    //Now put together the full template object, and add it to the JSON.
    outputJSON += '\t{ "name": "' + templateName + '", "template": "' + newTemplate + '" }\n]';
    
    
    outputBox.value = outputJSON;
}