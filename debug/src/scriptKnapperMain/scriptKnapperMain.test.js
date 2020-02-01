import scriptKnapperMain from './scriptKnapperMain';

const templateObjects = '[{"name": "simpleTemplate","template": "this is { data1 }, and that is {data2}, and over there is {data3 }. Watch out for @ohb and @chb, you know."},{"name": "templateLayer2","template": "this is some more data here: {data1}"},{"name": "noDataTemplate","template": "I don\'t need any data."}]';

//-----------------------------------------------------------------------------------

test("scriptKnapperMain will return results for each markup object it is given, and for each data object in those", () => {
    
    const templateName = "simpleTemplate";
    
    const markup1 = {
        template: templateName,
        data: [
            { data1: "theData1", data2: "theData2", data3: "theData3" },
            { data1: "theData4", data2: "theData5", data3: "theData6" },
        ]
    };
    
    const markup2 = {
        template: templateName,
        data: [
            { data1: "theData7", data2: "theData8", data3: "theData9" }
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup1,
        markup2
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theData1");
    expect(resultText).toContain("theData2");
    expect(resultText).toContain("theData3");
    expect(resultText).toContain("theData4");
    expect(resultText).toContain("theData5");
    expect(resultText).toContain("theData6");
    expect(resultText).toContain("theData7");
    expect(resultText).toContain("theData8");
    expect(resultText).toContain("theData9");
});

test("scriptKnapperMain will generate a template once, with an empty data object, if no data is given for it", () => {
    
    const templateName = "noDataTemplate";
    
    const markup = {
        template: templateName,
        data: []
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("I don't need any data.");
});

// -----------------------------------------------------------------------------------

test("scriptKnapperMain will embed the results of another template into the result, when given one (returning result for all data objects passed)", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: 'testTemplate: {{"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData1" }, { "data1": "theEmbeddedData2" }] }} - This is now the string again. ', 
                data3: "theData3" 
            },
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theEmbeddedData1");
    expect(resultText).toContain("theEmbeddedData2");
});

test("scriptKnapperMain will embed the results of a template call within an inner template call into the result", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: 'testTemplate: {{"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData" }, { "data1": "{{ "template": "templateLayer2", "data": [{ "data1": "theDeepEmbeddedData" } }}" }] }} - This is now the string again. ',
                data3: "theData3" 
            },
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theEmbeddedData");
    expect(resultText).toContain("theDeepEmbeddedData");
});



//-------------------------------------------------------------------------------------------

test("scriptKnapperMain will return an error if the given markup or template JSON isn't valid", () => {
    
    const markupObjects1 = "fksdjfkdjfksjfkdjfklsjf";
    const templateObjects1 = templateObjects;
    
    
    const markup2 = {
        template: "simpleTemplate",
        data: [
            { 
                data1: "theData1", 
                data2: "theData2",
                data3: "theData3" 
            },
        ]
    };
    
    const markupObjects2 = JSON.stringify([
        markup2
    ]);
    
    const templateObjects2 = "khdjashkjahsdkjashd";
    
    const [resultError1, resultText1] = scriptKnapperMain(markupObjects1, templateObjects1);
    const [resultError2, resultText2] = scriptKnapperMain(markupObjects2, templateObjects2);
    
    expect(typeof resultError1).toBe("boolean");
    expect(typeof resultText1).toBe("string");
    expect(typeof resultError2).toBe("boolean");
    expect(typeof resultText2).toBe("string");
    
    expect(resultError1).toBeTruthy();
    expect(resultError2).toBeTruthy();
});

test("scriptKnapperMain will return an error if a given embedded template request object isn't complete", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: 'testTemplate: {{"template": "templateLayer2", "data": [{ "data1": "theEmbeddedData1" THERE SHOULD BE A CLOSE BRACE HERE, { "data1": "theEmbeddedData2" }] }} - This is now the string again. ',
                data3: "theData3" 
            },
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

test("scriptKnapperMain will return an error if a given embedded template request object can't be parsed", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: "testTemplate: {{ sjdhfsjdhfkjsdhf }} - This is now the string again. ",
                data3: "theData3" 
            },
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
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
    
    const markupObjects1 = JSON.stringify([
        markup1
    ]);
    
    const markupObjects2 = JSON.stringify([
        markup2
    ]);
    
    const [resultError1, resultText1] = scriptKnapperMain(markupObjects1, templateObjects);
    const [resultError2, resultText2] = scriptKnapperMain(markupObjects2, templateObjects);
    
    expect(typeof resultError1).toBe("boolean");
    expect(typeof resultText1).toBe("string");
    expect(typeof resultError2).toBe("boolean");
    expect(typeof resultText2).toBe("string");
    
    expect(resultError1).toBeTruthy();
    expect(resultError2).toBeTruthy();
});

// --------------------------------------------------------------------------------------

test("scriptKnapperMain will insert data that has been passed down from another template", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1", 
                data2: '{{ "template": "templateLayer2", "data": [{"data1": "hello, {data3}"}] }}',
                data3: "theData3" 
            }
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("hello, testData3");
});


// --------------------------------------------------------------------------------------------------

test("scriptKnapperMain will not return { or } in its string if @ohb/@chb haven't been used", () => {
    
    const templateName = "templateLayer2"; //This template doesn't use @ohb/@chb
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "theData1"
            }
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).not.toContain("{");
    expect(resultText).not.toContain("}");
});

test("scriptKnapperMain will replace any @ohb/@chb in the template or data with open/closing handlebars", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "testData1",
                data2: "@ohb testData2 @chb",
                data3: "testData3"
            }
        ]
    };
    
    const markupObjects = JSON.stringify([
        markup
    ]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).not.toContain("@ohb");
    expect(resultText).not.toContain("@chb");
    expect(resultText).toContain("{");
    expect(resultText).toContain("}");
});
