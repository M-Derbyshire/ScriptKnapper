import checkForMarkupObjectError from './checkForMarkupObjectError';

const templateObjects = '[{"name": "simpleTemplate","template": "this is { data1 }, and that is {data2}, and over there is {data3 }. Watch out for @ohb and @chb, you know."},{"name": "templateLayer2","template": "this is some more data here: {data1}"},{"name": "noDataTemplate","template": "I don\'t need any data."}]';

test("checkForMarkupObjectError will return an error if it cannot find the requested template", () => {
    
    const templateName = "nonexistentTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: "theData2",
                data3: "theData3" 
            },
        ]
    };
    
    const markupObject = JSON.stringify(markup);
    
    const [resultError, resultText] = checkForMarkupObjectError(markupObject, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("checkForMarkupObjectError will return an error if the given data object is not an array", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: "data"
    };
    
    const markupObject = JSON.stringify(markup);
    
    const [resultError, resultText] = checkForMarkupObjectError(markupObject, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("scriptKnapperMain will return an error if a given embedded template request object doesn't have a template property", () => {
    
    const templateName = "simpleTemplate";
    
    // No template
    const markup = {
        data: [
            { 
                data1: "theData1", 
                data2: "testTemplate: {{: sjdhfsjdhfkjsdhf :}} - This is now the string again. ",
                data3: "theData3" 
            }
        ]
    };
    
    const markupObject = JSON.stringify(markup);
    
    const [resultError, resultText] = checkForMarkupObjectError(markupObject, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    expect(resultError).toBeTruthy();
});