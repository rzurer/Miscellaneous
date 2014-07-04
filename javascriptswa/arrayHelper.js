/*globals $, define */
define([], function () {
    "use strict";
    var helper = {
        addUnique: function (array, item) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        },
        hasDefinedProperties: function (array, propertyName) {
            var propertyValue, result;
            if (!array) {
                return false;
            }
            result = false;
            array.forEach(function (item) {
                propertyValue = item[propertyName];
                if (propertyValue) {
                    result = true;
                }
            });
            return result;
        },
        getDefinedPropertyValues: function (array, propertyName, wantUnique) {
            var propertyValue, result;
            if (!array) {
                return [];
            }
            result = [];
            array.forEach(function (item) {
                propertyValue = item[propertyName];
                if (propertyValue) {
                    if (wantUnique && result.indexOf(propertyValue) === -1) {
                        result.push(propertyValue);
                    } else {
                        result.push(propertyValue);
                    }
                }
            });
            return result;
        },
        toDictionary: function (array, keyProperty, valueProperty) {
            var dictionary, key;
            dictionary = {};
            array.forEach(function (item) {
                key = item[keyProperty];
                if (!dictionary.hasOwnProperty(key)) {
                    dictionary[key] = [];
                }
                dictionary[key].push(valueProperty ? item[valueProperty] : item);
            });
            return dictionary;
        },
        getProperties: function (obj) {
            var property, properties;
            properties = [];
            for (property in obj) {
                if (obj.hasOwnProperty(property)) {
                    properties.push(property);
                }
            }
            return properties;
        },
        splitArray: function (array, count) {
            var length, arrayLength, divider, i, arrays, remainder, remainderArray;
            length = array.length;
            if (length === 0) {
                return [];
            }
            divider = Math.floor(length / count);
            remainder = length % count;
            arrays = [];
            arrays.push(array.slice(0, divider));
            arrayLength = arrays[0].length;
            for (i = 1; i < count; i += 1) {
                arrays.push(array.slice(arrayLength, arrayLength + divider));
                arrayLength += divider;
            }
            if (remainder > 0) {
                remainderArray = array.slice(array.length - remainder);
                remainderArray.forEach(function (item) {
                    arrays[arrays.length - 1].push(item);
                });
            }
            return arrays;
        }
    };
    return helper;
});