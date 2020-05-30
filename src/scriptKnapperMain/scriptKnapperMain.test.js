import scriptKnapperMain from './scriptKnapperMain';

const templateObjects = String.raw`[
    {"name": "simpleTemplate","template": "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know."},
    {"name": "templateLayer2","template": "this is some more data here: {:data1:}"},
    {"name": "noDataTemplate","template": "I dont need any data."}, 
    {"name": "dataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\" +} addition. {:testProp:}"}, 
    {"name": "badDataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\"  addition."}
]`;

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
    
    //Empty data array
    const markupObjects1 = JSON.stringify([{
        template: templateName,
        data: []
    }]);
    
    //No data property
    const markupObjects2 = JSON.stringify([{
        template: templateName
    }]);
    
    const [resultError1, resultText1] = scriptKnapperMain(markupObjects1, templateObjects);
    expect(typeof resultError1).toBe("boolean");
    expect(typeof resultText1).toBe("string");
    expect(resultError1).toBeFalsy();
    expect(resultText1).toContain("I dont need any data."); //Found in the "noDataTemplate" template
    
    const [resultError2, resultText2] = scriptKnapperMain(markupObjects2, templateObjects);
    expect(typeof resultError2).toBe("boolean");
    expect(typeof resultText2).toBe("string");
    expect(resultError2).toBeFalsy();
    expect(resultText2).toContain("I dont need any data.");
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


test("scriptKnapperMain will return an error caught by the checkForMarkupObjectError function", () => {
    
    //No template
    const markup = {
        data: [{}]
    };
    
    const markupObjects = JSON.stringify([markup]);
    
    const [resultError, resultText] = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultError).toBe("boolean");
    expect(typeof resultText).toBe("string");
    
    expect(resultError).toBeTruthy();
});

// --------------------------------------------------------------------------------------


test("scriptKnapperMain will not return {:, :}, {{:, :}}, {+ or +} if @ohb:, @chb:, @odhb:, @cdhb:, @ohb+, or @chb+ haven't been used", () => {
    
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
    expect(resultText).not.toContain("{:");
    expect(resultText).not.toContain(":}");
    expect(resultText).not.toContain("{{:");
    expect(resultText).not.toContain(":}}");
    expect(resultText).not.toContain("{+");
    expect(resultText).not.toContain("+}");
});

test("scriptKnapperMain will replace @ohb:, @chb:, @odhb:, @cdhb:, @ohb+, or @chb+ in the template or data with the correct string", () => {
    
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

