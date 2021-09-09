// The onClick method for the transpile button.
// This will call the necessary function in the function
// library, then put the generated script into the output
// textarea.
function transpileClickAction()
{
    let skMain = window.scriptknapper.scriptKnapperMain; //In the scriptKnapper library
    
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
// This will use the prepareTemplateString function in the
// library to make the requested changes to the provided
// string.
function prepareStringClickAction()
{
    const skPrepareTemplateString = window.scriptknapper.prepareTemplateString; //In the scriptKnapper library
    const stringInput = document.getElementById("prepareStringInput");
    const stringOutput = document.getElementById("prepareStringOutput");
    
    
    const whitespaceDropdown = document.getElementById("prepareStringWhitespaceDropdown");
    const escapeDoubleQuotes = document.getElementById("prepareStringEscapeDoubleQuotes");
    const replaceTags = document.getElementById("prepareStringReplaceTags");
    
	//Set the whitespaceOption (the text may need to be changed to be correct)
	let whitespaceOption;
	if(whitespaceDropdown.options[whitespaceDropdown.selectedIndex].value === "removeReplace")
	{
		whitespaceOption = "remove"; //this is the valid option in skPrepareTemplateString()
	}
	else
	{
		whitespaceOption = whitespaceDropdown.options[whitespaceDropdown.selectedIndex].value;
	}
	
	//Now run the string through the skPrepareTemplateString function,
    //and output to the prepareStringOutput textarea
    stringOutput.value = skPrepareTemplateString(
		stringInput.value, 
		whitespaceOption,
		escapeDoubleQuotes.checked,
		replaceTags.checked
	);
}







// The onClick method for the Template JSON Builder's button.
// This will change the template into a template object, and
// add it to the array in the output textbox (the array will
// be added as well if it isn't already there)
function buildTemplateJSONClickAction()
{
    const skBuildTemplateJSON = window.scriptknapper.buildTemplateJSON; //In the scriptKnapper library
    
    const templateName = document.getElementById("buildTemplateNameInput").value;
    document.getElementById("buildTemplateNameInput").value = "Template Name"; // Reset this now
    const newTemplate = document.getElementById("buildTemplateJSONInput").value;
    document.getElementById("buildTemplateJSONInput").value = "";
    const outputBox = document.getElementById("buildTemplateJSONOutput");
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
	
	
	const returnedJSON = skBuildTemplateJSON([{ templateName: templateName, template: newTemplate }]);
	outputJSON += returnedJSON.substring(2, returnedJSON.length - 2); //Remove the returned square braces
    
    outputBox.value = outputJSON + "\n]";
}