import prepareTemplateString from './prepareTemplateString.js';

const basicInput = String.raw`Testing, "testing", 
	testing {: testing :} {{: testing :}} {+ testing +}`;

test("prepareTemplateString() will not change the provided string if no changes are requested", () => {
    
    const result = prepareTemplateString(basicInput);
    
    expect(result).toEqual(basicInput);
    
});



test("prepareTemplateString() will remove whitespace (not including space characters) when requested. But it will not change anything else.", () => {
    
    const result = prepareTemplateString(basicInput, "remove");
    
    expect(result).toEqual(String.raw`Testing, "testing", testing {: testing :} {{: testing :}} {+ testing +}`);
    
});

test("prepareTemplateString() will replace whitespace (not including space characters) with space characters when requested. But it will not change anything else.", () => {
    
    const result = prepareTemplateString(basicInput, "spaceReplace");
    
    expect(result).toEqual(String.raw`Testing, "testing",   testing {: testing :} {{: testing :}} {+ testing +}`);
    
});

test("prepareTemplateString() will replace whitespace (not including space characters) with escape characters when requested. But it will not change anything else.", () => {
    
    const result = prepareTemplateString(basicInput, "escapeCodeReplace");
    
    expect(result).toEqual(String.raw`Testing, "testing", \n\ttesting {: testing :} {{: testing :}} {+ testing +}`);
});



test("prepareTemplateString() will escape double quotes when requested. But it will not change anything else.", () => {
    
    const result = prepareTemplateString(basicInput, "none", true);
    
    expect(result).toEqual(String.raw`Testing, \"testing\", 
	testing {: testing :} {{: testing :}} {+ testing +}`);
});

test("prepareTemplateString() will replace ScriptKnapper tags with replacement strings. But it will not change anything else.", () => {
    
    const result = prepareTemplateString(basicInput, "none", false, true);
    
    expect(result).toEqual(String.raw`Testing, "testing", 
	testing @ohb: testing @chb: @odhb: testing @cdhb: @ohb+ testing @chb+`);
});



test("prepareTemplateString() will make multiple changes, as requested", () => {
    
    let result = prepareTemplateString(basicInput, "remove", true, true);
    expect(result).toEqual(String.raw`Testing, \"testing\", testing @ohb: testing @chb: @odhb: testing @cdhb: @ohb+ testing @chb+`);
    
    result = prepareTemplateString(basicInput, "spaceReplace", true, true);
    expect(result).toEqual(String.raw`Testing, \"testing\",   testing @ohb: testing @chb: @odhb: testing @cdhb: @ohb+ testing @chb+`);
    
    result = prepareTemplateString(basicInput, "escapeCodeReplace", true, true);
    expect(result).toEqual(String.raw`Testing, \"testing\", \n\ttesting @ohb: testing @chb: @odhb: testing @cdhb: @ohb+ testing @chb+`);
    
});
