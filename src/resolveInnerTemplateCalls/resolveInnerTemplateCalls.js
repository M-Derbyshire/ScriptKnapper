import findObjectStringLength from '../findObjectStringLength/findObjectStringLength';
import mergeObjects from '../mergeObjects/mergeObjects';
import prepareErrorMessage from '../prepareErrorMessage/prepareErrorMessage';
import scriptKnapperMain from '../scriptKnapperMain/scriptKnapperMain';

function resolveInnerTemplateCalls(thisIterationResultText, dataObject, templateObjects)
{
    let braceIndex;
    let objectLength;
    let errPreText = "Error handling embedded template call: "; //The first part of the string to feed into prepareErrorMessage()
    
    while((braceIndex = thisIterationResultText.indexOf("{{:")) > -1)
    {
        objectLength = findObjectStringLength(thisIterationResultText.substring(braceIndex));
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
            // Bear in mind, we don't want to include the outer braces (it's currently 
            //double braces, then a colon. We want single braces)
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
            
            //merge this with the current data object
            let mergedDataObject = { template: innerMarkupObject.template, data: [] };
            for(let i = 0; i < innerMarkupObject.data.length; i++)
            {
                mergedDataObject.data[i] = mergeObjects([
                    innerMarkupObject.data[i], 
                    ...dataObject.data
                ]);
            }
            
            
            let [embeddedTemplateResultIsError, embeddedTemplateResultText] = scriptKnapperMain(
                JSON.stringify([mergedDataObject]),
                JSON.stringify(templateObjects)
            );
            
            if(embeddedTemplateResultIsError)
            {
                console.log(embeddedTemplateResultText);
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
    
    
    return [
        false,
        thisIterationResultText
    ];
}

export default resolveInnerTemplateCalls;