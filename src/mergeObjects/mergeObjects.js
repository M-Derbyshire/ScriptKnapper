/*
    Inputs:
        - objects: An array of objects to merge. The objects are
            prioritised based on their order in the array. So 
            if the first and second objects both have a property
            with the same name, the value in the first object will
            be passed into the new object for that property.
            
    Output:
        - This function will return an object, that is a merge of 
            the provided objects.
    
*/

function mergeObjects(objects)
{
    let resultObject = {};
    
    for(let objIter = 0; objIter < objects.length; objIter++)
    {
        for(let prop in objects[objIter])
        {
            if(!resultObject.hasOwnProperty(prop))
            {
                resultObject[prop] = objects[objIter][prop];
            }
        }
    }
    
    return resultObject;
}

export default mergeObjects;