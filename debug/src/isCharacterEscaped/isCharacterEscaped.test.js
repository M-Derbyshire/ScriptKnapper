import isCharacterEscaped from './isCharacterEscaped';

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