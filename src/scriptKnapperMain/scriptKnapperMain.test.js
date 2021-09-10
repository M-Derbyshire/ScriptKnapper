import scriptKnapperMain from './scriptKnapperMain';

const templateObjects = String.raw`[
    {"name": "simpleTemplate","template": "this is {: data1 :}, and that is {:data2:}, and over there is {:data3 :}. Watch out for @ohb:, @chb:, @odhb:, @cdhb:, @ohb+ and @chb+ you know."},
    {"name": "templateLayer2","template": "this is some more data here: {:data1:}"},
    {"name": "noDataTemplate","template": "I dont need any data."}, 
    {"name": "dataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\" +} addition. {:testProp:}"}, 
    {"name": "badDataAdditionTemplate", "template": "Test {+ \"testProp\": \"test\"  addition."}
]`;


//-------------------------------------------------------------------------------------------

test.each([
	[
		"fksdjfkdjfksjfkdjfklsjf",
		templateObjects
	],
	[
		JSON.stringify([
			{
				template: "simpleTemplate",
				data: [
					{ 
						data1: "theData1", 
						data2: "theData2",
						data3: "theData3" 
					},
				]
			}
		]),
		"khdjashkjahsdkjashd"
	]
])("scriptKnapperMain will return an error if the given markup or template JSON isn't valid", (markupObjects, templateObjects) => {
    
    const resultText = scriptKnapperMain(markupObjects, templateObjects);
    
	expect(() => {
		scriptKnapperMain(markupObjects, templateObjects);
	}).toThrow(Exception);
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
    
    const resultText = scriptKnapperMain(markupObjectsJSON, templateObjects);
    
    expect(typeof resultText).toBe("string");
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
    
	
	expect(() => {
		scriptKnapperMain(markupObjects, templateObjects);
	}).toThrow(Exception);
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
    
    const resultText = scriptKnapperMain(markupObjects, templateObjects);
    
    expect(typeof resultText).toBe("string");
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

