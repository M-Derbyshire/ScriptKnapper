import replaceTagStringSubstitutions from '../replaceTagStringSubstitutions/replaceTagStringSubstitutions';


test("replaceTagStringSubstitutions will replace @ohb:, @chb:, @odhb:, @cdhb:, @ohb+, or @chb+ in the given text and return", () => {
    
    const text = "@ohb: @odhb: @ohb+ testData2 @chb+ @cdhb: @chb:";
    
    const resultText = replaceTagStringSubstitutions(text);
    
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