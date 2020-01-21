// The onClick method for the transpile button.
// This will call the necessary function in the function
// library, clear the template and markup textareas, and
// then put the generated script into the output textarea.
function transpileClickAction()
{
    // To be replaced by the actual function
    let testFun = (templateText, markupText) => {
        return templateText + "\n" + markupText + "\ntest complete";
    }
    
    let templateInput = document.getElementById("templateInput");
    let markupInput = document.getElementById("markupInput");
    
    // We don't want to clear the output if the inputs are empty.
    if(templateInput.value !== "" && markupInput.value !== "")
    {
        document.getElementById("scriptOutput").value = testFun(templateInput.value, markupInput.value);
        templateInput.value = "";
        markupInput.value = "";
    }
}