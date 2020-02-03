// The onClick method for the transpile button.
// This will call the necessary function in the function
// library, then put the generated script into the output
// textarea.
function transpileClickAction()
{
    let skMain = scriptKnapperMain; //In the scriptKnapperMain library
    
    let templateInput = document.getElementById("templateInput");
    let markupInput = document.getElementById("markupInput");
    let scriptOutput = document.getElementById("scriptOutput");
    let scriptResultContainer = document.getElementById("scriptResultContainer");
    
    //The background colors to set the scriptResultContainer element
    //to (depending on whether or not an error was returned).
    let errorColor = "#FF0000";
    let successColor = "#00FF00";
    
    //Now set the output text and background color
    let [resultIsError, resultText] = skMain(markupInput.value, templateInput.value);
    
    scriptOutput.value = resultText;
    scriptResultContainer.style.backgroundColor = (resultIsError) ? errorColor : successColor;
}

