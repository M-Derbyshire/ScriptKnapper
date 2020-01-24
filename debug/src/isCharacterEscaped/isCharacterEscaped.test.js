import isCharacterEscaped from './isCharacterEscaped';

test("isCharacterEscaped will return false if the length of the given string is less than 2", () => {
    
    const text1 = "n";
    const text2 = "";
    
    const result1 = isCharacterEscaped(text1);
    const result2 = isCharacterEscaped(text2);
    
    expect(result1).toBeFalsy();
    expect(result2).toBeFalsy();
    
});

// ------------------------------------------------------------------------------

test("isCharacterEscaped will return true if the only character is escaped", () => {
    
    const text = String.raw`\n`;
    
    const result = isCharacterEscaped(text);
    
    expect(result).toBeTruthy();
    
});

test("isCharacterEscaped will return false if the only character is not escaped", () => {
    
    const text = String.raw`n`;
    
    const result = isCharacterEscaped(text);
    
    expect(result).toBeFalsy();
    
});

// ----------------------------------------------------------------------------------

test("isCharacterEscaped will return true if character is escaped with multiple backslashes", () => {
    
    const text = String.raw`\\\n`;
    
    const result = isCharacterEscaped(text);
    
    expect(result).toBeTruthy();
    
});

test("isCharacterEscaped will return false if character is not escaped with multiple backslashes", () => {
    
    const text = String.raw`\\\\n`;
    
    const result = isCharacterEscaped(text);
    
    expect(result).toBeFalsy();
    
});

// --------------------------------------------------------------------------------

test("isCharacterEscaped will return true if character is escaped in long string", () => {
    
    const text = String.raw`hello \n`;
    
    const result = isCharacterEscaped(text);
    
    expect(result).toBeTruthy();
    
});

test("isCharacterEscaped will return false if character is not escaped in long string", () => {
    
    const text = String.raw`hello n`;
    
    const result = isCharacterEscaped(text);
    
    expect(result).toBeFalsy();
    
});