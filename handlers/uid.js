const buildFields = (instance, field, value) => {
    // Do nothing if value is not set.
    if (value === null || value === undefined) return instance;
    instance = instance || {};
    // Non-array fields
    if (!instance[field]) {
      instance[field] = value;
      return instance;
    }
    // Array fields  
    if (instance[field] instanceof Array) {
      instance[field].push(value);
    } else {
      instance[field] = [instance[field], value];
    }
    return instance;
  };

  module.exports = {buildFields};