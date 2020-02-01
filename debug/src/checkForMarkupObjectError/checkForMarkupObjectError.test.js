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

test("scriptKnapperMain will return an error if a given embedded template request object doesn't have the right properties", () => {
    
    const templateName = "simpleTemplate";
    
    //No data
    const markup1 = {
        template: templateName
    };
    
    // No template
    const markup2 = {
        data: [
            { 
                data1: "theData1", 
                data2: "testTemplate: {{ sjdhfsjdhfkjsdhf }} - This is now the string again. ",
                data3: "theData3" 
            }
        ]
    };
    
    const markupObject1 = JSON.stringify(markup1);
    
    const markupObject2 = JSON.stringify(markup2);
    
    const [resultError1, resultText1] = checkForMarkupObjectError(markupObject1, templateObjects);
    const [resultError2, resultText2] = checkForMarkupObjectError(markupObject2, templateObjects);
    
    expect(typeof resultError1).toBe("boolean");
    expect(typeof resultText1).toBe("string");
    expect(typeof resultError2).toBe("boolean");
    expect(typeof resultText2).toBe("string");
    
    expect(resultError1).toBeTruthy();
    expect(resultError2).toBeTruthy();
});