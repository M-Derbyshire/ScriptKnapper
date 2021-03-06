import scriptKnapperMain from './scriptKnapperMain';

const templateObjects = String.raw`[
    {"name": "simpleTemplate","template": "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know."},
    {"name": "templateLayer2","template": "this is some more data here: {:data1:}"},
    {"name": "noDataTemplate","template": "I dont need any data."}, 
    {"name": "dataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\" +} addition. {:testProp:}"}, 
    {"name": "badDataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\"  addition."}
]`;


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

// --------------------------------------------------------------------------------------

test("scriptKnapperMain will return the results from resolveAllMarkupObjects()", () => {
    
    const templateName = "simpleTemplate";
    
    const markupObjectsJSON = JSON.stringify([{
        template: templateName,
        data: [
            { data1: "theData1", data2: "theData2", data3: "theData3" }
        ]
    }]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjectsJSON, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeFalsy();
    expect(resultText).toContain("theData1");
    expect(resultText).toContain("theData2");
    expect(resultText).toContain("theData3");
});


test("scriptKnapperMain will return an error that is returned from resolveAllMarkupObjects()", () => {
    
    const templateName = "simpleTemplate";
    
    const markupObjectsJSON = JSON.stringify([{
        template: templateName,
        data: [{}] //This template requires data, but none given
    }]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjectsJSON, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

// --------------------------------------------------------------------------------------

test("scriptKnapperMain will call replaceTagStringSubstitutions() and return the replacements", () => {
    
    const templateName = "simpleTemplate";
    
    const markup = {
        template: templateName,
        data: [
            { 
                data1: "testData1",
                data2: "@ohb: @odhb: @ohb+ testData2 @chb+ @cdhb: @chb:",
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
    expect(resultText).not.toContain("@ohb:");
    expect(resultText).not.toContain("@chb:");
    expect(resultText).not.toContain("@odhb:");
    expect(resultText).not.toContain("@cdhb:");
    expect(resultText).not.toContain("@ohb+");
    expect(resultText).not.toContain("@chb+");
    expect(resultText).toContain("{:");
    expect(resultText).toContain(":}");
    expect(resultText).toContain("{{:");
    expect(resultText).toContain(":}}");
    expect(resultText).toContain("{+");
    expect(resultText).toContain("+}");
});

// -----------------------------------------------------------------

